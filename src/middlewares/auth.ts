import { type NextFunction, type Request, type Response } from "express";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
import { userCredentialsRecordSchema } from "../models/userCredentialsRecord";
import expressAsyncHandler from "../utils/expressAsyncHandler";

async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const loginRequest = userCredentialsRecordSchema.parse({
    username: req.get("username"),
    password: req.get("password"),
  });

  const userCredentials = await PamnaniSheetsApi.getAllUserCredentials();

  const matchingUserRecord = userCredentials.find(
    (userCredential) =>
      userCredential.username === loginRequest.username &&
      userCredential.password === loginRequest.password
  );

  if (matchingUserRecord == null) {
    throw PamnaniError.fromObject({
      type: "Invalid Credentials",
      message: "Invalid username or password",
      code: StatusCodes.UNAUTHORIZED,
    });
  }

  next();
}

export default expressAsyncHandler(authMiddleware);
