import { expect } from "chai";
import sinon, { type SinonStub } from "sinon";
import supertest from "supertest";

import createApp from "../src/app";
import GoogleSheetsDatabase from "../src/db/googleSheetsDatabase";

const verifyCredentialsUrl = "/api/v1/verify-credentials";

// const setGoogleSheetsGetRangeReturnValue = (values: string[][]): void => {
//   sinon.replace(
//     GoogleSheetsDatabase.prototype,
//     "getRange",
//     sinon.fake.resolves(values)
//   );

//   const getRangeStub = sinon.stub(GoogleSheetsDatabase.prototype, "getRange");
//   getRangeStub.resolves(values);
// };

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

describe("POST /verify-credentials request", function () {
  let googleSheetsGetRangeStub: SinonStub;

  afterEach(function () {
    sinon.restore();
  });
  describe("when the database has no users", function () {
    beforeEach(function () {
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();
      googleSheetsGetRangeStub.resolves([]);
    });

    it("should return 401", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth("Test Username", "Test Password");

      expect(response.status).to.be.equal(401);
    });
  });

  describe("when the database has 1 user", function () {
    const validUsername = "Test Username";
    const validPassword = "Test Password";

    beforeEach(function () {
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();
      googleSheetsGetRangeStub.resolves([
        ["username", "password"],
        [validUsername, validPassword],
      ]);
    });

    it("should return 200 if valid user credentials are sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(validUsername, validPassword);

      expect(response.status).to.be.equal(200);
    });

    it("should return 401 if an incorrect password is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth(validUsername, "Incorrect Password");

      expect(response.status).to.be.equal(401);
    });

    it("should return 401 if a non-existent username is sent", async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth("Non-existent Username", validPassword);

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
      googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();

      const userCredentialRecords = [userA, userB, userC].map((user) => [
        user.username,
        user.password,
      ]);

      googleSheetsGetRangeStub.resolves([
        ["username", "password"],
        ...userCredentialRecords,
      ]);
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
