import { ZodError } from 'zod'

import getGoogleSheetsDatabase from './googleSheetsDatabase'
import Converter from '../converters'
import logger from '../logger'
import ErrorType from '../models/errorType'
import type GoogleSheetsRow from '../models/googleSheetsRow'
import TimeeyError from '../models/timeeyError'
import type TimesheetRecord from '../models/timesheetRecord'
import { isClockedInRecord } from '../models/timesheetRecord'
import type UserCredentials from '../models/userCredentials'

const loginSheetRange = 'Login Info!A:B'
const timesheetRange = 'Timesheet!A:H'
const calcTimesheetRowRange = (index: number): string =>
  `Timesheet!A${index}:H${index}`

const createParsingError = (
  error: unknown,
  row: GoogleSheetsRow,
  index: number
): TimeeyError => {
  return new TimeeyError({
    type: ErrorType.PARSING_ERROR,
    message: `Could not parse Google Sheets row: ${index + 2}`,
    data: {
      rowData: row,
      error: error instanceof ZodError ? error.issues : error,
    },
  })
}

const TimeeySheetsApi = {
  async getAllUserCredentials(): Promise<UserCredentials[]> {
    logger.verbose('🦍 Getting all user credentials from Google Sheets...')
    const googleSheetsDatabase = getGoogleSheetsDatabase()
    const loginSheetValues =
      await googleSheetsDatabase.getRange(loginSheetRange)

    const allUserCredentials = loginSheetValues
      .slice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          return Converter.fromGoogleSheetsRow(row).toUserCredentials()
        } catch (error: unknown) {
          throw createParsingError(error, row, index)
        }
      })

    logger.info('🦍 ... Got all user credentials')
    logger.debug(
      `🦍 Received user credentials: ${JSON.stringify(allUserCredentials)}`
    )
    return allUserCredentials
  },

  async getTimesheet(): Promise<TimesheetRecord[]> {
    logger.verbose('🦍  Getting timesheet ...')
    const googleSheetsDatabase = getGoogleSheetsDatabase()
    const timesheetValues = await googleSheetsDatabase.getRange(timesheetRange)

    const timesheetRecords = timesheetValues
      .slice(1) // skip the first row - the headings
      .map((row, index) => {
        try {
          return Converter.fromGoogleSheetsRow(row).toTimesheetRecord()
        } catch (error: unknown) {
          throw createParsingError(error, row, index)
        }
      })

    logger.info('🦍 ... Got timesheet')
    logger.debug(`🦍  Received timesheet: ${JSON.stringify(timesheetRecords)}`)
    return timesheetRecords
  },

  async appendTimesheet(newRecord: TimesheetRecord): Promise<void> {
    logger.verbose('🦍 Appending timesheet ...')

    const newValues =
      Converter.fromTimesheetRecord(newRecord).toGoogleSheetsRow()

    const googleSheetsDatabase = getGoogleSheetsDatabase()
    await googleSheetsDatabase.appendRange(timesheetRange, [newValues])

    logger.info('🦍 ... Appended timesheet in Google Sheets')
  },

  async updateTimesheet(updatedRecord: TimesheetRecord): Promise<void> {
    logger.verbose('🦍 Updating timesheet ...')

    const timesheet = await this.getTimesheet()
    const recordIndex = timesheet.findIndex(
      (record) => record.id === updatedRecord.id
    )

    if (recordIndex === -1) {
      throw new TimeeyError({
        type: ErrorType.TIMESHEET_RECORD_NOT_FOUND,
        message: `Timesheet record with id '${updatedRecord.id}' not found`,
        data: updatedRecord,
      })
    }

    const range = calcTimesheetRowRange(recordIndex + 2)

    const updatedValues =
      Converter.fromTimesheetRecord(updatedRecord).toGoogleSheetsRow()

    const googleSheetsDatabase = getGoogleSheetsDatabase()
    await googleSheetsDatabase.setRange(range, [updatedValues])

    logger.info('🦍 ... Updated timesheet')
  },

  async getClockInTimesheetRecord(
    username: string
  ): Promise<TimesheetRecord | null> {
    logger.verbose(`🦍 Getting clock-in timesheet record for ${username} ...`)

    const timesheet = await this.getTimesheet()
    const matchingRecord = timesheet.find(
      (record) => record.username === username && isClockedInRecord(record)
    )

    if (matchingRecord == null) {
      logger.warn(`🦍 No clock-in timesheet record found for ${username}`)
      return null
    }

    logger.info(`🦍 ... Got clock-in timesheet record for ${username}`)
    logger.debug(
      `🦍 Received clock-in timesheet record: ${JSON.stringify(matchingRecord)}`
    )
    return matchingRecord
  },
}

export default TimeeySheetsApi
export { loginSheetRange, timesheetRange }
