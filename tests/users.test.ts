import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";

import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";

const usersUrl = "/api/v1/users";

describe("GET /users request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  afterEach(function () {
    sinon.restore();
  });

  describe("when the database has no users", function () {
    beforeEach(function () {
      googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();
    });

    it("should return 200 with an empty array", async function () {
      const response = await supertest(createApp()).get(usersUrl);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.be.deep.equal([]);
    });
  });

  describe("when the database has 1 user", function () {
    const user = {
      username: "Test Username",
      password: "Test Password",
    };

    beforeEach(function () {
      googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();
      googleSheetsSimulator.addUser(user.username, user.password);
    });

    it("should return 200 with an array of 1 user", async function () {
      const response = await supertest(createApp()).get(usersUrl);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.be.deep.equal([user.username]);
    });
  });

  describe("when the database has 3 users", function () {
    const userA = {
      username: "User A",
      password: "Password B",
    };

    const userB = {
      username: "User B",
      password: "Password B",
    };

    const userC = {
      username: "User C",
      password: "Password C",
    };

    beforeEach(function () {
      googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();

      [userA, userB, userC].forEach((user) => {
        googleSheetsSimulator.addUser(user.username, user.password);
      });
    });

    it("should return 200 with an array of 3 users", async function () {
      const response = await supertest(createApp()).get(usersUrl);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.be.deep.equal([
        userA.username,
        userB.username,
        userC.username,
      ]);
    });
  });
});
