import { expect } from "chai";
import dayjs from "dayjs";
import sinon from "sinon";
import supertest from "supertest";

import CondensedTimesheetRecordCreator from "./helpers/condensedTimesheetRecordCreator";
import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";
import { type CondensedTimesheetRecord } from "../src/models/condensedTimesheetRecord";

const clockOutUrl = "/api/v1/user/clock-out";

const userA = {
  username: "User A",
  password: "Password A",
};

const userB = {
  username: "User B",
  password: "Password B",
};

const now = dayjs().set("millisecond", 0).toISOString();

describe("POST /clock-out request", function () {
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
    describe("and the user has a clocked-in record", function () {
      let completeRecord: CondensedTimesheetRecord;

      beforeEach(function () {
        completeRecord = new CondensedTimesheetRecordCreator(
          userA.username
        ).build();

        const clockedInRecord = structuredClone(completeRecord);
        delete clockedInRecord.endDatetime;
        delete clockedInRecord.totalTime;

        googleSheetsSimulator.addCondensedTimesheetRecord(clockedInRecord);
      });

      it("should return 200 if the request body is valid", async function () {
        const requestBody = {
          endDatetime: completeRecord.endDatetime,
          totalTime: completeRecord.totalTime,
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(200);

        const expectedRecord: any = structuredClone(completeRecord);
        delete expectedRecord.status;

        expect(response.body).to.deep.contain(expectedRecord);
      });

      it("should return 400 if totalTime field is missing", async function () {
        const requestBody = {
          endDatetime: completeRecord.endDatetime,
          // totalTime is missing
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if endDatetime field is missing", async function () {
        const requestBody = {
          // endDatetime is missing
          totalTime: completeRecord.totalTime,
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if totalTime field is invalid", async function () {
        const requestBody = {
          endDatetime: completeRecord.endDatetime,
          totalTime: "invalid",
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if endDatetime field is invalid", async function () {
        const requestBody = {
          endDatetime: "invalid",
          totalTime: completeRecord.totalTime,
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if totalTime field is not equal to the calculated total time", async function () {
        let totalTime;

        if (completeRecord.totalTime === "01:00") {
          totalTime = "02:00";
        } else {
          totalTime = "01:00";
        }

        const requestBody = {
          endDatetime: completeRecord.endDatetime,
          totalTime,
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });

      it("should return 400 if the endDatetime field is before the user's clock-in time", async function () {
        const requestBody = {
          endDatetime: dayjs(completeRecord.startDatetime)
            .subtract(1, "hour")
            .toISOString(),
          totalTime: "01:00",
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(400);
      });
    });

    describe("and the user does not have any records", function () {
      it("should return 409 even if the request body is valid", async function () {
        const requestBody = {
          endDateTime: now,
          totalTime: "00:15",
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });

      it("should return 409 even if the request body is invalid", async function () {
        const requestBody = {
          endDateTime: "invalid datetime",
          // totalTime is missing
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });
    });

    describe("and the user is NOT clocked-in", function () {
      beforeEach(function () {
        const records = [
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userB.username).build(),
        ];

        records.forEach((record) => {
          googleSheetsSimulator.addCondensedTimesheetRecord(record);
        });
      });

      it("should return 409 even if the request body is valid", async function () {
        const requestBody = {
          endDateTime: now,
          totalTime: "00:15",
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });

      it("should return 409 even if the request body is invalid", async function () {
        const requestBody = {
          endDateTime: "invalid datetime",
          // totalTime is missing
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });
    });
  });
});
