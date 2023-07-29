import { google, type sheets_v4 } from "googleapis";

import getConfig from "../config";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
import logger from "../utils/logger";

class GoogleSheetsDatabase {
  spreadsheetId: string = getConfig().googleSheets.spreadsheetId;
  spreadsheetInstance?: sheets_v4.Sheets;

  static instance: GoogleSheetsDatabase;

  constructor() {
    // create singleton
    if (GoogleSheetsDatabase.instance != null) {
      return GoogleSheetsDatabase.instance;
    }

    GoogleSheetsDatabase.instance = this;
    logger.verbose("🤖 Created Google Sheets Database instance");
  }

  async connect(): Promise<void> {
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    const auth = await google.auth.getClient({ scopes });
    this.spreadsheetInstance = google.sheets({
      version: "v4",
      auth,
    });

    logger.info("🤖 Connected to Google Sheets");
  }

  async getRange(range: string): Promise<string[][]> {
    if (this.spreadsheetInstance == null) {
      throw new PamnaniError(
        "Server Error",
        `Tried to get range '${range}' before connecting to Google Sheets`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    logger.verbose(`🤖 Getting range '${range}' from Google Sheets`);
    const response = await this.spreadsheetInstance.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    logger.info(`🤖 Got range '${range}' from Google Sheets`);

    return response.data.values ?? [];
  }

  async setRange(range: string, values: string[][]): Promise<void> {
    if (this.spreadsheetInstance == null) {
      throw new PamnaniError(
        "Server Error",
        `Tried to set range '${range}' before connecting to Google Sheets`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    logger.verbose(`🤖 Setting range '${range}' in Google Sheets`);
    await this.spreadsheetInstance.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
    logger.info(`🤖 Set range '${range}' in Google Sheets completed`);
  }

  async appendRange(range: string, values: string[][]): Promise<void> {
    if (this.spreadsheetInstance == null) {
      throw new PamnaniError(
        "Server Error",
        `Tried to append range '${range}' before connecting to Google Sheets`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    logger.verbose(`🤖 Appending range '${range}' in Google Sheets`);
    await this.spreadsheetInstance.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS", // only insert new rows, don't overwrite existing rows
      requestBody: {
        values,
      },
    });
    logger.info(`🤖 Appending range '${range}' in Google Sheets completed`);
  }
}

export default GoogleSheetsDatabase;
