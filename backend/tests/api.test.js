import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index.js";
import { config } from "../src/config/env.js";

describe("TeamWork Backend API Test Suite", () => {
  let authToken = "";
  let testProjectId = "";
  let testTaskId = "";
  let testUserId = "";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri);
    }

    // Login as PM user
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pm@teamwork.local", password: "password123" });

    expect(res.status).toBe(200);
    authToken = res.body.data.token;
    testUserId = res.body.data.user._id;

    // Fetch project
    const projRes = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${authToken}`);

    expect(projRes.status).toBe(200);
    expect(projRes.body.data.length).toBeGreaterThan(0);
    testProjectId = projRes.body.data[0]._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Phase 0: Health Check API", () => {
    it("GET /api/health should return 200 with status UP", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "UP",
        service: "teamwork-api"
      });
    });
  });

  describe("Phase 1 & 6: Authentication & User Management", () => {
    it("should reject duplicate email during registration (409 Conflict)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "admin@teamwork.local",
          password: "password123"
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("already exists");
    });

    it("should reject login with wrong credentials (401 Unauthorized)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@teamwork.local",
          password: "wrongpassword"
        });

      expect(res.status).toBe(401);
    });

    it("GET /api/auth/me should return current user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("pm@teamwork.local");
    });
  });

  describe("Phase 2: Projects & Membership", () => {
    it("GET /api/projects/:projectId should return project details with members", async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(testProjectId);
      expect(Array.isArray(res.body.data.members)).toBe(true);
    });
  });

  describe("Phase 3 & 4: Task Business Rules, Search & OCC", () => {
    it("should create a new task successfully", async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Unit Test Task Creation",
          description: "Testing business rules validation",
          priority: "HIGH",
          assigneeId: testUserId
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Unit Test Task Creation");
      testTaskId = res.body.data._id;
    });

    it("should reject assigning a non-member to a task", async () => {
      // Fake non-member ObjectId
      const nonMemberId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Invalid Member Task",
          assigneeId: nonMemberId.toString()
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("must be a member of the project");
    });

    it("should enforce Optimistic Concurrency Control (OCC) conflict detection", async () => {
      // First update task status to DONE
      await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "DONE" });

      // Stale update attempt with outdated version
      const res = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "OCC Stale Update",
          version: 0 // Stale version! Current version is higher
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("Conflict detected");
    });

    it("should reject moving completed task directly to TODO without reopen", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "TODO" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("reopen action");
    });

    it("should allow moving completed task to TODO via dedicated reopen endpoint", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/reopen`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("TODO");
    });

    it("should search and paginate tasks with metadata", async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/tasks?page=1&limit=5&search=Unit`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.currentPage).toBe(1);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Phase 8: Project Aggregation Dashboard", () => {
    it("should calculate status counts, overdue tasks, and progress percentage", async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/dashboard`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalTasks).toBeGreaterThan(0);
      expect(res.body.data.progressPercentage).toBeDefined();
      expect(res.body.data.statusDistribution).toBeDefined();
    });
  });
});
