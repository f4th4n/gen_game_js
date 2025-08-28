# GenGame JS Examples

This folder contains self-contained demo pages that exercise the JavaScript client library.

Files
- `dev.html` - Basic game demo (create/join/send). Loads `./src/main.ts` which bootstraps the game UI.
- `account.html` - Social login / account management demo. Loads `./src/account-entry.ts` which bootstraps the account UI.
- `src/` - Example-local TypeScript entry scripts. They import the library code from `../../src/` so the examples stay self-contained for local dev.

How to run (development)

1. Install dependencies

```bash
# fish shell
npm install
```

2. Start the Vite dev server from the project root

```bash
# fish shell
npm run dev
```

3. Open the example pages in your browser

- Dev game demo: http://localhost:5173/examples/dev.html
- Account demo: http://localhost:5173/examples/account.html
