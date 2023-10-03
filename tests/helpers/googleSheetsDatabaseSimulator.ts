import sinon, { type SinonStub } from "sinon";

import GoogleSheetsDatabase from "../../src/db/googleSheetsDatabase";
import {
  loginSheetRange,
  timesheetSheetRange,
} from "../../src/db/timeeySheetsApi";
import { type CondensedTimesheetRecord } from "../../src/models/condensedTimesheetRecord";
import { isCompleteExpandedTimesheetRecord } from "../../src/models/expandedTimesheetRecord";
import logger from "../../src/utils/logger";
import { expandTimesheetRecord } from "../../src/utils/timesheetRecordConverter";

class GoogleSheetsDatabaseSimulator {
  private readonly users: string[][];
  private readonly timesheetRecords: string[][];
  private readonly getRangeStub: SinonStub;

  constructor() {
    this.users = [["username", "password"]];
    this.timesheetRecords = [
      ["id", "username", "date", "startTime", "endTime", "totalTime", "status"],
    ];

    sinon.replace(
      GoogleSheetsDatabase.prototype,
      "connect",
      sinon.fake.rejects(
        new Error("Should not connect to Google Sheets Database for tests")
      )
    );

    sinon.replace(
      GoogleSheetsDatabase.prototype,
      "setRange",
      async (range: string, values: string[][]) => {
        logger.debug("🫦🫦🫦");
      }
    );

    sinon.replace(
      GoogleSheetsDatabase.prototype,
      "appendRange",
      sinon.fake.resolves(true)
    );

    // sinon.replace(
    //   GoogleSheetsDatabase.prototype,
    //   "getRange",
    //   sinon.fake.resolves(true)
    // );

    this.getRangeStub = sinon.stub(GoogleSheetsDatabase.prototype, "getRange");

    this.getRangeStub.withArgs(loginSheetRange).resolves(this.users);

    this.getRangeStub
      .withArgs(timesheetSheetRange)
      .resolves(this.timesheetRecords);
  }

  public addUser(username: string, password: string): void {
    this.users.push([username, password]);
  }

  public addCondensedTimesheetRecord(
    condensedRecord: CondensedTimesheetRecord
  ): void {
    const expandedRecord = expandTimesheetRecord(condensedRecord);

    if (isCompleteExpandedTimesheetRecord(expandedRecord)) {
      this.timesheetRecords.push([
        expandedRecord.id,
        expandedRecord.username,
        expandedRecord.date,
        expandedRecord.startTime,
        expandedRecord.endTime,
        expandedRecord.totalTime,
        expandedRecord.status,
      ]);
    } else {
      this.timesheetRecords.push([
        expandedRecord.id,
        expandedRecord.username,
        expandedRecord.date,
        expandedRecord.startTime,
        "",
        "",
        expandedRecord.status,
      ]);
    }
  }
}

export default GoogleSheetsDatabaseSimulator;
