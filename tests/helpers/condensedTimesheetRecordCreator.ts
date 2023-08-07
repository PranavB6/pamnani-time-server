import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

import {
  type CondensedTimesheetRecord,
  condensedTimesheetRecordSchema,
} from "../../src/models/condensedTimesheetRecord";
import calculateTotalTime from "../../src/utils/calculateTotalTime";

const formatDate = (date: Date): string => {
  return dayjs(date).set("millisecond", 0).toISOString();
};

class CondensedTimesheetRecordCreator {
  recordData: CondensedTimesheetRecord;

  constructor(username: string) {
    const [dateA, dateB] = faker.date.betweens({
      from: dayjs().set("hour", 0).set("minute", 0).set("second", 0).toDate(),
      to: dayjs().set("hour", 23).set("minute", 59).set("second", 59).toDate(),
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
