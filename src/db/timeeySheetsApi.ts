import NodeCache from "node-cache";
import { ZodError } from "zod";

import GoogleSheetsDatabase from "./googleSheetsDatabase";
import getConfig from "../config";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import { expandedTimesheetRecordSchema } from "../models/expandedTimesheetRecord";
import StatusCodes from "../models/statusCodes";
import TimeeyError from "../models/TimeeyError";
import type UserCredentialsRecord from "../models/userCredentialsRecord";
import { userCredentialsRecordSchema } from "../models/userCredentialsRecord";
import logger from "../utils/logger";

export const loginSheetRange = "Login Info!A:B";
export const timesheetSheetRange = "Timesheet!A:H";
const startColumn = "A";
const endColumn = "H";

const cache = new NodeCache({
  stdTTL: getConfig().cacheEnabled
    ? 60 // default TTL for all keys in seconds - 1 minute
    : -1, // 0 means never expire, -1 means always expire
});

const TimeeySheetsApi = {
  async getAllUserCredentials(): Promise<UserCredentialsRecord[]> {
    const cachedUserCredentials: UserCredentialsRecord[] | undefined =
      cache.get("user-credentials");

    if (cachedUserCredentials != null) {
      logger.verbose("🐵 Got user credentials from cache");
      return cachedUserCredentials;
    }

    logger.verbose("🐵 Getting all user credentials from Google Sheets");

    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const loginSheetData = await googleSheetsDatabase.getRange(loginSheetRange);

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
    cache.set("user-credentials", records);
    return records;
  },

  async getTimesheet(): Promise<ExpandedTimesheetRecord[]> {
    logger.verbose("🐵 Getting Timesheet Records from Google Sheets");
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const timesheetSheetData = await googleSheetsDatabase.getRange(
      timesheetSheetRange
    );

    const records = timesheetSheetData
      .splice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          const record = expandedTimesheetRecordSchema.parse({
            id: row[0],
            username: row[1],
            date: row[2],
            startTime: row[3],
            endTime: row[4],
            totalTime: row[5],
            status: row[6],
            comments: row[7],
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

  async getTimesheetRecordById(
    id: string
  ): Promise<[ExpandedTimesheetRecord, number]> {
    logger.verbose(`🐵 Getting Timesheet Record with id: ${id}`);
    const timesheet = await TimeeySheetsApi.getTimesheet();
    logger.debug(`IN GET TIMESHEET RECORD BY ID ${JSON.stringify(timesheet)}`);
    const rowNumber = timesheet.findIndex((row) => row.id === id);

    if (rowNumber === -1) {
      throw TimeeyError.fromObject({
        type: "Timesheet Record Not Found",
        message: `Timesheet record with id: '${id}' not found`,
        code: StatusCodes.NOT_FOUND,
      });
    }

    logger.info(`🐵 Got Timesheet Record with id: ${id}`);
    return [timesheet[rowNumber], rowNumber];
  },

  async appendTimesheet(newRow: ExpandedTimesheetRecord): Promise<void> {
    logger.verbose(`🐵 Appending row to Timesheet`);
    const googleSheetsDatabase = new GoogleSheetsDatabase();
    const values = [
      [
        newRow.id,
        newRow.username,
        newRow.date,
        newRow.startTime,
        newRow.endTime ?? "",
        newRow.totalTime ?? "",
        newRow.status,
        newRow.comments ?? "",
      ],
    ];

    await googleSheetsDatabase.appendRange(timesheetSheetRange, values);
    logger.info(`🐵 Appended row to Timesheet`);
  },

  async updateTimesheet(updatedRow: ExpandedTimesheetRecord): Promise<void> {
    logger.verbose(
      `💦💦💦 Updating row with id: ${updatedRow.id} in Timesheet`
    );

    const [, rowNumber] = await TimeeySheetsApi.getTimesheetRecordById(
      updatedRow.id
    );

    logger.verbose(
      `🐵 Found row with id: ${updatedRow.id}, row number: ${rowNumber} in Timesheet`
    );

    const values = [
      [
        updatedRow.id,
        updatedRow.username,
        updatedRow.date,
        updatedRow.startTime,
        updatedRow.endTime ?? "",
        updatedRow.totalTime ?? "",
        updatedRow.status,
        updatedRow.comments ?? "",
      ],
    ];

    const googleSheetsDatabase = new GoogleSheetsDatabase();
    await googleSheetsDatabase.setRange(
      `Timesheet!${startColumn}${rowNumber + 2}:${endColumn}${rowNumber + 2}`, // +1 because google sheets is 1-indexed, +1 because we skipped the first row
      values
    );

    logger.info(`🐵 Updated row ${rowNumber} in Timesheet`);
  },
};

export default TimeeySheetsApi;
