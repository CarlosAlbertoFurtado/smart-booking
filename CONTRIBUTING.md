# Contributing

Thanks for considering contributing! Here's how to get started.

## Setup

```bash
git clone https://github.com/CarlosAlbertoFurtado/smart-booking.git
cd smart-booking
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
```

## Running tests

```bash
npm test                 # all tests
npm run test:coverage    # with coverage
```

## Code style

This project uses TypeScript strict mode. Run before committing:

```bash
npx tsc --noEmit         # type check
```

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` adding tests
- `refactor:` code change that neither fixes a bug nor adds a feature

## Pull requests

1. Fork the repo and create a branch from `main`
2. Add tests for any new functionality
3. Ensure all tests pass
4. Open a PR with a clear description of the change
