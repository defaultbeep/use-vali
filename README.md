# Vali

`useVali` is a hook that validates your form with a zod schema.

## Installation

`npm install use-vali`

## About

`useVali`'s goal is to:

1. **Honour the progressive enhancement strategy**
2. Support the same schema as your server
3. Be easy to use and understand
4. Work with any form field

## Usage

[Example for forms that submit via actions](https://codesandbox.io/p/devbox/vali-demo-2j59nk?file=%2Fapp%2Fcontacts%2Fnew%2Fpage.tsx)

[Example for forms that submit to an endpoint (including same page)](https://codesandbox.io/p/devbox/vali-pages-demo-32c7v7?file=%2Fpages%2Fcontacts%2Fnew%2Findex.tsx%3A12%2C1)

### Tutorial

[Progressive enhancement with server and client validation ](https://www.youtube.com/watch?v=a0yBqZxWxQ4)

## Troubleshooting

If you encounter the TS error `TS2589: Type instantiation is excessively deep and possibly infinite` please set your version of `zod` to `3.22.4`.

For more info: https://github.com/colinhacks/zod/issues/3435
