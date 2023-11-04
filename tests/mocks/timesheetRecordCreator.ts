import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'

import type TimesheetRecord from '../../src/models/timesheetRecord'
import { timesheetRecordSchema } from '../../src/models/timesheetRecord'
import calculateTotalTime from '../../src/utils/calculateTotalTime'

dayjs.extend(utc)
dayjs.extend(timezone)

const defaultTimezone = 'America/Edmonton'

const formatDate = (date: Date): string => {
  return dayjs(date).set('millisecond', 0).toISOString()
}

const generateStartDatetimeAndEndDatetime = (): {
  startDatetime: string
  endDatetime: string
} => {
  const [dateA, dateB] = faker.date.betweens({
    from: dayjs()
      .tz(defaultTimezone)
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0)
      .toDate(),
    to: dayjs()
      .tz(defaultTimezone)
      .set('hour', 23)
      .set('minute', 59)
      .set('second', 59)
      .toDate(),
    count: 2,
  })

  let startDatetime
  let endDatetime

  if (dayjs(dateA).isBefore(dateB)) {
    startDatetime = formatDate(dateA)
    endDatetime = formatDate(dateB)
  } else {
    startDatetime = formatDate(dateB)
    endDatetime = formatDate(dateA)
  }

  return { startDatetime, endDatetime }
}

class TimesheetRecordCreator {
  record: TimesheetRecord

  endDatetime?: string

  constructor() {
    this.record = {
      username: '',
      id: '',
      startDatetime: '',
      endDatetime: '',
      totalTime: '',
      status: '',
      comments: '',
    }
  }

  clockIn(username: string): TimesheetRecordCreator {
    const { startDatetime, endDatetime } = generateStartDatetimeAndEndDatetime()
    this.endDatetime = endDatetime

    this.record.id = uuidv4()
    this.record.username = username
    this.record.startDatetime = startDatetime
    this.record.status = 'CLOCKED IN'

    return this
  }

  clockInWithStartDatetime(
    username: string,
    startDatetime: string
  ): TimesheetRecordCreator {
    this.record.id = uuidv4()
    this.record.username = username
    this.record.startDatetime = startDatetime
    this.record.status = 'CLOCKED IN'

    return this
  }

  clockOut(): TimesheetRecordCreator {
    if (this.endDatetime == null) {
      throw new Error('Cannot clock out without clocking in')
    }

    this.record.endDatetime = this.endDatetime
    this.record.totalTime = calculateTotalTime(
      this.record.startDatetime ?? '',
      this.record.endDatetime ?? ''
    )
    this.record.status = 'PENDING APPROVAL'
    this.record.comments = faker.lorem.sentence()

    return this
  }

  build(): TimesheetRecord {
    return timesheetRecordSchema.parse(this.record)
  }
}

export default TimesheetRecordCreator
