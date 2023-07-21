import dayjs, { type Dayjs } from "dayjs";
import duration, { type Duration } from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import PamnaniError from "../models/pamnaniError";
import StatusCodes from "../models/statusCodes";

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone = "America/Edmonton";

function calculateTotalTime(
  startDatetimeString: string,
  endDatetimeString: string
): string {
  const startDatetime = dayjs(startDatetimeString).tz(defaultTimezone);
  const endDatetime = dayjs(endDatetimeString).tz(defaultTimezone);

  if (!startDatetime.isValid()) {
    throw new PamnaniError(
      "INVALID_DATE",
      `Start datetime: '${startDatetimeString}' is invalid`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (!endDatetime.isValid()) {
    throw new PamnaniError(
      "INVALID_DATE",
      `End datetime: '${endDatetimeString}' is invalid`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (endDatetime.isBefore(startDatetime)) {
    throw PamnaniError.fromObject({
      type: "INVALID_DATE",
      message: `End datetime: '${endDatetimeString}' must be after start datetime: '${startDatetimeString}'`,
      code: StatusCodes.BAD_REQUEST,
      data: {
        startDatetime: startDatetimeString,
        endDatetime: endDatetimeString,
      },
    });
  }

  const startDate = startDatetime.format("YYYY-MM-DD");
  const endDate = endDatetime.format("YYYY-MM-DD");

  if (startDate !== endDate) {
    throw new PamnaniError(
      "INVALID_DATE",
      `Start Date: '${startDate}' and End Date: '${endDate}' must be the same`,
      StatusCodes.BAD_REQUEST
    );
  }

  const duration = calculateRoundedDuration(startDatetime, endDatetime);
  const totalTime = duration.format("HH:mm");

  return totalTime;
}

function calculateRoundedDuration(
  startDatetime: Dayjs,
  endDatetime: Dayjs
): Duration {
  const duration = dayjs.duration(endDatetime.diff(startDatetime));
  return roundDurationToNearestMinutes(duration, 15);
}

function roundDurationToNearestMinutes(
  duration: Duration,
  roundMinutes: number
): Duration {
  const minutes = duration.minutes();

  const remainder = minutes % roundMinutes;

  if (remainder >= Math.floor(roundMinutes / 2)) {
    return duration.add(roundMinutes - remainder, "minutes");
  } else {
    return duration.subtract(remainder, "minutes");
  }
}

export default calculateTotalTime;
