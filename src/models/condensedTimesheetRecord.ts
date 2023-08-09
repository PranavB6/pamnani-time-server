import { z } from "zod";

const condensedTimesheetRecordSchema = z.object({
  username: z.string().trim(),
  startDatetime: z.string().trim(),
  endDatetime: z.string().trim().optional(),
  totalTime: z.string().trim().optional(),
  status: z.string().trim(),
});

type CondensedTimesheetRecord = z.infer<typeof condensedTimesheetRecordSchema>;

const isCompleteCondensedTimesheetRecord = (
  record: CondensedTimesheetRecord
): record is Required<CondensedTimesheetRecord> => {
  return record.endDatetime != null && record.totalTime != null;
};

export {
  type CondensedTimesheetRecord,
  condensedTimesheetRecordSchema,
  isCompleteCondensedTimesheetRecord,
};
