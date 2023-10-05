import sinon from 'sinon'

import Converter from '../../src/converters'
import * as GoogleSheetsDatabaseModule from '../../src/db/googleSheetsDatabase'
import { loginSheetRange, timesheetRange } from '../../src/db/timeeySheetsApi'
import ErrorType from '../../src/models/errorType'
import type GoogleSheetsRow from '../../src/models/googleSheetsRow'
import TimeeyError from '../../src/models/timeeyError'
import type TimesheetRecord from '../../src/models/timesheetRecord'
import type UserCredentials from '../../src/models/userCredentials'

class GoogleSheetsDatabaseSimulator {
  loginSheetValues: GoogleSheetsRow[] = []
  timesheetValues: GoogleSheetsRow[] = []

  resetValues(): void {
    // reset values without reallocation
    this.loginSheetValues.splice(0, this.loginSheetValues.length)
    this.timesheetValues.splice(0, this.timesheetValues.length)

    this.loginSheetValues.push(['username', 'password'])
    this.timesheetValues.push([
      'id',
      'username',
      'date',
      'start time',
      'end time',
      'total time',
      'status',
      'comments',
    ])
  }

  setup(): void {
    this.resetValues()

    const googleSheetsDatabaseStub = sinon.createStubInstance(
      GoogleSheetsDatabaseModule.GoogleSheetsDatabase
    )

    googleSheetsDatabaseStub.getRange
      .withArgs(loginSheetRange)
      .resolves(this.loginSheetValues)

    googleSheetsDatabaseStub.getRange
      .withArgs(timesheetRange)
      .resolves(this.timesheetValues)

    googleSheetsDatabaseStub.getRange.throws(
      new TimeeyError({
        type: ErrorType.TESTING_ERROR,
        message:
          "Invalid range provided to GoogleSheetsDatabase's getRange method",
      })
    )

    sinon.replace(
      GoogleSheetsDatabaseModule,
      'default',
      () => googleSheetsDatabaseStub
    )
  }

  addUser(user: UserCredentials): void {
    this.loginSheetValues.push(
      Converter.fromUserCredentials(user).toGoogleSheetsRow()
    )
  }

  addTimesheetRecord(record: TimesheetRecord): void {
    this.timesheetValues.push(
      Converter.fromTimesheetRecord(record).toGoogleSheetsRow()
    )
  }

  getUserTimesheetRecords(username: string): TimesheetRecord[] {
    return this.timesheetValues
      .slice(1) // skip the first row - the headings
      .map((row, index) => {
        return Converter.fromGoogleSheetsRow(row).toTimesheetRecord()
      })
      .filter((record) => record.username === username)
  }
}

export default GoogleSheetsDatabaseSimulator
