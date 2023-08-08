# Lessons Learned

- use lint-staged to run prettier and eslint on staged files because the pre-commit hook is not run on staged files, only on all files

  - so if you git aa, and then make changes and then run git pre-commit, it will run on the files you change but not on the files you git aa'd

- use node instead of npm in the docker CMD

  - use node to start the app instead of npm because npm does not pass OS signals to the Node process
  - using node to start the app will make sure that the app correctly receives OS signals like SIGINT and SIGTERM and node can do cleanup before exiting (like closing database connections, etc.)
  - Execute NodeJS (not NPM script) to handle SIGTERM and SIGINT signals.

- don't create a .env.tests file
  - don't create a .env.tests file because it will be used by the tests and the tests will fail because the .env.tests file will not be present in the production environment
  - instead, only have a single .env file and modify the process.env variables before starting tests
