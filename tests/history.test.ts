import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";

import CondensedTimesheetRecordCreator from "./data/condensedTimesheetRecordCreator";
import GoogleSheetsDatabaseSimulator from "./data/googleSheetsDatabaseSimulator";
import createApp from "../src/app";
import { type CondensedTimesheetRecord } from "../src/models/condensedTimesheetRecord";

const historyUrl = "/api/v1/user/history";

const user = {
  username: "Test Username",
  password: "Test Password",
};

const userWithoutTimesheetRecords = {
  username: "Random Username",
  password: "Random Password",
};

describe("GET /history request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  beforeEach(function () {
    googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();

    googleSheetsSimulator.addUser(user.username, user.password);
    googleSheetsSimulator.addUser(
      userWithoutTimesheetRecords.username,
      userWithoutTimesheetRecords.password
    );
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("with valid user credentials in the request", function () {
    describe("when the database has 1 compete timesheet record", function () {
      let clientResponse: CondensedTimesheetRecord;

      beforeEach(function () {
        clientResponse = new CondensedTimesheetRecordCreator(
          user.username
        ).build();

        googleSheetsSimulator.addCondensedTimesheetRecord(clientResponse);
      });

      it("should return 200 with a the record for the current user", async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(user.username, user.password);

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.deep.equal([clientResponse]);
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

    describe("when the database has multiple compete timesheet records", function () {});
  });
});
