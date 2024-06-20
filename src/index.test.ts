import { describe, it, expect } from "@jest/globals";
import { test } from "./index";

describe("index", () => {
  it("should pass", () => {
    expect(test).toBe("test");
  });
});
