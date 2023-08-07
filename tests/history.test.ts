import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";

import CondensedTimesheetRecordCreator from "./helpers/condensedTimesheetRecordCreator";
import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";
import { type CondensedTimesheetRecord } from "../src/models/condensedTimesheetRecord";

const historyUrl = "/api/v1/user/history";

const userA = {
  username: "User A",
  password: "Password A",
};

const userB = {
  username: "User B",
  password: "Password B",
};

const userWithoutTimesheetRecords = {
  username: "Random Username",
  password: "Random Password",
};

describe("GET /history request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  beforeEach(function () {
    googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();

    [userA, userB, userWithoutTimesheetRecords].forEach((user) => {
      googleSheetsSimulator.addUser(user.username, user.password);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("with valid user credentials in the request", function () {
    describe("when the database has 1 compete timesheet record", function () {
      let timesheetRecord: CondensedTimesheetRecord;

      beforeEach(function () {
        timesheetRecord = new CondensedTimesheetRecordCreator(
          userA.username
        ).build();

        googleSheetsSimulator.addCondensedTimesheetRecord(timesheetRecord);
      });

      it("should return 200 with a the record for the current user", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userA.username, userA.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([timesheetRecord]);
      });

      it("should return an empty array if there are no records for the user", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(
            userWithoutTimesheetRecords.username,
            userWithoutTimesheetRecords.password
          );

        expect(response.body).to.be.deep.equal([]);
      });
    });

    describe("when the database has multiple compete timesheet records", function () {
      let timesheetRecords: CondensedTimesheetRecord[];

      beforeEach(function () {
        timesheetRecords = [
          new CondensedTimesheetRecordCreator(userA.username).build(),
          new CondensedTimesheetRecordCreator(userB.username).build(),
          new CondensedTimesheetRecordCreator(userA.username).build(),
        ];

        timesheetRecords.forEach((record) => {
          googleSheetsSimulator.addCondensedTimesheetRecord(record);
        });
      });

      it("should return 200 with a the records for the current user A", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userA.username, userA.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([
          timesheetRecords[0],
          timesheetRecords[2],
        ]);
      });

      it("should return 200 with a the records for the current user B", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userB.username, userB.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([timesheetRecords[1]]);
      });
    });

    describe("when the database has clocked in and complete timesheet records", function () {
      let timesheetRecords: CondensedTimesheetRecord[];

      beforeEach(function () {
        timesheetRecords = [
          new CondensedTimesheetRecordCreator(userA.username)
            .makeClockIn()
            .build(),
          new CondensedTimesheetRecordCreator(userB.username)
            .makeClockIn()
            .build(),
          new CondensedTimesheetRecordCreator(userA.username).build(),
        ];

        timesheetRecords.forEach((record) => {
          googleSheetsSimulator.addCondensedTimesheetRecord(record);
        });
      });

      it("should return 200 with a the records for the current user A", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userA.username, userA.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([
          timesheetRecords[0],
          timesheetRecords[2],
        ]);
      });

      it("should return 200 with a the records for the current user B", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userB.username, userB.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([timesheetRecords[1]]);
      });
    });
  });

  describe("with invalid user credentials in the request", function () {
    it("should return 401", async function () {
      const response = await supertest(createApp())
        .get(historyUrl)
        .auth("Invalid Username", "Invalid Password");

      expect(response.status).to.be.equal(401);
    });
  });
});
