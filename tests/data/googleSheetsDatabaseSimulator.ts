import sinon, { type SinonStub } from "sinon";

import GoogleSheetsDatabase from "../../src/db/googleSheetsDatabase";
import { type CondensedTimesheetRecord } from "../../src/models/condensedTimesheetRecord";
import { isCompleteExpandedTimesheetRecord } from "../../src/models/expandedTimesheetRecord";
import { expandTimesheetRecord } from "../../src/utils/timesheetRecordConverter";

const loginSheetRage = "Login Info!A:B";
const timesheetSheetRange = "Timesheet!A:F";

class GoogleSheetsDatabaseSimulator {
  private readonly users: string[][];
  private readonly timesheetRecords: string[][];
  private readonly getRangeStub: SinonStub;

  constructor() {
    this.users = [["username", "password"]];
    this.timesheetRecords = [
      ["username", "date", "startTime", "endTime", "totalTime", "status"],
    ];

    sinon.replace(
      GoogleSheetsDatabase.prototype,
      "connect",
      sinon.fake.rejects(
        new Error("Should not connect to Google Sheets Database for tests")
      )
    );

    this.getRangeStub = sinon.stub(GoogleSheetsDatabase.prototype, "getRange");

    this.getRangeStub.withArgs(loginSheetRage).resolves(this.users);

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
        expandedRecord.username,
        expandedRecord.date,
        expandedRecord.startTime,
        expandedRecord.endTime,
        expandedRecord.totalTime,
        expandedRecord.status,
      ]);
    } else {
      this.timesheetRecords.push([
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
