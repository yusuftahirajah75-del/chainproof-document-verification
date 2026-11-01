import request from "supertest";
import app from "../../src/app.js";
import { cleanDatabase, createTestUser, closeTestDb } from "../helpers/testDb.js";

describe("Admin Management Integration Tests", () => {
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    await cleanDatabase();
    adminUser = await createTestUser({
      email: "admin@chainproof.local",
      role: "ADMIN",
      fullName: "Admin Administrator",
    });
    regularUser = await createTestUser({
      email: "student@chainproof.local",
      role: "USER",
      fullName: "Regular Student",
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
  });

  describe("RBAC Enforcement", () => {
    it("should reject non-admin users with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${regularUser.token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access forbidden/i);
    });

    it("should reject unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/admin/stats").expect(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/admin/stats", () => {
    it("should return system overview metrics for ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.users.total).toBe(2);
      expect(res.body.data.verifications.breakdown).toBeDefined();
    });
  });

  describe("GET /api/admin/users", () => {
    it("should list users with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/users?page=1&limit=10")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  describe("PATCH /api/admin/users/:id", () => {
    it("should deactivate user account and audit event", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${regularUser.user.id}`)
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({ isActive: false })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.is_active).toBe(false);
    });

    it("should prevent admin from deactivating their own account", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser.user.id}`)
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({ isActive: false })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot deactivate their own account/i);
    });
  });

  describe("GET /api/admin/audit-logs", () => {
    it("should retrieve recorded system audit logs", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs?page=1&limit=10")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

