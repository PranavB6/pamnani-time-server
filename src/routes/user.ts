import { type Request, type Response, Router } from "express";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import auth from "../middlewares/auth";
import {
  type ClientTimesheetResponse,
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
} from "../models/clientTimesheetRecord";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
import type TimesheetRecord from "../models/timesheetRecord";
import {
  type ClockInTimesheetRecord,
  type CompleteTimesheetRecord,
} from "../models/timesheetRecord";
import type UserCredentialsRecord from "../models/userCredentialsRecord";
import {
  combineDateAndTime,
  separateDateAndTime,
} from "../utils/datetimeConverter";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import logger from "../utils/logger";

interface IResponse extends Response {
  locals: {
    user: UserCredentialsRecord;
  };
}

const isCompleteTimesheetRecord = (
  timesheetRecord: TimesheetRecord
): timesheetRecord is CompleteTimesheetRecord => {
  return (
    "endTime" in timesheetRecord &&
    timesheetRecord.endTime != null &&
    timesheetRecord.endTime.length > 0
  );
};

const router = Router();

router.get(
  "/history",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose(
      `🍑 Processing request to get timesheet history for user: '${res.locals.user.username}'`
    );

    const timesheet = await PamnaniSheetsApi.getTimesheet();

    const userTimesheet: TimesheetRecord[] = timesheet.filter(
      (timesheetRecord) => {
        return timesheetRecord.username === res.locals.user.username;
      }
    );

    logger.verbose(`🍑 Got ${res.locals.user.username}'s timesheet records`);

    const response: ClientTimesheetResponse[] = userTimesheet.map(
      (record: TimesheetRecord) => {
        if (isCompleteTimesheetRecord(record)) {
          return {
            username: record.username,
            startDatetime: combineDateAndTime(record.date, record.startTime),
            endDatetime: combineDateAndTime(record.date, record.endTime),
            totalTime: record.totalTime,
            status: record.status,
          };
        } else {
          return {
            username: record.username,
            startDatetime: combineDateAndTime(record.date, record.startTime),
            endDatetime: undefined,
            totalTime: undefined,
            status: record.status,
          };
        }
      }
    );

    logger.verbose(`🍑 Mapped ${res.locals.user.username}'s timesheet records`);
    logger.info(`🍑 Returning ${res.locals.user.username}'s timesheet records`);
    res.json(response);
  })
);

router.post(
  "/clock-in",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose(
      `🍑 Processing clock-in request for user: '${res.locals.user.username}'`
    );

    const clockInRequest = clientClockInRequestSchema.parse(req.body);
    const { date, time } = separateDateAndTime(clockInRequest.startDatetime);

    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-in request`);

    const clientTimesheetRecord: ClientTimesheetResponse = {
      username: res.locals.user.username,
      startDatetime: clockInRequest.startDatetime,
      endDatetime: undefined,
      totalTime: undefined,
      status: "CLOCKED IN",
    };
    logger.debug(
      `🍑 Client clock-in record: ${JSON.stringify(clientTimesheetRecord)}`
    );

    const newTimesheetRequest: TimesheetRecord = {
      username: clientTimesheetRecord.username,
      date,
      startTime: time,
      status: clientTimesheetRecord.status,
    };
    logger.debug(
      `🍑 Clock-in Timesheet record:${JSON.stringify(newTimesheetRequest)}`
    );

    logger.verbose(
      `🍑 Appending clock-in record to ${res.locals.user.username}'s timesheet`
    );
    await PamnaniSheetsApi.appendTimesheet(newTimesheetRequest);

    logger.info(
      `🍑 Appended clock-in record to ${res.locals.user.username}'s timesheet`
    );
    res.json(clientTimesheetRecord);
  })
);

router.post(
  "/clock-out",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose(
      `🍑 Processing clock-out request for user: '${res.locals.user.username}'`
    );
    const clockOutRequest = clientClockOutRequestSchema.parse(req.body);
    const { time: endTime } = separateDateAndTime(clockOutRequest.endDatetime);

    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-out request`);

    /* Start: Get user's clock in record */

    const timesheet = await PamnaniSheetsApi.getTimesheet();

    const clockedInRecordIndex = timesheet.findIndex(
      (timesheetRecord) =>
        timesheetRecord.username === res.locals.user.username &&
        !isCompleteTimesheetRecord(timesheetRecord)
    );

    if (clockedInRecordIndex === -1) {
      logger.warn(`🍑 User: '${res.locals.user.username}' is not clocked in`);
      throw PamnaniError.fromObject({
        type: "CLOCK_OUT_ERROR",
        message: "You are not clocked in",
        code: StatusCodes.BAD_REQUEST,
      });
    }

    /* End */
    const clockedInRecord = timesheet[
      clockedInRecordIndex
    ] as ClockInTimesheetRecord;

    logger.verbose(`🍑 Got ${res.locals.user.username}'s clock-in record`);
    logger.debug(
      `🍑 Clock-in Timesheet record: ${JSON.stringify(clockedInRecord)}`
    );

    const newTimesheetRecord: TimesheetRecord = {
      username: res.locals.user.username,
      date: clockedInRecord.date,
      startTime: clockedInRecord.startTime,
      endTime,
      totalTime: clockOutRequest.totalTime,
      status: "PENDING APPROVAL",
    };

    logger.verbose(
      `🍑 Generated clock-out Timesheet record for user: '${res.locals.user.username}'`
    );
    logger.debug(
      `🍑 Generated clock-out Timesheet record ${JSON.stringify(
        newTimesheetRecord
      )}`
    );

    await PamnaniSheetsApi.updateTimesheet(
      clockedInRecordIndex,
      newTimesheetRecord
    );

    const response: ClientTimesheetResponse = {
      username: newTimesheetRecord.username,
      startDatetime: combineDateAndTime(
        newTimesheetRecord.date,
        newTimesheetRecord.startTime
      ),
      endDatetime: combineDateAndTime(
        newTimesheetRecord.date,
        newTimesheetRecord.endTime
      ),
      totalTime: newTimesheetRecord.totalTime,
      status: newTimesheetRecord.status,
    };

    logger.verbose(
      `🍑 Generated client clock-out record for user: '${res.locals.user.username}'`
    );
    logger.debug(
      `🍑 Generated client clock-out record ${JSON.stringify(response)}`
    );

    logger.info(
      `🍑 Returning clock-out response for user: '${res.locals.user.username}'`
    );
    res.json(response);
  })
);

export default router;
