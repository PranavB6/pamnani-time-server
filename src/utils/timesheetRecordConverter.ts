import calculateTotalTime from "./calculateTotalTime";
import { combineDateAndTime, separateDateAndTime } from "./datetimeConverter";
import {
  type CondensedTimesheetRecord,
  isCompleteCondensedTimesheetRecord,
} from "../models/condensedTimesheetRecord";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import {
  expandedTimesheetRecordSchema,
  isCompleteExpandedTimesheetRecord,
} from "../models/expandedTimesheetRecord";
import StatusCodes from "../models/statusCodes";
import TimeeyError from "../models/TimeeyError";

const expandTimesheetRecord = (
  condensedRecord: CondensedTimesheetRecord
): ExpandedTimesheetRecord => {
  if (isCompleteCondensedTimesheetRecord(condensedRecord)) {
    const { date: startDate, time: startTime } = separateDateAndTime(
      condensedRecord.startDatetime
    );

    const { date: endDate, time: endTime } = separateDateAndTime(
      condensedRecord.endDatetime
    );

    if (startDate !== endDate) {
      throw TimeeyError.fromObject({
        type: "INVALID_DATE",
        message: "Start and end dates must be the same",
        code: StatusCodes.BAD_REQUEST,
        data: {
          startDatetime: condensedRecord.startDatetime,
          endDatetime: condensedRecord.endDatetime,
        },
      });
    }

    if (
      condensedRecord.totalTime !==
      calculateTotalTime(
        condensedRecord.startDatetime,
        condensedRecord.endDatetime
      )
    ) {
      throw TimeeyError.fromObject({
        type: "INVALID_TOTAL_TIME",
        message: "Calculated total time does not match provided total time",
        code: StatusCodes.BAD_REQUEST,
        data: {
          startDatetime: condensedRecord.startDatetime,
          endDatetime: condensedRecord.endDatetime,
          providedTotalTime: condensedRecord.totalTime,
          calculatedTotalTime: calculateTotalTime(
            condensedRecord.startDatetime,
            condensedRecord.endDatetime
          ),
        },
      });
    }

    return expandedTimesheetRecordSchema.parse({
      username: condensedRecord.username,
      date: startDate,
      startTime,
      endTime,
      totalTime: condensedRecord.totalTime,
      status: condensedRecord.status,
      comments: condensedRecord.comments,
    });
  } else {
    const { date: startDate, time: startTime } = separateDateAndTime(
      condensedRecord.startDatetime
    );

    return expandedTimesheetRecordSchema.parse({
      username: condensedRecord.username,
      date: startDate,
      startTime,
      status: condensedRecord.status,
      comments: condensedRecord.comments,
    });
  }
};

const condenseTimesheetRecord = (
  expandedRecord: ExpandedTimesheetRecord
): CondensedTimesheetRecord => {
  if (isCompleteExpandedTimesheetRecord(expandedRecord)) {
    return {
      username: expandedRecord.username,
      startDatetime: combineDateAndTime(
        expandedRecord.date,
        expandedRecord.startTime
      ),
      endDatetime: combineDateAndTime(
        expandedRecord.date,
        expandedRecord.endTime
      ),
      totalTime: expandedRecord.totalTime,
      status: expandedRecord.status,
      comments: expandedRecord.comments,
    };
  } else {
    return {
      username: expandedRecord.username,
      startDatetime: combineDateAndTime(
        expandedRecord.date,
        expandedRecord.startTime
      ),
      status: expandedRecord.status,
      comments: expandedRecord.comments,
    };
  }
};

export { expandTimesheetRecord, condenseTimesheetRecord };
