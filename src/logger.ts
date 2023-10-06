import { LoggingWinston } from '@google-cloud/logging-winston'
import winston from 'winston'

import getConfig from './config'
import ENV from './models/env'

const shouldEnableConsoleLogger = (): boolean => {
  const env = getConfig().env

  if (env === ENV.PRODUCTION) {
    console.log(
      '🤐 Console logger has been silenced - environment is production'
    )
    return false
  }

  const showLogsInTests = getConfig().showLogsInTests

  if (env === ENV.TEST && !showLogsInTests) {
    console.log(
      '🤐 Console logger has been silenced - environment is test and showLogsInTests is false'
    )
    return false
  }

  console.log('🫡 Console logger will not be silenced!')
  return true
}

const shouldEnableGoogleCloudLogger = (): boolean => {
  const env = getConfig().env

  if (env !== ENV.PRODUCTION) {
    console.log(
      '🤐 Google Cloud logger has been silenced - environment is not production'
    )
    return false
  }

  console.log('🫡 Google Cloud logger will not be silenced!')
  return true
}

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console({
      silent: !shouldEnableConsoleLogger(),
    }),
    // add "loggingWinston" to log to Google Cloud Logging
    new LoggingWinston({
      silent: !shouldEnableGoogleCloudLogger(),
    }),
  ],
})

export default logger
