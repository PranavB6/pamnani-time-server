import { type Request, type Response, Router } from 'express'

import TimeeySheetsApi from '../db/timeeySheetsApi'
import logger from '../logger'
import expressAsyncHandler from '../utils/expressAsyncHandler'

const router = Router()

router.get(
  '/',
  expressAsyncHandler(async (req: Request, res: Response) => {
    logger.verbose('💦 Processing request GET /users ...')

    const allUserCredentials = await TimeeySheetsApi.getAllUserCredentials()
    const allUsernames = allUserCredentials.map((user) => user.username)

    logger.info('💦 ... Processed request GET /users')
    logger.debug(`💦 Response: ${JSON.stringify(allUsernames)}`)
    res.send(allUsernames)
  })
)

export default router
