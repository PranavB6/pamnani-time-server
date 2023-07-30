import { LoggingWinston } from "@google-cloud/logging-winston";
import winston from "winston";

import getConfig, { ENV } from "../config";

const shouldSilenceConsoleLogger = (): boolean => {
  if (getConfig().env === ENV.PRODUCTION) {
    console.log(
      "🤐 Console logger has been silenced - environment is production"
    );
    return true;
  }

  if (getConfig().env === ENV.TEST && !getConfig().showLogsInTests) {
    console.log("🤐 Console logger has been silenced - environment is test");
    return true;
  }

  console.log("🫡 Console logger will not be silenced");
  return false;
};

const shouldSilenceGoogleCloudLogger = (): boolean => {
  if (!(getConfig().env === ENV.PRODUCTION)) {
    console.log(
      "🤐 Google Cloud logger has been silenced - environment is not production"
    );
    return true;
  }

  console.log("🫡 Google Cloud logger will not be silenced");
  return false;
};

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console({
      silent: shouldSilenceConsoleLogger(),
    }),
    // add "loggingWinston" to log to Google Cloud Logging
    new LoggingWinston({
      silent: shouldSilenceGoogleCloudLogger(),
    }),
  ],
});

export default logger;
