import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type ClientTimesheetRecord from "../models/clientTimesheetRecord";
import { clientTimesheetRecordSchema } from "../models/clientTimesheetRecord";
import type TimesheetRecord from "../models/timesheetRecord";
import { timesheetRecordSchema } from "../models/timesheetRecord";

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone = "America/Edmonton";

const TimesheetRecordConverter = {
  fromClientTimesheetRecord(
    clientTimesheetRecord: ClientTimesheetRecord
  ): TimesheetRecord {
    const startDatetime = dayjs(clientTimesheetRecord.startDatetime).tz(
      defaultTimezone
    );
    const endDatetime = dayjs(clientTimesheetRecord.endDatetime).tz(
      defaultTimezone
    );

    const startDate = startDatetime.format("YYYY-MM-DD");

    const startTime = startDatetime.format("HH:mm");
    const endTime = endDatetime.format("HH:mm");

    return timesheetRecordSchema.parse({
      username: clientTimesheetRecord.username,
      date: startDate,
      startTime,
      endTime,
      totalTime: clientTimesheetRecord.totalTime,
      status: clientTimesheetRecord.status,
    });
  },

  toClientTimesheetRecord(timesheet: TimesheetRecord): ClientTimesheetRecord {
    const startDatetime = dayjs.tz(
      `${timesheet.date} ${timesheet.startTime}`,
      "YYYY-MM-DD HH:mm",
      defaultTimezone
    );
    const endDatetime = dayjs.tz(
      `${timesheet.date} ${timesheet.endTime}`,
      "YYYY-MM-DD HH:mm",
      defaultTimezone
    );

    return clientTimesheetRecordSchema.parse({
      username: timesheet.username,
      startDatetime: startDatetime.toISOString(),
      endDatetime: endDatetime.toISOString(),
      totalTime: timesheet.totalTime,
      status: timesheet.status,
    });
  },
};

export default TimesheetRecordConverter;
