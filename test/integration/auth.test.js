import request from "supertest";
import app from "../../src/app.js";
import { cleanDatabase, createTestUser, closeTestDb } from "../helpers/testDb.js";

describe("Authentication Integration Tests", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user and set HTTP-only cookie", async () => {
      const payload = {
        email: "student@university.edu",
        password: "SecurePassword123!",
        fullName: "John Doe",
        organization: "Engineering Faculty",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(payload.email);
      expect(res.body.data.user.role).toBe("USER");
      expect(res.body.data.token).toBeDefined();

      // Check HTTP-only cookie
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes("token=") && c.includes("HttpOnly"))).toBe(true);
    });

    it("should reject registration with already registered email", async () => {
      await createTestUser({ email: "duplicate@university.edu" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@university.edu",
          password: "SecurePassword123!",
          fullName: "Another Person",
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it("should reject registration with invalid password complexity", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "simple@university.edu",
          password: "simplepassword",
          fullName: "Simple User",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in successfully with valid credentials and return token", async () => {
      const { user, rawPassword } = await createTestUser({
        email: "validuser@university.edu",
        password: "ValidPassword123!",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: user.email,
          password: rawPassword,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(user.email);
      expect(res.body.data.token).toBeDefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes("token=") && c.includes("HttpOnly"))).toBe(true);
    });

    it("should reject login with wrong password", async () => {
      const { user } = await createTestUser({
        email: "wrongpass@university.edu",
        password: "CorrectPassword123!",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: user.email,
          password: "IncorrectPassword123!",
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it("should reject login for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "ghost@university.edu",
          password: "SomePassword123!",
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return profile for authenticated user via Bearer token", async () => {
      const { user, token } = await createTestUser({ email: "profile@university.edu" });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it("should return profile for authenticated user via HTTP-only cookie", async () => {
      const { user, token } = await createTestUser({ email: "cookie@university.edu" });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/auth/me").expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the session cookie", async () => {
      const res = await request(app).post("/api/auth/logout").expect(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers["set-cookie"];
      expect(cookies.some((c) => c.includes("token=;"))).toBe(true);
    });
  });
});

