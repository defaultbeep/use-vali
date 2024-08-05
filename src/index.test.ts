import { describe, it, expect } from "@jest/globals";

import { z } from "zod";
import { act, renderHook } from "@testing-library/react";
import { useVali } from ".";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockEvent(name: string, value: string): any {
  return {
    target: {
      name,
      value,
    },
    preventDefault: () => {},
  };
}

describe("useForm", () => {
  describe("initial state (with empty server state)", () => {
    it("Should validate and set errors in state (Simple Form)", () => {
      const serverState = {};
      const schema = z.object({ name: z.string() });
      const { result } = renderHook(() => useVali(schema, serverState));

      /* The values are undefined so there will be 1 form level error */
      expect(result.current.state.formErrors).toEqual(["Required"]);
      expect(result.current.state.fieldErrors).toEqual({});

      /* In this case values, touched and isSubmitted remain undefined */

      expect(result.current.state.values).toBeUndefined();
      expect(result.current.state.touched).toBeUndefined();
      expect(result.current.state.isSubmitted).toBeUndefined();
    });
  });

  describe("initial state (with server state)", () => {
    describe("when server state has 'isSubmitted' as 'true'", () => {
      it("Should return the given server state", () => {
        const serverState = {
          values: { name: "John" },
          formErrors: [],
          fieldErrors: {
            name: { _errors: ["first name must include w"] },
          },
          isSubmitted: true,
        };
        const schema = z.object({
          name: z
            .string()
            .includes("w", { message: "first name must include w" }),
        });
        const { result } = renderHook(() => useVali(schema, serverState));

        /* The values are undefined so there will be 1 form level error */
        expect(result.current.state.formErrors).toEqual([]);
        expect(result.current.state.fieldErrors).toEqual({
          name: { _errors: ["first name must include w"] },
        });

        /* In this case values, touched and isSubmitted are based on the server state */

        expect(result.current.state.values).toEqual({ name: "John" });
        expect(result.current.state.touched).toBeUndefined();
        expect(result.current.state.isSubmitted).toBe(true);
      });
    });
  });

  describe("when user interacts with a field", () => {
    it("Should update the value of a field in state while typing", () => {
      const serverState = {};
      const schema = z.object({ name: z.string() });
      const { result } = renderHook(() => useVali(schema, serverState));

      act(() => {
        result.current.vali.onChange(mockEvent("name", "John"));
      });

      expect(result.current.state.values?.name).toEqual("John");
    });

    it("Should validate and set errors in state while typing", () => {
      const serverState = {};
      const schema = z.object({ name: z.string().min(5) });
      const { result } = renderHook(() => useVali(schema, serverState));

      act(() => {
        result.current.vali.onChange(mockEvent("name", "John"));
      });

      expect(result.current.state.values?.name).toEqual("John");
      expect(result.current.state.formErrors).toEqual([]);
      expect(result.current.state.fieldErrors?.name?._errors).toEqual([
        "String must contain at least 5 character(s)",
      ]);
    });

    it("Should only mark a field as touched in state when the field is blurred", () => {
      const serverState = {};
      const schema = z.object({ name: z.string() });
      const { result } = renderHook(() => useVali(schema, serverState));

      expect(result.current.state.touched?.name).toBeUndefined();

      act(() => {
        result.current.vali.onChange(mockEvent("name", "John"));
      });

      expect(result.current.state.touched?.name).toBeUndefined();

      act(() => {
        result.current.vali.onBlur(mockEvent("name", "John"));
      });

      expect(result.current.state.touched?.name).toBe(true);
    });

    it("Should update the values of nested field names in state", () => {
      const serverState = {};
      const schema = z.object({
        address: z.object({ line1: z.string(), line2: z.string() }),
      });
      const { result } = renderHook(() => useVali(schema, serverState));

      act(() => {
        result.current.vali.onChange(
          mockEvent("address.line1", "1 Main Street"),
        );
      });

      expect(result.current.state.values?.address?.line1).toEqual(
        "1 Main Street",
      );
    });
  });

  describe("when user submits the form", () => {
    it("Should validate the form and update the state with the errors and isSubmitted as true", () => {
      const serverState = {};
      const schema = z.object({ name: z.string().min(5) });
      const { result } = renderHook(() => useVali(schema, serverState));

      act(() => {
        result.current.vali.onSubmit(mockEvent("", ""));
      });

      expect(result.current.state.formErrors).toEqual([]);
      expect(result.current.state.fieldErrors?.name?._errors).toEqual([
        "Required",
      ]);
      expect(result.current.state.isSubmitted).toBe(true);
    });
  });
});
