import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

import {
  type CondensedTimesheetRecord,
  condensedTimesheetRecordSchema,
} from "../../src/models/condensedTimesheetRecord";
import calculateTotalTime from "../../src/utils/calculateTotalTime";

const datetimeToString = (date: Date): string => {
  return dayjs(date).set("millisecond", 0).toISOString();
};

class CondensedTimesheetRecordCreator {
  recordData: object;

  constructor(username: string) {
    const startDatetime = datetimeToString(faker.date.recent());

    const randomTotalTime = faker.datatype.number({
      min: 1,
      max: 12,
      precision: 0.25, // 15 minutes
    });

    const endDatetime = dayjs(startDatetime)
      .add(randomTotalTime, "hour")
      .toISOString();

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

  public build(): CondensedTimesheetRecord {
    return condensedTimesheetRecordSchema.parse(this.recordData);
  }
}

export default CondensedTimesheetRecordCreator;
