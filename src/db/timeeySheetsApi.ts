import { ZodError } from "zod";

import GoogleSheetsDatabase from "./googleSheetsDatabase";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import { expandedTimesheetRecordSchema } from "../models/expandedTimesheetRecord";
import StatusCodes from "../models/statusCodes";
import TimeeyError from "../models/TimeeyError";
import type UserCredentialsRecord from "../models/userCredentialsRecord";
import { userCredentialsRecordSchema } from "../models/userCredentialsRecord";
import logger from "../utils/logger";

const TimeeySheetsApi = {
  async getAllUserCredentials(): Promise<UserCredentialsRecord[]> {
    logger.verbose("🐵 Getting all user credentials from Google Sheets");

    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const loginSheetData = await googleSheetsDatabase.getRange(
      `Login Info!A:B`
    );

    const records = loginSheetData
      .slice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          const record = userCredentialsRecordSchema.parse({
            username: row[0],
            password: row[1],
          });

          logger.debug(
            `🐵 Parsed User Credentials Record ${index + 1}: ${JSON.stringify(
              record
            )}`
          );

          return record;
        } catch (error: unknown) {
          throw TimeeyError.fromObject({
            type: "Google Sheets Parsing Error",
            message: `Error parsing user credentials record from row: ${
              index + 2 // +2 because we skipped the first row and google sheets is 1-indexed
            }`,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            data: error instanceof ZodError ? error.issues : error,
          });
        }
      });

    logger.info("🐵 Got all User Credential Records from Google Sheets");
    return records;
  },

  async getTimesheet(): Promise<ExpandedTimesheetRecord[]> {
    logger.verbose("🐵 Getting Timesheet Records from Google Sheets");
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const timesheetSheetData = await googleSheetsDatabase.getRange(
      `Timesheet!A:G`
    );

    const records = timesheetSheetData
      .splice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          const record = expandedTimesheetRecordSchema.parse({
            username: row[0],
            date: row[1],
            startTime: row[2],
            endTime: row[3],
            totalTime: row[4],
            status: row[5],
            comments: row[6],
          });

          logger.debug(
            `🐵 Parsed Timesheet Record ${index + 1}: ${JSON.stringify(record)}`
          );

          return record;
        } catch (error: unknown) {
          throw TimeeyError.fromObject({
            type: "Google Sheets Parsing Error",
            message: `Error parsing timesheet record from row: ${
              index + 2 // +2 because we skipped the first row and google sheets is 1-indexed
            }`,
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            data: error instanceof ZodError ? error.issues : error,
          });
        }
      });

    logger.info("🐵 Got Timesheet Records from Google Sheets");
    return records;
  },

  async appendTimesheet(newRow: ExpandedTimesheetRecord): Promise<void> {
    logger.verbose(`🐵 Appending row to Timesheet`);
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const values = [
      [
        newRow.username,
        newRow.date,
        newRow.startTime,
        newRow.endTime ?? "",
        newRow.totalTime ?? "",
        newRow.status,
        newRow.comments ?? "",
      ],
    ];

    await googleSheetsDatabase.appendRange(`Timesheet!A:G`, values);
    logger.info(`🐵 Appended row to Timesheet`);
  },

  async updateTimesheet(
    rowIndex: number,
    updatedRow: ExpandedTimesheetRecord
  ): Promise<void> {
    logger.verbose(`🐵 Updating row ${rowIndex} in Timesheet`);
    const googleSheetsDatabase = new GoogleSheetsDatabase();

    const values = [
      [
        updatedRow.username,
        updatedRow.date,
        updatedRow.startTime,
        updatedRow.endTime ?? "",
        updatedRow.totalTime ?? "",
        updatedRow.status,
        updatedRow.comments ?? "",
      ],
    ];

    await googleSheetsDatabase.setRange(
      `Timesheet!A${rowIndex + 2}:G${rowIndex + 2}`,
      values
    );

    logger.info(`🐵 Updated row ${rowIndex} in Timesheet`);
  },
};

export default TimeeySheetsApi;
