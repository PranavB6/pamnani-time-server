import type GoogleSheetsRow from '../models/googleSheetsRow'
import type TimesheetRecord from '../models/timesheetRecord'
import { separateDateAndTime } from '../utils/datetimeConverter'
import emptyStringToUndefined from '../utils/emptyStringToUndefined'

const timesheetRecordToGoogleSheetsRow = (
  record: TimesheetRecord
): GoogleSheetsRow => {
  const { date, time: startTime } = separateDateAndTime(record.startDatetime)

  let endTime = ''
  if (
    record.endDatetime != null &&
    emptyStringToUndefined(record.endDatetime) != null
  ) {
    const { time } = separateDateAndTime(record.endDatetime)
    endTime = time
  }

  return [
    record.id,
    record.username,
    date,
    startTime,
    endTime,
    record.totalTime ?? '',
    record.status,
    record.comments,
  ]
}

export default timesheetRecordToGoogleSheetsRow
