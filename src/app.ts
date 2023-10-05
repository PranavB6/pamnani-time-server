import cors from 'cors'
import express, { type Express } from 'express'
import morgan from 'morgan'

import logger from './logger'
import errorMiddleware from './middlewares/error'
import userRouter from './routes/user'
import usersRouter from './routes/users'
import verifyCredentialsRouter from './routes/verifyCredentials'

const createApp = (): Express => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use(
    morgan(
      ':remote-addr :method :url :status :res[content-length] - :response-time ms',
      {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }
    )
  )

  app.use('/api/v2/verify-credentials', verifyCredentialsRouter)
  app.use('/api/v2/users', usersRouter)
  app.use('/api/v2/user', userRouter)

  app.use(errorMiddleware)

  return app
}

export default createApp
