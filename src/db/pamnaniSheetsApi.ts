import { ZodError } from "zod";

import GoogleSheetsDatabase from "./googleSheetsDatabase";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
import type TimesheetRecord from "../models/timesheetRecord";
import {
  type CompleteTimesheetRecord,
  timesheetRecordSchema,
} from "../models/timesheetRecord";
import type UserCredentialsRecord from "../models/userCredentialsRecord";
import { userCredentialsRecordSchema } from "../models/userCredentialsRecord";

const PamnaniSheetsApi = {
  async getAllUserCredentials(): Promise<UserCredentialsRecord[]> {
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const loginSheetData = await googleSheetsDatabase.getRange(
      `Login Info!A:B`
    );

    return loginSheetData
      .slice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          return userCredentialsRecordSchema.parse({
            username: row[0],
            password: row[1],
          });
        } catch (error: unknown) {
          throw PamnaniError.fromObject({
            type: "Google Sheets Parsing Error",
            message: `Error parsing user credentials record from row: ${
              index + 2 // +2 because we skipped the first row and google sheets is 1-indexed
            }`,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            data: error instanceof ZodError ? error.issues : error,
          });
        }
      });
  },

  async getTimesheet(): Promise<TimesheetRecord[]> {
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const timesheetSheetData = await googleSheetsDatabase.getRange(
      `Timesheet!A:F`
    );

    return timesheetSheetData
      .splice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          return timesheetRecordSchema.parse({
            username: row[0],
            date: row[1],
            startTime: row[2],
            endTime: row[3],
            totalTime: row[4],
            status: row[5],
          });
        } catch (error: unknown) {
          throw PamnaniError.fromObject({
            type: "Google Sheets Parsing Error",
            message: `Error parsing timesheet record from row: ${
              index + 2 // +2 because we skipped the first row and google sheets is 1-indexed
            }`,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            data: error instanceof ZodError ? error.issues : error,
          });
        }
      });
  },

  async appendTimesheet(newRow: TimesheetRecord): Promise<void> {
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const values = [
      [
        newRow.username,
        newRow.date,
        newRow.startTime,
        "endTime" in newRow ? newRow.endTime : "",
        "totalTime" in newRow ? newRow.totalTime : "",
        newRow.status,
      ],
    ];

    await googleSheetsDatabase.appendRange(`Timesheet!A:F`, values);
  },

  async updateTimesheet(
    rowIndex: number,
    updatedRow: CompleteTimesheetRecord
  ): Promise<void> {
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const values = [
      [
        updatedRow.username,
        updatedRow.date,
        updatedRow.startTime,
        "endTime" in updatedRow ? updatedRow.endTime : "",
        "totalTime" in updatedRow ? updatedRow.totalTime : "",
        updatedRow.status,
      ],
    ];

    await googleSheetsDatabase.setRange(
      `Timesheet!A${rowIndex + 2}:F${rowIndex + 2}`,
      values
    );
  },
};

export default PamnaniSheetsApi;
