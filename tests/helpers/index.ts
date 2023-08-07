import sinon, { type SinonStub } from "sinon";

import GoogleSheetsDatabase from "../../src/db/googleSheetsDatabase";
import { type CondensedTimesheetRecord } from "../../src/models/condensedTimesheetRecord";
import type ExpandedTimesheetRecord from "../../src/models/expandedTimesheetRecord";
import { isCompleteExpandedTimesheetRecord } from "../../src/models/expandedTimesheetRecord";
import { expandTimesheetRecord } from "../../src/utils/timesheetRecordConverter";

const loginSheetRage = "Login Info!A:B";
const timesheetSheetRange = "Timesheet!A:F";

export const createGoogleSheetsDatabaseGetRangeStub = (): SinonStub => {
  sinon.replace(
    GoogleSheetsDatabase.prototype,
    "connect",
    sinon.fake.rejects(
      new Error("Should not connect to Google Sheets Database for tests")
    )
  );

  return sinon.stub(GoogleSheetsDatabase.prototype, "getRange");
};

export const addUsersToGoogleSheetsGetRangeStub = (
  getRangeStub: SinonStub,
  users: Array<{ username: string; password: string }>
): void => {
  getRangeStub
    .withArgs(loginSheetRage)
    .resolves([
      ["username", "password"],
      ...users.map((user) => [user.username, user.password]),
    ]);
};

export const addTimesheetRecordsToGoogleSheetsGetRangeStub = (
  getRangeStub: SinonStub,
  timesheetRecords: CondensedTimesheetRecord[]
): void => {
  getRangeStub.withArgs(timesheetSheetRange).resolves([
    ["username", "date", "startTime", "endTime", "totalTime", "status"],
    ...timesheetRecords.map((condensedRecord) => {
      const expandedRecord: ExpandedTimesheetRecord =
        expandTimesheetRecord(condensedRecord);

      if (isCompleteExpandedTimesheetRecord(expandedRecord)) {
        return [
          expandedRecord.username,
          expandedRecord.date,
          expandedRecord.startTime,
          expandedRecord.endTime,
          expandedRecord.totalTime,
          expandedRecord.status,
        ];
      } else {
        return [
          expandedRecord.username,
          expandedRecord.date,
          expandedRecord.startTime,
          "",
          "",
          expandedRecord.status,
        ];
      }
    }),
  ]);
};
