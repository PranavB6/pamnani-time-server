import type TimesheetRecord from '../models/timesheetRecord'

const sortTimesheetRecords = (
  records: TimesheetRecord[]
): TimesheetRecord[] => {
  return records.sort((a, b) => {
    return (
      new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()
    )
  })
}

export default sortTimesheetRecords
