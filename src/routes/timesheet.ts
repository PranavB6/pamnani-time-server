import { type Request, type Response, Router } from "express";
import { z } from "zod";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import auth from "../middlewares/auth";
import { clientTimesheetRecordSchema } from "../models/clientTimesheetRecord";
import StatusCodes from "../models/statusCodes";
import calculateTotalTime from "../utils/calculateTotalTime";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import TimesheetRecordConverter from "../utils/timesheetRecordConverter";

const router = Router();

router.get(
  "/",
  auth,
  expressAsyncHandler(async (req: Request, res: Response) => {
    const timesheetRecords = await PamnaniSheetsApi.getTimesheet();

    const filteredTimesheet = timesheetRecords.filter((timesheetRecord) => {
      return timesheetRecord.username === String(req.headers.username);
    });

    const response = filteredTimesheet.map(
      TimesheetRecordConverter.toClientTimesheetRecord
    );

    res.send(response);
  })
);

const timesheetRequestSchema = z.object({
  startDatetime: z
    .string({
      required_error: "Start datetime is required",
    })
    .trim()
    .datetime({
      offset: true,
    }),
  endDatetime: z
    .string({
      required_error: "End datetime is required",
    })
    .trim()
    .datetime({
      offset: true,
    }),
});

router.post(
  "/",
  auth,
  expressAsyncHandler(async (req: Request, res: Response) => {
    const parsedBody = timesheetRequestSchema.parse(req.body);

    const clientTimesheetRecord = clientTimesheetRecordSchema.parse({
      username: String(req.headers.username),
      startDatetime: parsedBody.startDatetime,
      endDatetime: parsedBody.endDatetime,
      totalTime: calculateTotalTime(
        parsedBody.startDatetime,
        parsedBody.endDatetime
      ),
      status: "PENDING",
    });

    const timesheetRecord = TimesheetRecordConverter.fromClientTimesheetRecord(
      clientTimesheetRecord
    );

    await PamnaniSheetsApi.appendTimesheet(timesheetRecord);

    res
      .status(StatusCodes.CREATED)
      .send(TimesheetRecordConverter.toClientTimesheetRecord(timesheetRecord));
  })
);

export default router;
