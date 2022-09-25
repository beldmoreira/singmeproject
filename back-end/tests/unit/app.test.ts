import { jest } from "@jest/globals";
import {
  createRecommendation,
  createManyRecommendations,
} from "../factories/scenarioFactory";
import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("recommendation unit test suite", () => {
  it("should create a recommendation", async () => {
    const recommendation = {
      name: faker.lorem.words(5),
      youtubeLink: "https://www.youtube.com/watch?v=0vq3qZwaXrw",
    };

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});

    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});

    await recommendationService.insert(recommendation.name);
  });
});
