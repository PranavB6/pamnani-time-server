import { type Request, type Response, Router } from 'express'

import TimeeySheetsApi from '../../db/timeeySheetsApi'
import logger from '../../logger'
import auth from '../../middlewares/auth'
import type UserCredentials from '../../models/userCredentials'
import expressAsyncHandler from '../../utils/expressAsyncHandler'
import sortTimesheetRecords from '../../utils/sortTimesheetRecords'

interface IResponse extends Response {
  locals: {
    userCredentials: UserCredentials
  }
}

const router = Router()

router.get(
  '/',
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose('💦 Processing request GET /user/history ...')

    const timesheet = await TimeeySheetsApi.getTimesheet()
    const userTimesheet = sortTimesheetRecords(
      timesheet.filter(
        (record) => record.username === res.locals.userCredentials.username
      )
    )

    const clockInRecord = await TimeeySheetsApi.getClockInTimesheetRecord(
      res.locals.userCredentials.username
    )

    const response = {
      clockInRecord,
      userTimesheet,
    }

    logger.debug(`💦 Response: ${JSON.stringify(response)}`)
    logger.info('💦 ... Processed request GET /user/history')
    res.send(response)
  })
)

export default router
