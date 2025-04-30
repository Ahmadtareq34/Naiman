const request = require("supertest");
const app = require("../server");

describe("Login Functionality", () => {
  it("should successfully log in with valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "sampleuser100@gmail.com",
        password: "Sampleuser123!",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

afterAll(() => {
  const db = require('../config/db');
  db.end(); 
});

