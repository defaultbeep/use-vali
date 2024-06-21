# Vali

## Installation

`npm install use-vali`

## Usage

1. Create a schema using Zod

```typescript
// components/LoginForm/schema.ts
import { z } from "zod";

export const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

```

2. Create a server action that validates the form. If invalid return the data (in a specific structure) back to the client or do whatever you need to do if its valid.

```typescript
// components/LoginForm/actions.ts
"use server";
import { redirect } from "next/navigation";
import { State } from "use-vali";
import { z } from "zod";
import { schema } from "./schema";

export async function login(
  prevState: State<z.infer<typeof schema>>,
  data: any,
): Promise<State<z.infer<typeof schema>>> {
  const values = {
    email: data.get("email")?.toString(),
    password: data.get("password")?.toString(),
  };

  const result = schema.safeParse(values);

  if (result.success !== true) {
    return {
      values,
      fieldErrors: result.error.format(),
      isSubmitted: true,
    };
  }

  redirect("/somewhere");
}

```

3. (Optional Step) Create or import nice field components that let you conditionally render errors

Note: Vali works with any standard form field (input, select, textarea)

```tsx
// components/TextField.tsx
import cx from "classnames";

type Props = {
  label: string;
  errors?: string[] | string;
  touched?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({ label, errors, touched, ...inputProps }: Props) => {
  const classes = cx("block p-2 border-2 border-black w-64", {
    "border-red-500": touched && errors,
  });

  return (
    <div>
      <label>{label}</label>
      <input className={classes} type="text" {...inputProps} />
      {touched && errors && (
        <span className="text-red-500">{Array.isArray(errors) ? errors[0] : errors}</span>
      )}
    </div>
  );
};

```

3. Create a form component that uses `useFormState` to wrap your server action and `useVali` to manage the client state

```tsx
// components/LoginForm/LoginForm.tsx
"use client";
import { useFormState } from "react-dom";
import { useVali } from "use-vali";
import { login } from "./actions";
import { schema } from "./schema";
import { TextField } from "@/components/TextField/TextField";
import { Button } from "@/components/Button/Button";

export function LoginForm() {
  // bind the `action` returned to your form
  const [serverState, action] = useFormState(login, {});

  // spread the returned `vali` object properties into your form
  const { state, vali } = useVali(schema, serverState);

  // the `state` object contains the current state of the form

  /*
    state = {
      values: { email: string, password: string },
      isSubmitted: boolean,
      fieldErrors: { email: { _errors: string[] }, password: { _errors: string[] } },
      formErrors: string[],
      touched: { email: boolean, password: boolean }
    }
  */

  return (
    <form action={action} {...vali}>
      <TextField
        name="email"
        label="Email"
        errors={state.fieldErrors?.email?._errors}
        touched={state.isSubmitted || state.touched?.email}
      />
      <br />
      <TextField
        name="password"
        label="Password"
        type="password"
        errors={state.fieldErrors?.password?._errors}
        touched={state.isSubmitted || state.touched?.password}
      />
      <br />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Troubleshooting

If you encounter the TS error `TS2589: Type instantiation is excessively deep and possibly infinite` please set your version of `zod` to `3.22.4`.

For more info: https://github.com/colinhacks/zod/issues/3435
