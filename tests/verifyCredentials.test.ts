import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";

import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";

const verifyCredentialsUrl = "/api/v1/verify-credentials";

describe("POST /verify-credentials request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  afterEach(function () {
    sinon.restore();
  });
  describe("when the database has no users", function () {
    beforeEach(function () {
      googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();
    });

    it("should return 401", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth("Test Username", "Test Password");

      expect(response.status).to.be.equal(401);
    });
  });

  describe("when the database has 1 user", function () {
    const validUser = {
      username: "Test Username",
      password: "Test Password",
    };

    beforeEach(function () {
      googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();
      googleSheetsSimulator.addUser(validUser.username, validUser.password);
    });

    it("should return 200 if valid user credentials are sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(validUser.username, validUser.password);

      expect(response.status).to.be.equal(200);
    });

    it("should return 401 if an incorrect password is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(validUser.username, "Incorrect Password");

      expect(response.status).to.be.equal(401);
    });

    it("should return 401 if a non-existent username is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth("Non-existent Username", validUser.password);

      expect(response.status).to.be.equal(401);
    });

    it("should return 401 when there is no user credentials in the request", async function () {
      const response = await supertest(createApp()).post(verifyCredentialsUrl);

      expect(response.status).to.be.equal(401);
    });
  });

  describe("when the database has 3 users", function () {
    const userA = {
      username: "User A",
      password: "Password A",
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

    it("should return 200 if valid user credentials are sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(userB.username, userB.password);

      expect(response.status).to.be.equal(200);
    });

    it("should return 401 if an incorrect password is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(userB.username, "Incorrect Password");

      expect(response.status).to.be.equal(401);
    });

    it("should return 401 if a non-existent username is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth("Non-existent Username", userB.password);

      expect(response.status).to.be.equal(401);
    });

    it("should return 401 when there is no user credentials in the request", async function () {
      const response = await supertest(createApp()).post(verifyCredentialsUrl);

      expect(response.status).to.be.equal(401);
    });
  });
});
