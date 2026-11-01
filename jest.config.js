export default {
  testEnvironment: "node",
  transform: {},
  setupFiles: ["<rootDir>/test/helpers/testSetup.js"],
  testMatch: ["**/test/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/test/contracts/"],
  verbose: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
};
