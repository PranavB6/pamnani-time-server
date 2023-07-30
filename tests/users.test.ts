import { expect } from "chai";
import sinon, { type SinonStub } from "sinon";
import supertest from "supertest";

import createApp from "../src/app";
import GoogleSheetsDatabase from "../src/db/googleSheetsDatabase";

const createGoogleSheetsDatabaseGetRangeStub = (): SinonStub => {
  sinon.replace(
    GoogleSheetsDatabase.prototype,
    "connect",
    sinon.fake.rejects(
      new Error("Should not connect to Google Sheets Database for tests")
    )
  );

  return sinon.stub(GoogleSheetsDatabase.prototype, "getRange");
};

const usersUrl = "/api/v1/users";

describe("GET /users request", function () {
  let googleSheetsGetRangeStub: SinonStub;

  afterEach(function () {
    sinon.restore();
  });

  describe("when the database has no users", function () {
    beforeEach(function () {
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();
      googleSheetsGetRangeStub.resolves([]);
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
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();
      googleSheetsGetRangeStub.resolves([
        ["username", "password"],
        [user.username, user.password],
      ]);
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
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();

      const userCredentials = [userA, userB, userC].map((user) => [
        user.username,
        user.password,
      ]);

      googleSheetsGetRangeStub.resolves([
        ["username", "password"],
        ...userCredentials,
      ]);
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
