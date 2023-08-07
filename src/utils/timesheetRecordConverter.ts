import calculateTotalTime from "./calculateTotalTime";
import { combineDateAndTime, separateDateAndTime } from "./datetimeConverter";
import { type CondensedTimesheetRecord } from "../models/condensedTimesheetRecord";
import type ExpandedTimesheetRecord from "../models/expandedTimesheetRecord";
import { isCompleteExpandedTimesheetRecord } from "../models/expandedTimesheetRecord";
import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";

const expandTimesheetRecord = (
  condensedRecord: CondensedTimesheetRecord
): ExpandedTimesheetRecord => {
  const { date: startDate, time: startTime } = separateDateAndTime(
    condensedRecord.startDatetime
  );

  if (condensedRecord.endDatetime == null) {
    return {
      username: condensedRecord.username,
      date: startDate,
      startTime,
      status: condensedRecord.status,
    };
  }

  const { date: endDate, time: endTime } = separateDateAndTime(
    condensedRecord.endDatetime
  );

  if (startDate !== endDate) {
    throw PamnaniError.fromObject({
      type: "INVALID_DATE",
      message: "Start and end dates must be the same",
      code: StatusCodes.BAD_REQUEST,
      data: {
        startDatetime: condensedRecord.startDatetime,
        endDatetime: condensedRecord.endDatetime,
      },
    });
  }

  if (condensedRecord.totalTime == null) {
    throw PamnaniError.fromObject({
      type: "INVALID_TOTAL_TIME",
      message: "Total time must be provided",
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
    throw PamnaniError.fromObject({
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

  return {
    username: condensedRecord.username,
    date: startDate,
    startTime,
    endTime,
    totalTime: condensedRecord.totalTime,
    status: condensedRecord.status,
  };
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
    };
  } else {
    return {
      username: expandedRecord.username,
      startDatetime: combineDateAndTime(
        expandedRecord.date,
        expandedRecord.startTime
      ),
      status: expandedRecord.status,
    };
  }
};

export { expandTimesheetRecord, condenseTimesheetRecord };
