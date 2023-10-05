import { type Request, type Response, Router } from 'express'
import { z } from 'zod'

import TimeeySheetsApi from '../../db/timeeySheetsApi'
import logger from '../../logger'
import auth from '../../middlewares/auth'
import ErrorType from '../../models/errorType'
import StatusCode from '../../models/statusCode'
import TimeeyError from '../../models/timeeyError'
import type TimesheetRecord from '../../models/timesheetRecord'
import { timesheetRecordSchema } from '../../models/timesheetRecord'
import type UserCredentials from '../../models/userCredentials'
import calculateTotalTime from '../../utils/calculateTotalTime'
import { separateDateAndTime } from '../../utils/datetimeConverter'
import expressAsyncHandler from '../../utils/expressAsyncHandler'

const clientClockOutRequestSchema = z.object({
  id: z.string().trim(),
  endDatetime: z
    .string({
      required_error: 'End datetime is required',
    })
    .datetime({
      offset: true,
      message: 'Invalid datetime format. Expected ISO 8601 format.',
    })
    .trim(),
  totalTime: z
    .string({
      required_error: 'Total time is required',
    })
    .trim(),
  comments: z.string().trim().default(''),
})

type ClientClockOutRequest = z.infer<typeof clientClockOutRequestSchema>

const validateClockOutRequest = (
  clockInRecord: TimesheetRecord,
  clockOutRequest: ClientClockOutRequest
): void => {
  if (clockInRecord.id !== clockOutRequest.id) {
    logger.warn(`💦 Timesheet record mismatch`)
    throw new TimeeyError({
      type: ErrorType.TIMESHEET_RECORD_MISMATCH,
      message: `Clock Out Request with record id '${clockOutRequest.id}' does not match Clock In record with id '${clockInRecord.id}'`,
      code: StatusCode.CONFLICT,
      data: {
        clockInRecord,
        clockOutRequest,
      },
    })
  }

  const { date: clockInStartDate } = separateDateAndTime(
    clockInRecord.startDatetime
  )

  const { date: clockOutEndDate } = separateDateAndTime(
    clockOutRequest.endDatetime
  )

  if (clockInStartDate !== clockOutEndDate) {
    logger.warn(`💦 Date mismatch`)
    throw new TimeeyError({
      type: ErrorType.TIMESHEET_RECORD_VALIDATION_ERROR,
      message: `Clock Out Request with end date '${clockOutEndDate}' does not match Clock In record with start date '${clockInStartDate}'`,
      code: StatusCode.BAD_REQUEST,
      data: {
        clockInRecord,
        clockOutRequest,
      },
    })
  }

  const calculatedTotalTime = calculateTotalTime(
    clockInRecord.startDatetime,
    clockOutRequest.endDatetime
  )

  if (clockOutRequest.totalTime !== calculatedTotalTime) {
    logger.warn(`💦 Total time mismatch`)
    throw new TimeeyError({
      type: ErrorType.TIMESHEET_RECORD_VALIDATION_ERROR,
      message: `Calculated total time does not match provided total time'`,
      code: StatusCode.BAD_REQUEST,
      data: {
        startDatetime: clockInRecord.startDatetime,
        endDatetime: clockOutRequest.endDatetime,
        providedTotalTime: clockOutRequest.totalTime,
        calculatedTotalTime,
      },
    })
  }
}

interface IResponse extends Response {
  locals: {
    userCredentials: UserCredentials
  }
}

const router = Router()

router.post(
  '/',
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose('💦 Processing request POST /user/clock-out ...')

    const clockInTimesheetRecord =
      await TimeeySheetsApi.getClockInTimesheetRecord(
        res.locals.userCredentials.username
      )

    if (clockInTimesheetRecord == null) {
      logger.warn(
        `💦 User '${res.locals.userCredentials.username}' has not clocked in`
      )
      throw new TimeeyError({
        type: ErrorType.NOT_CLOCKED_IN,
        message: 'User has not clocked in',
        code: StatusCode.CONFLICT,
      })
    }

    const clockOutRequest = clientClockOutRequestSchema.parse(req.body)

    validateClockOutRequest(clockInTimesheetRecord, clockOutRequest)

    const updatedTimesheetRecord = timesheetRecordSchema.parse({
      id: clockInTimesheetRecord.id,
      username: clockInTimesheetRecord.username,
      startDatetime: clockInTimesheetRecord.startDatetime,
      endDatetime: clockOutRequest.endDatetime,
      totalTime: clockOutRequest.totalTime,
      status: 'PENDING APPROVAL',
      comments: clockOutRequest.comments,
    })

    await TimeeySheetsApi.updateTimesheet(updatedTimesheetRecord)

    logger.info('💦 ... Processed request POST /user/clock-out')
    res.send(updatedTimesheetRecord)
  })
)

export default router
