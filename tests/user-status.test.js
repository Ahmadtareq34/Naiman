const request = require("supertest");
const app = require("../server");

describe("User Status", () => {
  it("should return loggedIn false when no session exists", async () => {
    const response = await request(app).get("/auth/user-status");
    expect(response.statusCode).toBe(200);
    expect(response.body.loggedIn).toBe(false);
  });
});

afterAll(() => {
  const db = require('../config/db');
  db.end(); 
});
