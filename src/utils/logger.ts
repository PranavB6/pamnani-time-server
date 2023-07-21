import winston from "winston";

import getConfig from "../config";

const shouldSilenceLogger = (): boolean => {
  if (!getConfig().showLogs) {
    console.log("🤐 logger has been silenced");
    return true;
  }
  console.log("🫡 logger will not be silenced");
  return false;
};

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console({
      silent: shouldSilenceLogger(),
    }),
  ],
});

export default logger;
