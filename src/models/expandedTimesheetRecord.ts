import { z } from "zod";

const clockedInExpandedTimesheetRecordSchema = z.object({
  username: z.string().trim(),
  date: z.string().trim(),
  startTime: z.string().trim(),
  status: z.string().trim(),
});

type ClockedInExpandedTimesheetRecord = z.infer<
  typeof clockedInExpandedTimesheetRecordSchema
>;

const completeExpandedTimesheetRecordSchema = z.object({
  username: z.string().trim(),
  date: z.string().trim(),
  startTime: z.string().trim(),
  status: z.string().trim(),
  endTime: z.string().trim(),
  totalTime: z.string().trim(),
});

type CompleteExpandedTimesheetRecord = z.infer<
  typeof completeExpandedTimesheetRecordSchema
>;

const expandedTimesheetRecordSchema = z.union([
  completeExpandedTimesheetRecordSchema, // ORDER MATTERS. zod will try to parse the first schema first
  clockedInExpandedTimesheetRecordSchema,
]);

type ExpandedTimesheetRecord = z.infer<typeof expandedTimesheetRecordSchema>;

export default ExpandedTimesheetRecord;

const isCompleteExpandedTimesheetRecord = (
  timesheetRecord: ExpandedTimesheetRecord
): timesheetRecord is CompleteExpandedTimesheetRecord => {
  return (
    "endTime" in timesheetRecord &&
    timesheetRecord.endTime != null &&
    timesheetRecord.endTime.length > 0
  );
};

export {
  expandedTimesheetRecordSchema,
  clockedInExpandedTimesheetRecordSchema,
  completeExpandedTimesheetRecordSchema,
  isCompleteExpandedTimesheetRecord,
  type ClockedInExpandedTimesheetRecord,
  type CompleteExpandedTimesheetRecord,
};
