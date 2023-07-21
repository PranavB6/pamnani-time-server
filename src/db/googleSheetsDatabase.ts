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

    const response = await this.spreadsheetInstance.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

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

    await this.spreadsheetInstance.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  async appendRange(range: string, values: string[][]): Promise<void> {
    if (this.spreadsheetInstance == null) {
      throw new PamnaniError(
        "Server Error",
        `Tried to append range '${range}' before connecting to Google Sheets`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    await this.spreadsheetInstance.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS", // only insert new rows, don't overwrite existing rows
      requestBody: {
        values,
      },
    });
  }
}

export default GoogleSheetsDatabase;
