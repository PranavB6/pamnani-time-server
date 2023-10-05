import TimesheetRecordCreator from './timesheetRecordCreator'
import type TimesheetRecord from '../../src/models/timesheetRecord'
import sortTimesheetRecords from '../../src/utils/sortTimesheetRecords'

class TimesheetBuilder {
  timesheetRecords: TimesheetRecord[] = []

  add(
    username: string,
    { count = 1, clockOut = true }: { count?: number; clockOut?: boolean }
  ): TimesheetBuilder {
    for (let i = 0; i < count; i++) {
      const record = new TimesheetRecordCreator().clockIn(username)

      if (clockOut) {
        record.clockOut()
      }

      this.timesheetRecords.push(record.build())
    }

    return this
  }

  build(): TimesheetRecord[] {
    return sortTimesheetRecords(this.timesheetRecords)
  }
}

export default TimesheetBuilder
