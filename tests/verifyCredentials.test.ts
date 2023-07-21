import chai from "chai";
import sinon from "sinon";
import supertest from "supertest";

import createApp from "../src/app";
import GoogleSheetsDatabase from "../src/db/googleSheetsDatabase";

const expect = chai.expect;

const verifyCredentialsUrl = "/api/v1/verify-credentials";

const setGoogleSheetsGetRangeReturnValue = (values: string[][]): void => {
  sinon.replace(
    GoogleSheetsDatabase.prototype,
    "getRange",
    sinon.fake.resolves(values)
  );
};

describe("Verify Credentials", function () {
  beforeEach(() => {
    sinon.replace(
      GoogleSheetsDatabase.prototype,
      "connect",
      sinon.fake.rejects(
        new Error("Should not connect to Google Sheets Database for tests")
      )
    );
  });

  afterEach(() => {
    sinon.restore();
  });
  it("should return 200 when valid user credentials are sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "Test Username",
        password: "Test Password",
      });

    expect(response.status).to.be.equal(200);
  });

  it("should return 200 when valid user credentials are sent in a database with 3 users", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["User A", "Password A"],
      ["User B", "Password B"],
      ["User C", "Password C"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "User C",
        password: "Password C",
      });

    expect(response.status).to.be.equal(200);
  });

  it("should return 401 when non-existent username is sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "Non-Existent Username",
        password: "Test Password",
      });

    expect(response.status).to.be.equal(401);
  });

  it("should return 401 when wrong password is sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "Test Username",
        password: "Wrong Password",
      });

    expect(response.status).to.be.equal(401);
  });

  it("should return 401 when non-existent username and invalid password are sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "Non-Existent Username",
        password: "Invalid Password",
      });

    expect(response.status).to.be.equal(401);
  });

  it("should return 400 when username is not sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        password: "Test Password",
      });

    expect(response.status).to.be.equal(400);
  });

  it("should return 400 when password is not sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp())
      .post(verifyCredentialsUrl)
      .set({
        username: "Test Username",
      });

    expect(response.status).to.be.equal(400);
  });

  it("should return 400 when no body is sent", async function () {
    setGoogleSheetsGetRangeReturnValue([
      ["username", "password"],
      ["Test Username", "Test Password"],
    ]);

    const response = await supertest(createApp()).post(verifyCredentialsUrl);

    expect(response.status).to.be.equal(400);
  });
});
