# Nestjs API Starter with Prisma and Typescript

A template for Nestjs with TypeScript, Prisma and ZOD + Auth

This template includes JWT Auth, Sending Refresh Token via HttpOnly cookie and Storing it in Redis. (each user can has multiple Refresh Tokens)

## Setup

### Install Dependencies

```sh
pnpm install
```

### Create .env file

```sh
cp .env.sample .env
```

### Run Database

```sh
docker-compose up
```

### Migrate Database

```sh
pnpx prisma migrate dev
```

## Development

```sh
pnpm run dev
```

## Lint

```sh
pnpm run lint:fix
```
