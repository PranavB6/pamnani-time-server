import type GoogleSheetsRow from '../models/googleSheetsRow'
import type TimesheetRecord from '../models/timesheetRecord'
import { timesheetRecordSchema } from '../models/timesheetRecord'
import { combineDateAndTime } from '../utils/datetimeConverter'
import emptyStringToUndefined from '../utils/emptyStringToUndefined'

const googleSheetsRowToTimesheetRecord = (
  row: GoogleSheetsRow
): TimesheetRecord => {
  const [id, username, date, startTime, endTime, totalTime, status, comments] =
    row

  const startDatetime = combineDateAndTime(date, startTime)

  let endDatetime = ''
  if (emptyStringToUndefined(endTime) != null) {
    endDatetime = combineDateAndTime(date, endTime)
  }

  return timesheetRecordSchema.parse({
    id,
    username,
    startDatetime,
    endDatetime,
    totalTime,
    status,
    comments,
  })
}

export default googleSheetsRowToTimesheetRecord
