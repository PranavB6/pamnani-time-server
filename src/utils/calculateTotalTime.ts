import dayjs, { type Dayjs } from 'dayjs'
import duration, { type Duration } from 'dayjs/plugin/duration'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import ErrorType from '../models/errorType'
import StatusCode from '../models/statusCode'
import TimeeyError from '../models/timeeyError'

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)

const defaultTimezone = 'America/Edmonton'

const ROUND_TO_NEAREST_MINUTES = 15

const calculateTotalTime = (
  startDatetimeString: string,
  endDatetimeString: string
): string => {
  const startDatetime = dayjs(startDatetimeString).tz(defaultTimezone)
  const endDatetime = dayjs(endDatetimeString).tz(defaultTimezone)

  if (!startDatetime.isValid()) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `Start datetime: '${startDatetimeString}' is invalid`,
      code: StatusCode.BAD_REQUEST,
    })
  }

  if (!endDatetime.isValid()) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `End datetime: '${endDatetimeString}' is invalid`,
      code: StatusCode.BAD_REQUEST,
    })
  }

  if (endDatetime.isBefore(startDatetime)) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `End datetime: '${endDatetimeString}' must be after start datetime: '${startDatetimeString}'`,
      code: StatusCode.BAD_REQUEST,
      data: {
        startDatetime: startDatetimeString,
        endDatetime: endDatetimeString,
      },
    })
  }

  const startDate = startDatetime.format('YYYY-MM-DD')
  const endDate = endDatetime.format('YYYY-MM-DD')

  if (startDate !== endDate) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `Start Date: '${startDate}' and End Date: '${endDate}' must be the same`,
      code: StatusCode.BAD_REQUEST,
    })
  }

  const duration = calculateRoundedDuration(startDatetime, endDatetime)
  const totalTime = duration.format('HH:mm')

  return totalTime
}

const calculateRoundedDuration = (
  startDatetime: Dayjs,
  endDatetime: Dayjs
): Duration => {
  const duration = dayjs.duration(endDatetime.diff(startDatetime))
  return roundDurationToNearestMinutes(duration, ROUND_TO_NEAREST_MINUTES)
}

const roundDurationToNearestMinutes = (
  duration: Duration,
  roundMinutes: number
): Duration => {
  const minutes = duration.minutes()

  const remainder = minutes % roundMinutes

  if (remainder >= Math.floor(roundMinutes / 2)) {
    return duration.add(roundMinutes - remainder, 'minutes')
  } else {
    return duration.subtract(remainder, 'minutes')
  }
}

export default calculateTotalTime
