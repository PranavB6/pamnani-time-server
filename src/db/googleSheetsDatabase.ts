import { google, type sheets_v4 } from 'googleapis'
import NodeCache from 'node-cache'

import getConfig from '../config'
import logger from '../logger'
import ErrorType from '../models/errorType'
import TimeeyError from '../models/timeeyError'
import emptyStringToNull from '../utils/emptyStringToUndefined'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const getSheetLabelFromRange = (range: string): string => {
  return range.split('!')[0]
}

class GoogleSheetsDatabase {
  static singletonInstance: GoogleSheetsDatabase

  private readonly spreadsheetId: string =
    getConfig().googleSheets.spreadsheetId

  private spreadsheetInstance?: sheets_v4.Sheets

  private readonly cache: NodeCache

  constructor() {
    // create cache
    const stdTTL = getConfig().cacheEnabled
      ? 5 // 5 seconds - default TTL for all keys in seconds
      : -1 // 0 means never expire, -1 means always expire

    this.cache = new NodeCache({
      stdTTL,
    })

    // create singleton instance
    logger.verbose('🤖 Creating Google Sheets Database instance...')
    if (GoogleSheetsDatabase.singletonInstance != null) {
      logger.verbose('🤖 ... Using existing Google Sheets Database instance')
      return GoogleSheetsDatabase.singletonInstance
    }

    GoogleSheetsDatabase.singletonInstance = this

    logger.info('🤖 ... Created Google Sheets Database instance')
  }

  private validateConnection(triedTo?: string): void {
    let fullMessage = 'Google Sheets is not connected'
    if (emptyStringToNull(triedTo) != null) {
      fullMessage = `Tried to ${triedTo} before connecting to Google Sheets`
    }

    if (this.spreadsheetInstance == null) {
      logger.error(`🤖: ${fullMessage}`)
      throw new TimeeyError({
        type: ErrorType.SERVER_ERROR,
        message: fullMessage,
      })
    }
  }

  async connect(): Promise<void> {
    logger.verbose('🤖 Connecting to Google Sheets...')
    const auth = await google.auth.getClient({ scopes: SCOPES })
    this.spreadsheetInstance = google.sheets({
      version: 'v4',
      auth,
    })

    logger.info('🤖 ... Connected to Google Sheets')
  }

  async getRange(range: string): Promise<string[][]> {
    logger.verbose(`🤖 Getting range '${range}' from Google Sheets...`)
    this.validateConnection(`get range '${range}'`)

    // check cache first
    const sheetLabel = getSheetLabelFromRange(range)
    const cachedValue: string[][] | undefined = this.cache.get(sheetLabel)

    if (cachedValue != null) {
      logger.verbose(`🤖 ... Got sheet '${sheetLabel}' from cache:`)
      logger.debug(`🤖 Cached Value: ${JSON.stringify(cachedValue)}`)
      return cachedValue
    }

    const response = await this.spreadsheetInstance?.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    })

    logger.info(`🤖 ... Got range '${range}' from Google Sheets`)
    logger.debug(
      `🤖 Received Response: ${JSON.stringify(response?.data?.values)}`
    )

    // cache response
    this.cache.set(sheetLabel, response?.data.values ?? [])

    return response?.data.values ?? []
  }

  async setRange(range: string, values: string[][]): Promise<void> {
    logger.verbose(`🤖 Setting range '${range}' in Google Sheets ...`)

    this.validateConnection(`set range '${range}'`)

    await this.spreadsheetInstance?.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    })

    // clear cache
    const sheetLabel = getSheetLabelFromRange(range)
    this.cache.del(sheetLabel)
    logger.verbose(`🤖 ... Cleared cache for sheet '${sheetLabel}'`)

    logger.info(`🤖 ... Set range '${range}' in Google Sheets`)
  }

  async appendRange(range: string, values: string[][]): Promise<void> {
    logger.verbose(`🤖 Appending range '${range}' in Google Sheets ...`)

    this.validateConnection(`append range '${range}'`)

    await this.spreadsheetInstance?.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', // only insert new rows, don't overwrite existing rows
      requestBody: {
        values,
      },
    })

    // clear cache
    const sheetLabel = getSheetLabelFromRange(range)
    this.cache.del(sheetLabel)
    logger.verbose(`🤖 ... Cleared cache for sheet '${sheetLabel}'`)

    logger.info(`🤖 ... Appended range '${range}' in Google Sheets`)
  }
}

const getGoogleSheetsDatabase = (): GoogleSheetsDatabase => {
  return new GoogleSheetsDatabase()
}

export default getGoogleSheetsDatabase
export { GoogleSheetsDatabase }
