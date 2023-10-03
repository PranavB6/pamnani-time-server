import { type CondensedTimesheetRecord } from "../models/condensedTimesheetRecord";

const sortTimesheetRecords = (
  records: CondensedTimesheetRecord[]
): CondensedTimesheetRecord[] => {
  return records.sort((a, b) => {
    return (
      new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()
    );
  });
};

export default sortTimesheetRecords;
