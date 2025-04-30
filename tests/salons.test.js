const request = require("supertest");
const app = require("../server");

describe("Saloon Listings", () => {
  it("should return a list of saloons", async () => {
    const response = await request(app).get("/saloons/all");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

afterAll(() => {
  const db = require('../config/db');
  db.end(); 
});
