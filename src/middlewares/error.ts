import { type NextFunction, type Request, type Response } from 'express'
import { GaxiosError } from 'gaxios'
import { ZodError } from 'zod'

import logger from '../logger'
import ErrorType from '../models/errorType'
import StatusCodes from '../models/statusCode'
import TimeeyError from '../models/timeeyError'

const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // console.log(error.stack) // uncomment for debugging
    logger.error(JSON.stringify(error))
  } catch (error) {
    logger.error('Error while logging error')
  }

  if (error instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).send({
      errors: error.issues.map((issue) =>
        new TimeeyError({
          type: issue.code as ErrorType, // ZodIssue.code is TimeeyError.type
          message: issue.message,
          code: StatusCodes.BAD_REQUEST,
          data: issue,
        }).toJSON()
      ),
    })
    return
  }

  if (error instanceof TimeeyError) {
    res.status(error.code).send({
      errors: [error.toJSON()],
    })
    return
  }

  if (error instanceof GaxiosError) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: [
        new TimeeyError({
          type: ErrorType.GOOGLE_SHEETS_API_ERROR,
          message: error.message,
          code: error.response?.status ?? 500,
          data: error,
        }).toJSON(),
      ],
    })
    return
  }

  res.status(500).send('Internal server error')
}

export default errorMiddleware
