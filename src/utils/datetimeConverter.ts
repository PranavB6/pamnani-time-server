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
  const dateTime = dayjs(datetimeString).tz(defaultTimezone);

  return {
    date: dateTime.format("YYYY-MM-DD"),
    time: dateTime.format("HH:mm"),
  };
};

const combineDateAndTime = (dateString: string, timeString: string): string => {
  const datetime = dayjs.tz(
    `${dateString} ${timeString}`,
    "YYYY-MM-DD HH:mm",
    defaultTimezone
  );

  return datetime.toISOString();
};

export { separateDateAndTime, combineDateAndTime };
