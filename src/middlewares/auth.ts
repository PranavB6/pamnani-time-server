import { type NextFunction, type Request, type Response } from 'express'

import TimeeySheetsApi from '../db/timeeySheetsApi'
import logger from '../logger'
import ErrorType from '../models/errorType'
import StatusCode from '../models/statusCode'
import TimeeyError from '../models/timeeyError'
import type UserCredentials from '../models/userCredentials'
import { userCredentialsSchema } from '../models/userCredentials'
import expressAsyncHandler from '../utils/expressAsyncHandler'

const decodeAuthHeader = (authHeader: string): UserCredentials => {
  // get the encoded part of the header (ie. remove the "Basic " part)
  const encoded = authHeader.split(' ')[1]
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
  const [username, password] = decoded.split(':')

  return userCredentialsSchema.parse({ username, password })
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  logger.verbose('🛡️ Authenticating user...')

  const authHeader = req.get('authorization')

  if (authHeader == null) {
    logger.warn(`🛡️ No Authorization Header`)
    throw new TimeeyError({
      type: ErrorType.MISSING_AUTHORIZATION_HEADER,
      message: 'Authorization header is missing',
      code: StatusCode.UNAUTHORIZED,
    })
  }

  const userCredentials = decodeAuthHeader(authHeader)

  logger.verbose(
    `🛡️ Received username '${userCredentials.username}', password: '${userCredentials.password}'`
  )

  const allUserCredentials = await TimeeySheetsApi.getAllUserCredentials()

  const matchingUserCredentials = allUserCredentials.find(
    (record) =>
      record.username === userCredentials.username &&
      record.password === userCredentials.password
  )

  if (matchingUserCredentials == null) {
    logger.warn(`🛡️ No matching user credentials`)
    throw new TimeeyError({
      type: ErrorType.INVALID_CREDENTIALS,
      message: 'Invalid username or password',
      code: StatusCode.UNAUTHORIZED,
    })
  }

  logger.info(`🛡️ User '${userCredentials.username}' authenticated`)

  res.locals.userCredentials = matchingUserCredentials

  next()
}

export default expressAsyncHandler(authMiddleware)
