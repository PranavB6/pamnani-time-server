import { type NextFunction, type Request, type Response } from "express";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
import { userCredentialsRecordSchema } from "../models/userCredentialsRecord";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import logger from "../utils/logger";

async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorizationHeader = req.get("authorization");

  if (authorizationHeader == null) {
    logger.warn(`🔑 No Authorization Header`);
    throw PamnaniError.fromObject({
      type: "Missing Authorization Header",
      message: "Authorization header is missing",
      code: StatusCodes.BAD_REQUEST,
    });
  }

  // get the encoded part of the header (ie. remove the "Basic " part)
  const encoded = authorizationHeader.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");

  const [username, password] = decoded.split(":");

  logger.verbose(
    `🔑 Received username: '${username}', password: '${password}'`
  );

  const loginRequest = userCredentialsRecordSchema.parse({
    username,
    password,
  });

  const userCredentials = await PamnaniSheetsApi.getAllUserCredentials();

  const matchingUserRecord = userCredentials.find(
    (userCredential) =>
      userCredential.username === loginRequest.username &&
      userCredential.password === loginRequest.password
  );

  if (matchingUserRecord == null) {
    logger.warn(`🔑 Invalid credentials for user: '${username}'`);
    throw PamnaniError.fromObject({
      type: "Invalid Credentials",
      message: "Invalid username or password",
      code: StatusCodes.UNAUTHORIZED,
    });
  }

  logger.info(`🔑 User '${username}' authenticated successfully`);

  res.locals.user = matchingUserRecord;

  next();
}

export default expressAsyncHandler(authMiddleware);
