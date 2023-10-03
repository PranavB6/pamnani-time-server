import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { v4 as uuidv4 } from "uuid";

import {
  type CondensedTimesheetRecord,
  condensedTimesheetRecordSchema,
} from "../../src/models/condensedTimesheetRecord";
import calculateTotalTime from "../../src/utils/calculateTotalTime";

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone = "America/Edmonton";

const formatDate = (date: Date): string => {
  return dayjs(date).set("millisecond", 0).toISOString();
};

class CondensedTimesheetRecordCreator {
  recordData: CondensedTimesheetRecord;

  constructor(username: string) {
    const [dateA, dateB] = faker.date.betweens({
      from: dayjs()
        .tz(defaultTimezone)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toDate(),
      to: dayjs()
        .tz(defaultTimezone)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toDate(),
      count: 2,
    });

    let startDatetime;
    let endDatetime;

    if (dayjs(dateA).isBefore(dateB)) {
      startDatetime = formatDate(dateA);
      endDatetime = formatDate(dateB);
    } else {
      startDatetime = formatDate(dateB);
      endDatetime = formatDate(dateA);
    }

    const totalTime = calculateTotalTime(startDatetime, endDatetime);

    this.recordData = {
      id: uuidv4(),
      username,
      startDatetime,
      endDatetime,
      totalTime,
      status: faker.helpers.arrayElement([
        "Approved",
        "Pending",
        "Rejected",
        "Clocked In",
      ]),
    };
  }

  public makeClockIn(): CondensedTimesheetRecordCreator {
    delete this.recordData.endDatetime;
    delete this.recordData.totalTime;

    return this;
  }

  public build(): CondensedTimesheetRecord {
    return condensedTimesheetRecordSchema.parse(this.recordData);
  }
}

export default CondensedTimesheetRecordCreator;
