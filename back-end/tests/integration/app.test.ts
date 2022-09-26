import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import {
  deleteAllData,
  createRecommendation,
  createManyRecommendations,
  insertRecommendation,
  insertStaticScore,
  checkRecommendationId,
} from "../factories/scenarioFactory";

beforeEach(async () => {
  await deleteAllData();
});

describe("tests route POST '/recommendation'", () => {
  it("should return status 201 when created a new recommendation", async () => {
    const recommendation = await createRecommendation();
    const result = await supertest(app)
      .post("/recommendations")
      .send(recommendation);
    expect(result.status).toBe(201);

    const createdRecommendation = await prisma.recommendation.findUnique({
      where: { name: recommendation.name },
    });

    expect(createdRecommendation).not.toBeNull();
  });
  it("should return status 422 when created a recommendation without a valid name", async () => {
    const recommendation = await createRecommendation();
    const result = await supertest(app)
      .post("/recommendations")
      .send({ youtubeLink: recommendation.youtubeLink });
    expect(result.status).toBe(422);
  });
  it("should return status 422 when created a recommendation without a valid link", async () => {
    const recommendation = await createRecommendation();
    const result = await supertest(app)
      .post("/recommendations")
      .send({ name: recommendation.name });
    expect(result.status).toBe(422);
  });
  it("should return status 409 if this recommendation has already been posted", async () => {
    const recommendation = await createRecommendation();
    await supertest(app).post("/recommendations").send(recommendation);
    const result = await supertest(app)
      .post("/recommendations")
      .send(recommendation);
    expect(result.status).toBe(409);
  });
});

describe("tests route POST '/recommendations/:id/upvote'", () => {
  it("should return status 200 when a recommendation is upvoted ", async () => {
    const recommendation = await createRecommendation();
    const newRecommendation = await prisma.recommendation.create({
      data: recommendation,
    });
    const result = await supertest(app).post(
      `/recommendations/${newRecommendation.id}/upvote`
    );
    const votedRecommendation = await prisma.recommendation.findUnique({
      where: { name: newRecommendation.name },
    });
    expect(result.status).toBe(200);
    expect(votedRecommendation.score).toBe(newRecommendation.score + 1);
  });
  it("should return status 404 when the id is not valid", async () => {
    const result = await supertest(app)
      .post("/recommendations/0/upvote")
      .send();
    expect(result.status).toBe(404);
  });
});

describe("tests route POST '/recommendations/:id/downvote'", () => {
  it("should return status 200 when a recommendation is downvoted ", async () => {
    const recommendation = await createRecommendation();
    const newRecommendation = await prisma.recommendation.create({
      data: recommendation,
    });
    const result = await supertest(app).post(
      `/recommendations/${newRecommendation.id}/downvote`
    );
    const votedRecommendation = await prisma.recommendation.findUnique({
      where: { name: newRecommendation.name },
    });
    expect(result.status).toBe(200);
    expect(votedRecommendation.score).toBe(newRecommendation.score - 1);
  });

  it("should return status 404 when the id is not valid", async () => {
    const result = await supertest(app)
      .post("/recommendations/0/downvote")
      .send();
    expect(result.status).toBe(404);
  });

  it("should return null and delete the recommendation with score under 5", async () => {
    const id = await insertRecommendation();
    await insertStaticScore(id);
    await supertest(app).post(`/recommendations/${id}/downvote`).send();
    const result = await checkRecommendationId(id);
    expect(result).toBe(null);
  });
});

describe("tests route GET '/recommendations'", () => {
  it("should return status 200 when the app gets the last ten recommendations", async () => {
    const recommendations = await createManyRecommendations();
    await prisma.recommendation.createMany({
      data: recommendations,
    });
    const result = await supertest(app).get("/recommendations");
    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThanOrEqual(10);
  });
});

describe("tests route GET'/recommendations/:id'", () => {
  it("should return status 200 when the app gets the a recomendation by its id", async () => {
    const recommendation = await createRecommendation();
    const newRecommendation = await prisma.recommendation.create({
      data: recommendation,
    });
    const result = await supertest(app).get(
      `/recommendations/${newRecommendation.id}`
    );
    expect(result.status).toBe(200);
    expect(result.body).not.toBeUndefined();
    expect(result.body.id).toBe(newRecommendation.id);
  });

  it("should return status 404 when the id is not valid", async () => {
    const result = await supertest(app).get("/recommendations/0");
    expect(result.status).toBe(404);
  });
});
describe("tests route GET '/recommendations/random'", () => {
  it("should return status 200 when the app gets a random recommendation", async () => {
    const randomRecommendation = await createManyRecommendations();
    await prisma.recommendation.createMany({
      data: randomRecommendation,
    });
    const result = await supertest(app).get("/recommendations/random");
    expect(result.status).toBe(200);
  });
});

describe("tests route GET '/recommendations/top/:amount' ", () => {
  it("should return status 200 when the app gets a recommendation with the most points ", async () => {
    const mostVotedRecommendation = await createManyRecommendations();
    await prisma.recommendation.createMany({
      data: mostVotedRecommendation,
    });
    const amount = faker.datatype.number({ min: 2, max: 10 });
    const result = await supertest(app).get(`/recommendations/top/${amount}`);
    expect(result.status).toBe(200);
    expect(result.body.length).toBe(amount);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
