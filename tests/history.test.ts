import { expect } from "chai";
import sinon, { type SinonStub } from "sinon";
import supertest from "supertest";

import createApp from "../src/app";
import GoogleSheetsDatabase from "../src/db/googleSheetsDatabase";
import { type ClientTimesheetResponse } from "../src/models/clientTimesheetRecord";
import type TimesheetRecord from "../src/models/timesheetRecord";
import { combineDateAndTime } from "../src/utils/datetimeConverter";

const historyUrl = "/api/v1/user/history";
const loginSheetRage = "Login Info!A:B";
const timesheetSheetRange = "Timesheet!A:F";
const user = {
  username: "Test Username",
  password: "Test Password",
};

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

describe("GET /history request", function () {
  let googleSheetsGetRangeStub: SinonStub;

  beforeEach(function () {
    googleSheetsGetRangeStub = createGoogleSheetsDatabaseGetRangeStub();

    googleSheetsGetRangeStub.withArgs(loginSheetRage).resolves([
      ["username", "password"],
      [user.username, user.password],
    ]);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("with valid user credentials in the request", function () {
    describe("when the database has 1 compete timesheet record", function () {
      const timesheetRecord: TimesheetRecord = {
        username: user.username,
        date: "2021-09-01",
        startTime: "09:00",
        endTime: "17:00",
        totalTime: "8:00",
        status: "Approved",
      };

      const clientTimesheetResponse: ClientTimesheetResponse = {
        username: user.username,
        startDatetime: combineDateAndTime(
          timesheetRecord.date,
          timesheetRecord.startTime
        ),
        endDatetime: combineDateAndTime(
          timesheetRecord.date,
          timesheetRecord.endTime
        ),
        totalTime: timesheetRecord.totalTime,
        status: timesheetRecord.status,
      };

      beforeEach(function () {
        googleSheetsGetRangeStub.withArgs(timesheetSheetRange).resolves([
          ["username", "date", "startTime", "endTime", "totalTime", "status"],
          [
            timesheetRecord.username,
            timesheetRecord.date,
            timesheetRecord.startTime,
            timesheetRecord.endTime,
            timesheetRecord.totalTime,
            timesheetRecord.status,
          ],
        ]);
      });

      it("should return 200 with an array of 1 user", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(user.username, user.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([clientTimesheetResponse]);
      });
    });
  });
});
