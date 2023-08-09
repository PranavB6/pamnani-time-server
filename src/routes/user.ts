import { type Request, type Response, Router } from "express";

import TimeeySheetsApi from "../db/timeeySheetsApi";
import auth from "../middlewares/auth";
import {
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
} from "../models/clientRequest";
import {
  type CondensedTimesheetRecord,
  condensedTimesheetRecordSchema,
} from "../models/condensedTimesheetRecord";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import { isCompleteExpandedTimesheetRecord } from "../models/expandedTimesheetRecord";
import StatusCodes from "../models/statusCodes";
import TimeeyError from "../models/TimeeyError";
import type UserCredentialsRecord from "../models/userCredentialsRecord";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import logger from "../utils/logger";
import {
  condenseTimesheetRecord,
  expandTimesheetRecord,
} from "../utils/timesheetRecordConverter";

interface IResponse extends Response {
  locals: {
    user: UserCredentialsRecord;
  };
}

const router = Router();

router.get(
  "/history",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose(
      `🍑 Processing request to get timesheet history for user: '${res.locals.user.username}'`
    );

    const timesheet = await TimeeySheetsApi.getTimesheet();

    const userTimesheet: ExpandedTimesheetRecord[] = timesheet.filter(
      (timesheetRecord) => {
        return timesheetRecord.username === res.locals.user.username;
      }
    );

    logger.verbose(`🍑 Got ${res.locals.user.username}'s timesheet records`);

    const response: CondensedTimesheetRecord[] = userTimesheet.map(
      condenseTimesheetRecord
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

    logger.verbose("🍑 Checking if user is already clocked in");
    const data = await findClockedInTimesheetRecord(res.locals.user.username);

    if (data != null) {
      logger.error(
        `🍑 User: '${res.locals.user.username}' is already clocked in`
      );
      throw TimeeyError.fromObject({
        type: "CLOCK_IN_ERROR",
        message: "You are already clocked in",
        code: StatusCodes.CONFLICT,
        data: {
          clockedInRecord: data.record,
          clockInIndex: data.index,
        },
      });
    }

    logger.info(
      `🍑 User '${res.locals.user.password}' is not already clocked in 👍`
    );

    const clockInRequest = clientClockInRequestSchema.parse(req.body);

    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-in request`);

    const newCondensedRecord: CondensedTimesheetRecord =
      condensedTimesheetRecordSchema.parse({
        username: res.locals.user.username,
        startDatetime: clockInRequest.startDatetime,
        endDatetime: undefined,
        totalTime: undefined,
        status: "CLOCKED IN",
      });

    logger.debug(
      `🍑 Client clock-in record: ${JSON.stringify(newCondensedRecord)}`
    );

    const newTimesheetRecord: ExpandedTimesheetRecord =
      expandTimesheetRecord(newCondensedRecord);

    logger.debug(
      `🍑 Clock-in Timesheet record:${JSON.stringify(newTimesheetRecord)}`
    );

    logger.verbose(
      `🍑 Appending clock-in record to ${res.locals.user.username}'s timesheet`
    );

    await TimeeySheetsApi.appendTimesheet(newTimesheetRecord);

    logger.info(
      `🍑 Appended clock-in record to ${res.locals.user.username}'s timesheet`
    );
    res.json(newCondensedRecord);
  })
);

router.post(
  "/clock-out",
  auth,
  expressAsyncHandler(async (req: Request, res: IResponse) => {
    logger.verbose(
      `🍑 Processing clock-out request for user: '${res.locals.user.username}'`
    );

    logger.verbose(`🍑 Checking if user is already clocked in`);
    const data = await findClockedInTimesheetRecord(res.locals.user.username);

    if (data == null) {
      logger.error(`🍑 User: '${res.locals.user.username}' is not clocked in`);
      throw TimeeyError.fromObject({
        type: "CLOCK_OUT_ERROR",
        message: "You are not clocked in",
        code: StatusCodes.CONFLICT,
      });
    }
    const { record: oldRecord, index: oldRecordIndex } = data;
    logger.verbose(`🍑 Got ${res.locals.user.username}'s clock-in record`);
    logger.debug(`🍑 Clock-in Timesheet record: ${JSON.stringify(oldRecord)}`);

    const clockOutInfo = clientClockOutRequestSchema.parse(req.body);
    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-out request`);

    const newRecord: CondensedTimesheetRecord =
      condensedTimesheetRecordSchema.parse({
        ...condenseTimesheetRecord(oldRecord),
        ...clockOutInfo,
        status: "PENDING APPROVAL",
      });

    logger.verbose(
      `🍑 Generated client clock-out record for user: '${res.locals.user.username}'`
    );
    logger.debug(
      `🍑 Generated client clock-out record ${JSON.stringify(newRecord)}`
    );

    const newTimesheetRecord = expandTimesheetRecord(newRecord);

    logger.verbose(
      `🍑 Generated clock-out Timesheet record for user: '${res.locals.user.username}'`
    );
    logger.debug(
      `🍑 Generated clock-out Timesheet record ${JSON.stringify(
        newTimesheetRecord
      )}`
    );

    await TimeeySheetsApi.updateTimesheet(oldRecordIndex, newTimesheetRecord);

    logger.info(
      `🍑 Returning clock-out response for user: '${res.locals.user.username}'`
    );
    res.json(newRecord);
  })
);

async function findClockedInTimesheetRecord(username: string): Promise<{
  record: ExpandedTimesheetRecord;
  index: number;
} | null> {
  const timesheet = await TimeeySheetsApi.getTimesheet();

  const clockedInRecordIndex = timesheet.findIndex(
    (timesheetRecord) =>
      timesheetRecord.username === username &&
      !isCompleteExpandedTimesheetRecord(timesheetRecord)
  );

  if (clockedInRecordIndex === -1) {
    return null;
  } else {
    const record = timesheet[clockedInRecordIndex];

    return {
      record,
      index: clockedInRecordIndex,
    };
  }
}

export default router;
