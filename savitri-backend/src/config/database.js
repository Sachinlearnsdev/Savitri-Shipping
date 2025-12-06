// src/config/database.js
const { PrismaClient } = require("@prisma/client");

const clientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
  accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
};

const prisma = new PrismaClient(clientOptions);

prisma
  .$connect()
  .then(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "✅ Database connected successfully (Prisma v7 + Accelerate)"
      );
    }
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    if (process.env.NODE_ENV !== "development") process.exit(1);
  });

module.exports = prisma;
