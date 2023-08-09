import { type NextFunction, type Request, type Response } from "express";
import { GaxiosError } from "gaxios";
import { ZodError } from "zod";

import StatusCodes from "../models/statusCodes";
import TimeeyError from "../models/TimeeyError";
import logger from "../utils/logger";

function errorController(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    logger.error(JSON.stringify(error));
  } catch (error) {
    logger.error("Error while logging error");
  }

  if (error instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).send({
      errors: error.issues.map((issue) =>
        TimeeyError.fromObject({
          type: issue.code, // ZodIssue.code is TimeeyError.type
          message: issue.message,
          code: StatusCodes.BAD_REQUEST,
          data: issue,
        }).toJSON()
      ),
    });
    return;
  }

  if (error instanceof TimeeyError) {
    res.status(error.code).send({
      errors: [error.toJSON()],
    });
    return;
  }

  if (error instanceof GaxiosError) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: [
        TimeeyError.fromObject({
          type: "Google Sheets API Error",
          message: error.message,
          code: error.response?.status ?? 500,
          data: error,
        }).toJSON(),
      ],
    });
    return;
  }

  res.status(500).send("Internal server error");
}

export default errorController;
