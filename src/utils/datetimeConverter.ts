import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone = "America/Edmonton";

const separateDateAndTime = (
  datetimeString: string
): {
  date: string;
  time: string;
} => {
  const datetime = dayjs(datetimeString).tz(defaultTimezone);

  if (!datetime.isValid()) {
    throw new Error(`Invalid datetime string: ${datetimeString}`);
  }

  return {
    date: datetime.format("YYYY-MM-DD"),
    time: datetime.format("HH:mm:ss"),
  };
};

const combineDateAndTime = (dateString: string, timeString: string): string => {
  const datetime = dayjs.tz(
    `${dateString} ${timeString}`,
    "YYYY-MM-DD HH:mm:ss",
    defaultTimezone
  );

  if (!datetime.isValid()) {
    throw new Error(
      `Invalid date and time strings: ${dateString}, ${timeString}`
    );
  }

  return datetime.toISOString();
};

export { separateDateAndTime, combineDateAndTime };
