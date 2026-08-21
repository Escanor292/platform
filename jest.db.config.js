const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/__tests__/api/projects/delete.test.ts",
    "<rootDir>/__tests__/migrations/migration-idempotence.test.ts",
    "<rootDir>/__tests__/migrations/migration-idempotence-sql.test.ts",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@prisma/client$": "<rootDir>/prisma/generated/client",
  },
});
