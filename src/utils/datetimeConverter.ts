import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import ErrorType from '../models/errorType'
import StatusCode from '../models/statusCode'
import TimeeyError from '../models/timeeyError'

dayjs.extend(utc)
dayjs.extend(timezone)

const defaultTimezone = 'America/Edmonton'

const separateDateAndTime = (
  datetimeString: string
): {
  date: string
  time: string
} => {
  const datetime = dayjs(datetimeString).tz(defaultTimezone)

  if (!datetime.isValid()) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `Datetime: '${datetimeString}' is invalid`,
      code: StatusCode.BAD_REQUEST,
    })
  }

  return {
    date: datetime.format('YYYY-MM-DD'),
    time: datetime.format('HH:mm:ss'),
  }
}

const combineDateAndTime = (dateString: string, timeString: string): string => {
  const datetime = dayjs.tz(
    `${dateString} ${timeString}`,
    'YYYY-MM-DD HH:mm:ss',
    defaultTimezone
  )

  if (!datetime.isValid()) {
    throw new TimeeyError({
      type: ErrorType.INVALID_DATE,
      message: `Datetime: '${dateString} ${timeString}' is invalid`,
      code: StatusCode.BAD_REQUEST,
    })
  }

  return datetime.toISOString()
}

export { separateDateAndTime, combineDateAndTime }
