import { type Request, type Response, Router } from "express";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import auth from "../middlewares/auth";
import {
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
} from "../models/clientRequest";
import { type CondensedTimesheetRecord } from "../models/condensedTimesheetRecord";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import {
  type ClockedInExpandedTimesheetRecord,
  isCompleteExpandedTimesheetRecord,
} from "../models/expandedTimesheetRecord";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";
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

    const timesheet = await PamnaniSheetsApi.getTimesheet();

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

    const clockInRequest = clientClockInRequestSchema.parse(req.body);

    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-in request`);

    const clientTimesheetRecord: CondensedTimesheetRecord = {
      username: res.locals.user.username,
      startDatetime: clockInRequest.startDatetime,
      endDatetime: undefined,
      totalTime: undefined,
      status: "CLOCKED IN",
    };

    logger.debug(
      `🍑 Client clock-in record: ${JSON.stringify(clientTimesheetRecord)}`
    );

    const newTimesheetRequest: ExpandedTimesheetRecord = expandTimesheetRecord(
      clientTimesheetRecord
    );

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

    logger.verbose(`🍑 Parsed ${res.locals.user.username}'s clock-out request`);

    const { record: matchingClockedInRecord, index: clockedInRecordIndex } =
      await findClockedInTimesheetRecord(res.locals.user.username);

    logger.verbose(`🍑 Got ${res.locals.user.username}'s clock-in record`);
    logger.debug(
      `🍑 Clock-in Timesheet record: ${JSON.stringify(matchingClockedInRecord)}`
    );

    const newCondensedRecord: CondensedTimesheetRecord = {
      ...condenseTimesheetRecord(matchingClockedInRecord),
      ...clockOutRequest,
      status: "PENDING APPROVAL",
    };

    logger.verbose(
      `🍑 Generated client clock-out record for user: '${res.locals.user.username}'`
    );
    logger.debug(
      `🍑 Generated client clock-out record ${JSON.stringify(
        newCondensedRecord
      )}`
    );

    const newTimesheetRecord = expandTimesheetRecord(newCondensedRecord);

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

    logger.info(
      `🍑 Returning clock-out response for user: '${res.locals.user.username}'`
    );
    res.json(newCondensedRecord);
  })
);

async function findClockedInTimesheetRecord(username: string): Promise<{
  record: ClockedInExpandedTimesheetRecord;
  index: number;
}> {
  const timesheet = await PamnaniSheetsApi.getTimesheet();

  const clockedInRecordIndex = timesheet.findIndex(
    (timesheetRecord) =>
      timesheetRecord.username === username &&
      !isCompleteExpandedTimesheetRecord(timesheetRecord)
  );

  if (clockedInRecordIndex === -1) {
    logger.warn(`🍑 User: '${username}' is not clocked in`);
    throw PamnaniError.fromObject({
      type: "CLOCK_OUT_ERROR",
      message: "You are not clocked in",
      code: StatusCodes.BAD_REQUEST,
    });
  }

  const matchingClockedInRecord = timesheet[
    clockedInRecordIndex
  ] as ClockedInExpandedTimesheetRecord;

  return {
    record: matchingClockedInRecord,
    index: clockedInRecordIndex,
  };
}

export default router;
