import { expect } from "chai";
import dayjs from "dayjs";
import sinon from "sinon";
import supertest from "supertest";

import CondensedTimesheetRecordCreator from "./helpers/condensedTimesheetRecordCreator";
import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";

const clockInUrl = "/api/v1/user/clock-in";

const userA = {
  username: "User A",
  password: "Password A",
};

const userB = {
  username: "User B",
  password: "Password B",
};

const now = dayjs().set("millisecond", 0).toISOString();

describe("POST /clock-in request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  beforeEach(function () {
    googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();

    [userA, userB].forEach((user) => {
      googleSheetsSimulator.addUser(user.username, user.password);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("with valid user credentials in the request", function () {
    describe("and the user does not have any records", function () {
      it("should return 200 if the request body is valid", async function () {
        const requestBody = {
          startDatetime: now,
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.deep.contain(requestBody);
        expect(response.body).to.not.have.property("endDatetime");
        expect(response.body).to.not.have.property("totalTime");
        expect(response.body).to.have.property("status");
      });

      it("should return 400 if a mandatory field is missing in the request body", async function () {
        const requestBody = {
          // missing startDatetime
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if the startDatetime is NOT a valid datetime", async function () {
        const requestBody = {
          startDatetime: "not a valid datetime",
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if there is no request body", async function () {
        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password);

        expect(response.status).to.be.equal(400);
      });
    });

    describe("and the user is NOT clocked in", function () {
      beforeEach(function () {
        const condensedRecords = [
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userB.username).build(),
          new CondensedTimesheetRecordCreator(userA.username).build(),
        ];

        condensedRecords.forEach((record) => {
          googleSheetsSimulator.addCondensedTimesheetRecord(record);
        });
      });

      it("should return 200 if the request body is valid", async function () {
        const requestBody = {
          startDatetime: now,
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.deep.contain(requestBody);
        expect(response.body).to.not.have.property("endDatetime");
        expect(response.body).to.not.have.property("totalTime");
        expect(response.body).to.have.property("status");
      });

      it("should return 400 if a mandatory field in the request body is missing", async function () {
        const requestBody = {
          // missing startDatetime
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if the startDatetime is NOT a valid datetime", async function () {
        const requestBody = {
          startDatetime: "not a valid datetime",
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if there is no request body", async function () {
        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password);

        expect(response.status).to.be.equal(400);
      });
    });

    describe("and the user is clocked in", function () {
      beforeEach(function () {
        const condensedRecords = [
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userB.username).build(),
          new CondensedTimesheetRecordCreator(userA.username)
            .makeClockIn()
            .build(),
        ];

        condensedRecords.forEach((record) => {
          googleSheetsSimulator.addCondensedTimesheetRecord(record);
        });
      });

      it("should return 409 even if the request body is valid", async function () {
        const requestBody = {
          startDatetime: now,
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });

      it("should return 409 even if the request body is missing mandatory fields", async function () {
        const requestBody = {
          // missing startDatetime
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });

      it("should return 409 even if the startDatetime is NOT a valid datetime", async function () {
        const requestBody = {
          startDatetime: "not a valid datetime",
        };

        const response = await supertest(createApp())
          .post(clockInUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });
    });
  });
});
