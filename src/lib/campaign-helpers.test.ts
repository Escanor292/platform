import { calculateCompletionState } from "./campaign-helpers";

const past = new Date("2020-01-01T00:00:00.000Z");
const future = new Date("2099-01-01T00:00:00.000Z");

describe("calculateCompletionState", () => {
  test("Keep-It-All SUCCESS dưới mục tiêu không bị coi là FAILED", () => {
    expect(calculateCompletionState("SUCCESS", past, past, 40)).toBe("COMPLETED");
  });

  test("AON FAILED dưới mục tiêu là FAILED", () => {
    expect(calculateCompletionState("FAILED", past, past, 40)).toBe("FAILED");
  });

  test("đạt mục tiêu trước hạn là GOAL_REACHED", () => {
    expect(calculateCompletionState("ACTIVE", past, future, 120)).toBe("GOAL_REACHED");
    expect(calculateCompletionState("SUCCESS", past, future, 120)).toBe("GOAL_REACHED");
  });
});
