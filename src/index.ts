import { set } from "lodash";
import { useEffect, useState } from "react";
import { z } from "zod";

type StuctureWith<T, TT> = {
  [K in keyof T]?: T[K] extends string
    ? TT
    : T[K] extends Array<infer U>
      ? Array<StuctureWith<U, TT>>
      : T[K] extends object
        ? StuctureWith<T[K], TT>
        : never;
};

export type State<T> = {
  values?: StuctureWith<T, string>;
  touched?: StuctureWith<Required<T>, boolean>;
  formErrors?: string[];
  fieldErrors?: StuctureWith<Required<T>, { _errors: string[] }>;
  isSubmitted?: boolean;
};

export function useVali<FV>(schema: z.Schema<FV>, serverState: State<FV>) {
  const [state, setState] = useState<State<FV>>(serverState);

  useEffect(() => {
    if (serverState.isSubmitted) {
      setState(serverState);
    } else {
      const result = schema.safeParse(state.values);
      if (!result.success) {
        setState({
          ...state,
          fieldErrors: { ...result.error.format(), _errors: undefined },
          formErrors: result.error.format()._errors,
        });
      } else {
        setState({
          ...state,
          fieldErrors: {},
          formErrors: [],
        });
      }
    }
  }, [serverState, schema]);

  const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;

    const values = set({ ...state.values }, name, value);

    const result = schema.safeParse(values);

    if (!result.success) {
      setState({
        ...state,
        values,
        fieldErrors: { ...result.error.format(), _errors: undefined },
        formErrors: result.error.format()._errors,
      });
    } else {
      setState({
        ...state,
        values,
        fieldErrors: {},
        formErrors: [],
      });
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;
    if (name === "") return;

    const values = set({ ...state.values }, name, value);

    const touched = set({ ...state.touched }, name, true);

    const result = schema.safeParse(values);

    if (!result.success) {
      const errors = result.error.format();
      setState({
        ...state,
        values,
        touched,
        fieldErrors: { ...errors, _errors: undefined },
        formErrors: errors._errors,
      });
    } else {
      setState({
        ...state,
        values,
        touched,
        fieldErrors: {},
        formErrors: [],
      });
    }
  };

  return {
    state,
    vali: {
      onChange: handleChange,
      onBlur: handleBlur,
    },
  };
}
