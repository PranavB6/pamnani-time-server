import { type Request, type Response, Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import TimeeySheetsApi from '../../db/timeeySheetsApi'
import logger from '../../logger'
import auth from '../../middlewares/auth'
import ErrorType from '../../models/errorType'
import StatusCode from '../../models/statusCode'
import TimeeyError from '../../models/timeeyError'
import { timesheetRecordSchema } from '../../models/timesheetRecord'
import type UserCredentials from '../../models/userCredentials'
import expressAsyncHandler from '../../utils/expressAsyncHandler'

interface IResponse extends Response {
  locals: {
    userCredentials: UserCredentials
  }
}

const clockInRequestSchema = z.object({
  startDatetime: z
    .string({
      required_error: 'Start datetime is required',
    })
    .datetime({
      offset: true,
      message: 'Invalid datetime format. Expected ISO 8601 format.',
    })
    .trim(),
})

const router = Router()

router.post(
  '/',
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose('💦 Processing request POST /user/clock-in ...')

    const clockInTimesheetRecord =
      await TimeeySheetsApi.getClockInTimesheetRecord(
        res.locals.userCredentials.username
      )

    if (clockInTimesheetRecord != null) {
      logger.warn(
        `💦 User '${res.locals.userCredentials.username}' has already clocked in`
      )
      throw new TimeeyError({
        type: ErrorType.ALREADY_CLOCKED_IN,
        message: 'User has already clocked in',
        code: StatusCode.CONFLICT,
        data: clockInTimesheetRecord,
      })
    }

    const { startDatetime } = clockInRequestSchema.parse(req.body)
    const newTimesheetRecord = timesheetRecordSchema.parse({
      id: uuidv4(),
      username: res.locals.userCredentials.username,
      startDatetime,
      endDatetime: undefined,
      totalTime: undefined,
      status: 'CLOCKED IN',
      comments: undefined,
    })

    await TimeeySheetsApi.appendTimesheet(newTimesheetRecord)

    logger.info('💦 ... Processed request POST /user/clock-in')
    res.send(newTimesheetRecord)
  })
)

export default router
