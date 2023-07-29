<div align="center">

<img src="src/docs/logo.png" alt="drawing" width="200"/>

# Pamnani Time

<img src="src/docs/gif.gif" width="300" height="300" />

&nbsp;

![Static Badge][NodeJS_Badge]
![Static Badge][TypeScript_Badge]
![Static Badge][ExpressJS_Badge]
![Static Badge][MochaJS_Badge]
![Static Badge][ChaiJS_Badge]

![Static Badge][GoogleSheets_Badge]
![Static Badge][ZodJS_Badge]
![Static Badge][ESLint_Badge]
![Static Badge][Prettier_Badge]

![forthebadge][BuiltWithLove_Badge]
![forthebadge][GlutenFree_Badge]

[View Swagger Documentation](https://editor.swagger.io/?url=https://raw.githubusercontent.com/PranavB6/pamnani-time-server/main/src/docs/openapi.yaml)

</div>

## :star2: Project Purpose and Objectives

The main goal of this project is to create a simple and easy to use time tracking application using Google Sheets to store all the data. This is aimed to managers who want to track their employees' time.

This is the backend of the application. It is a REST API that is used to communicate with the Google Sheets API. You can find the frontend [here](https://github.com/Madeeha-Anjum/pamnani-time-client). This project is built on NodeJS using the ExpressJS framework.

## :chart_with_upwards_trend: Future Plans

- [ ] Deploy to GCP Cloud Run

## :sunrise: Getting Started

0. (Prerequisites)
   - Install [NodeJS](https://nodejs.org/en/download/) and npm (included with NodeJS)
   - Copy the `.env.example` file and rename it to `.env`. Fill in the values for the environment variables.
1. Clone the repository
2. Run `npm install` to install all dependencies
3. Run `npm build` to build the project
4. Run `npm start` to start the server
5. Open `http://localhost:3000` in your browser to view the application

## :black_nib: Development

1. Run `npm run dev` to start the server in development mode (this will build the project and start the server in watch mode)
2. Run `npm run test` to run the tests
3. Run `npm run test:dev` to run the tests in watch mode

### :broom: Linting / Formatting

1. Run `npm run lint` to lint the project using ESLint (without fixing the errors)
2. Run `npm run lint:fix` to lint the project and fix linting errors
3. Run `npm run format:check` to check the formatting using Prettier (without fixing the errors)
4. Run `npm run format` to format the project using Prettier (and fix the errors)

NOTE: The project is automatically linted and formatted on commit using Husky and Lint-Staged.

## :eyes: Technologies Used

- [ExpressJS](https://expressjs.com/)
  - A [NodeJS](https://nodejs.org/) framework used to build the REST API
- [TypeScript](https://www.typescriptlang.org/)
  - A superset of JavaScript that adds static typing to the language
- [Google Apis](https://developers.google.com/sheets/api/guides/concepts)
  - A library that allows you to easily interact with Google APIs
- [Zod](https://zod.dev/)
  - A TypeScript-first schema declaration and validation library used to validate client requests
- [Winston](https://github.com/winstonjs/winston)
  - A logger library used to log errors and other information

### :test_tube: Testing

- [Mocha](https://mochajs.org/)
  - A testing framework used to write tests
- [Chai](https://www.chaijs.com/)
  - An assertion library used to write tests
- [Sinon](https://sinonjs.org/)
  - A library used to mock functions and objects

### :broom: Linting / Formatting Technologies

- [ESLint](https://eslint.org/)
  - A linter used to lint the project
- [Prettier](https://prettier.io/)
  - A code formatter used to format the project

[BuiltWithLove_Badge]: https://forthebadge.com/images/badges/built-with-love.svg
[GlutenFree_Badge]: https://forthebadge.com/images/badges/gluten-free.svg
[NodeJS_Badge]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[TypeScript_Badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[ExpressJS_Badge]: https://img.shields.io/badge/Express.js-EEEEEE?style=for-the-badge
[MochaJS_Badge]: https://img.shields.io/badge/mocha.js-8D673F?style=for-the-badge&logo=mocha&logoColor=white
[ChaiJS_Badge]: https://img.shields.io/badge/chai.js-faf4e8?style=for-the-badge&logo=chai&logoColor=red
[GoogleSheets_Badge]: https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white
[ESLint_Badge]: https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white
[Prettier_Badge]: https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E
[ZodJS_Badge]: https://img.shields.io/badge/zod.js-3068B7.svg?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTAwNCIgaGVpZ2h0PSI3OTciIHZpZXdCb3g9IjAgMCAxMDA0IDc5NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyM18yKSI+CjxwYXRoIGQ9Ik02OTcuNTUzIDQ4My4xMDZIMjkwLjYxMlY1NDcuMzg3SDY5Ny41NTNWNDgzLjEwNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik02NTAuMDgyIDUzNi4zNzZIMzM0Ljg0M1Y2MDAuNjU3SDY1MC4wODJWNTM2LjM3NloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03MjcuODQ3IDQ2Ni40MjNINTU5LjE2M1Y0ODQuNTE2SDcyNy44NDdWNDY2LjQyM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04MzAuMTUyIDYzLjY1OTJMMjI3LjU5OCA0MTEuNTQ1TDI4OC4xODIgNTE2LjQ4TDg5MC43MzYgMTY4LjU5NEw4MzAuMTUyIDYzLjY1OTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDY3LjI5MyAyOC41OTMzTDgxLjEzNTcgMjUxLjU0Mkw5My41ODA1IDI3My4wOTdMNDc5LjczNyA1MC4xNDgyTDQ2Ny4yOTMgMjguNTkzM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00NTQuNzMzIDEzLjk2NzNMNjguNTc1OSAyMzYuOTE2TDgxLjAyMDYgMjU4LjQ3MUw0NjcuMTc4IDM1LjUyMjNMNDU0LjczMyAxMy45NjczWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ0Mi4yODMgMi41MzY0M0w1Ni4xMjYgMjI1LjQ4NUw2OC41NzA3IDI0Ny4wNEw0NTQuNzI4IDI0LjA5MTNMNDQyLjI4MyAyLjUzNjQzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUwMS45NTggMjguNTg4TDkzLjU4NTQgMjY0LjM2MkwxMDMuMzg3IDI4MS4zMzhMNTExLjc2IDQ1LjU2NDJMNTAxLjk1OCAyOC41ODhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTI3LjQzNyAzMy4xNjY4TDEwMy4zODcgMjc3Ljk5MkwxMTMuMTg4IDI5NC45NjhMNTM3LjIzOCA1MC4xNDNMNTI3LjQzNyAzMy4xNjY4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTU2My45OTcgMjguNTkzOEwxMTAuNTQ1IDI5MC4zOTVMMTIyLjk4OSAzMTEuOTVMNTc2LjQ0MiA1MC4xNDg3TDU2My45OTcgMjguNTkzOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzk4LjYzNyAwLjE0MDEzN0gyMTQuMzc4TDAuOTE0Nzk1IDIxMi41MDVMNDg1LjU1IDc5Ni4xMDNMNTI0LjIxMiA3NTIuNzIzTDEwMDMuOTMgMjE0LjQ5OEw3OTguNjM3IDAuMTQwMTM3Wk03NzcuMjkzIDUwLjE0TDkzNS44NjUgMjE1LjcxOUw0ODYuODkyIDcxOS40NUw2OC41NzggMjE1LjcxOUwyMzUuMDExIDUwLjE0SDc3Ny4yOTNaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzEyM18yIj4KPHJlY3Qgd2lkdGg9IjEwMDQiIGhlaWdodD0iNzk3IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=&logoColor=white
