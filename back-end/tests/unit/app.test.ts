import { jest } from "@jest/globals";
import {
  createRecommendation,
  createRecommendationWithId,
  createTenRecommendations,
} from "../factories/scenarioFactory";
import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("tests route POST '/recommendation'", () => {
  it("should create a recommendation", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});
    const data = await createRecommendation();
    await recommendationService.insert(data);
    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
  });
  it("should not allow the creation of a recommendation that already exists", async () => {
    const data = await createRecommendation();
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return data;
      });
    const result = recommendationService.insert(data);
    expect(result).rejects.toEqual({
      message: "Recommendations names must be unique",
      type: "conflict",
    });
  });
});

describe("tests route POST /recommendations/:id/upvote", () => {
  it("should upvote a recommendation", async () => {
    const data = await createRecommendationWithId();
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(data);
    await recommendationService.upvote(data.id);
    expect(recommendationRepository.updateScore).toHaveBeenCalled();
  });

  it("should not upvote a recommendation that is invalid", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);
    const promise = recommendationService.upvote(0);
    expect(promise).rejects.toEqual({ message: "", type: "not_found" });
  });
});

describe("tests route POST /recommendations/:id/downvote", () => {
  it("should downvote a recommendation", async () => {
    const data = await createRecommendationWithId();
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(data);
    await recommendationService.downvote(data.id);
    expect(recommendationRepository.updateScore).toHaveBeenCalled();
  });

  it("should not downvote a recommendation that is invalid", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);
    const promise = recommendationService.downvote(0);
    expect(promise).rejects.toEqual({ message: "", type: "not_found" });
  });
});

describe("tests route GET '/recommendations'", () => {
  it("should get recommendations", async () => {
    const data = await createTenRecommendations();
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(data);
    await recommendationService.get();
    expect(recommendationRepository.findAll).toHaveBeenCalled();
  });
});

describe("tests route GET'/recommendations/:id'", () => {
  it("should get a recommendation by its id", async () => {
    const data = await createRecommendationWithId();
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);
    await recommendationService.getById(data.id);
    expect(recommendationRepository.find).toHaveBeenCalled();
  });
});

describe("tests route GET '/recommendations/random'", () => {
  it("should get random recommendations", async () => {
    const data = await createTenRecommendations();
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(data);
    await recommendationService.getRandom();
    expect(recommendationRepository.getAmountByScore).toHaveBeenCalled();
  });

  it("should not return random recommendations", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);
    const promise = recommendationService.getRandom();
    expect(promise).rejects.toEqual({ message: "", type: "not_found" });
  });
});
