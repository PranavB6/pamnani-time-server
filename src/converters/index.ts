import googleSheetsRowToTimesheetRecord from './googleSheetsRowToTimesheetRecord'
import googleSheetsRowToUserCredentials from './googleSheetsRowToUserCredentials'
import timesheetRecordToGoogleSheetsRow from './timesheetRecordToGoogleSheetsRow'
import userCredentialsToGoogleSheetsRows from './userCredentialsToGoogleSheetsRow'
import type GoogleSheetsRow from '../models/googleSheetsRow'
import type TimesheetRecord from '../models/timesheetRecord'
import type UserCredentials from '../models/userCredentials'

const Converter = {
  fromUserCredentials(userCredentials: UserCredentials) {
    return {
      toGoogleSheetsRow(): GoogleSheetsRow {
        return userCredentialsToGoogleSheetsRows(userCredentials)
      },
    }
  },
  fromGoogleSheetsRow(row: GoogleSheetsRow) {
    return {
      toUserCredentials(): UserCredentials {
        return googleSheetsRowToUserCredentials(row)
      },
      toTimesheetRecord(): TimesheetRecord {
        return googleSheetsRowToTimesheetRecord(row)
      },
    }
  },
  fromTimesheetRecord(timesheetRecord: TimesheetRecord) {
    return {
      toGoogleSheetsRow(): GoogleSheetsRow {
        return timesheetRecordToGoogleSheetsRow(timesheetRecord)
      },
    }
  },
}

export default Converter
