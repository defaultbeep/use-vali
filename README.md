# Vali

## Installation

`npm install use-vali`

## Usage

1. Create a schema using Zod

```typescript
// schema.ts
import { z } from "zod";

export const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

2. Create an action to receive the form data and validate it. If the data is valid, redirect the user to the next page. If the data is invalid, return the current values, any errors and set `isSubmitted` to `true`.

```typescript
// actions.ts
"use server";
import { schema } from "./schema";
import { State } from "use-vali";
import { z } from "zod";

export async function login<T>(
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

  redirect("/somewhere);
}
```

3. Create a form component that uses `useFormState` and `useVali` to manage the form state and validation.

```tsx
// LoginForm.tsx
"use client";
import { useFormState } from "react-dom";
import { useVali } from "use-vali";
import { login } from "./actions";
import { schema } from "./schema";

export function LoginForm() {
  // Pass your action to useFormState and set default server state
  const [serverState, action] = useFormState(login, {});

  // Give your schema and current server state to useVali
  const { state, vali } = useVali(schema, serverState);

  // `state` will be a combination of the server and client state which should contain the forms values, whether or not the form has been submitted, any form level errors and the touch and error state of each field.

  return (
    // Bind form action to action provided by useFormState
    // Bind form to vali by spreading in the handlers in `vali`
    <form action={action} {...vali}>
      <input type="email" name="email" />
      {(state.isSubmitted || state.touched?.email) && (
        <span>{state.fieldErrors.email}</span>
      )}
      <input type="password" name="password" />
      {(state.isSubmitted || state.touched?.password) && (
        <span>{state.fieldErrors.password}</span>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```
