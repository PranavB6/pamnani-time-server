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
    const timesheet = await PamnaniSheetsApi.getTimesheet();

    const userTimesheet: TimesheetRecord[] = timesheet.filter(
      (timesheetRecord) => {
        return timesheetRecord.username === res.locals.user.username;
      }
    );

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

    res.json(response);
  })
);

router.post(
  "/clock-in",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    const clockInRequest = clientClockInRequestSchema.parse(req.body);
    const { date, time } = separateDateAndTime(clockInRequest.startDatetime);

    const clientTimesheetRecord: ClientTimesheetResponse = {
      username: res.locals.user.username,
      startDatetime: clockInRequest.startDatetime,
      endDatetime: undefined,
      totalTime: undefined,
      status: "CLOCKED IN",
    };

    const newTimesheetRequest: TimesheetRecord = {
      username: clientTimesheetRecord.username,
      date,
      startTime: time,
      status: clientTimesheetRecord.status,
    };

    await PamnaniSheetsApi.appendTimesheet(newTimesheetRequest);

    res.json(clientTimesheetRecord);
  })
);

router.post(
  "/clock-out",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    const clockOutRequest = clientClockOutRequestSchema.parse(req.body);
    const { time: endTime } = separateDateAndTime(clockOutRequest.endDatetime);

    /* Start: Get user's clock in record */

    const timesheet = await PamnaniSheetsApi.getTimesheet();

    const clockedInRecordIndex = timesheet.findIndex(
      (timesheetRecord) =>
        timesheetRecord.username === res.locals.user.username &&
        !isCompleteTimesheetRecord(timesheetRecord)
    );

    if (clockedInRecordIndex === -1) {
      throw PamnaniError.fromObject({
        type: "CLOCK_OUT_ERROR",
        message: "You are not clocked in",
        code: StatusCodes.BAD_REQUEST,
      });
    }

    /* End */

    console.log(clockedInRecordIndex);

    const clockedInRecord = timesheet[
      clockedInRecordIndex
    ] as ClockInTimesheetRecord;

    try {
      console.log("Here A");
      const newTimesheetRecord: TimesheetRecord = {
        username: res.locals.user.username,
        date: clockedInRecord.date,
        startTime: clockedInRecord.startTime,
        endTime,
        totalTime: clockOutRequest.totalTime,
        status: "PENDING APPROVAL",
      };

      console.log("HereB ");

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

      res.json(response);
    } catch (error: unknown) {
      console.log("Error thrown here");
    }
  })
);

export default router;
