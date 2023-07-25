import { z } from "zod";

const clockInTimesheetRecordSchema = z.object({
  username: z.string().trim(),
  date: z.string().trim(),
  startTime: z.string().trim(),
  status: z.string().trim(),
});

type ClockInTimesheetRecord = z.infer<typeof clockInTimesheetRecordSchema>;

const completeTimesheetRecordSchema = z.object({
  username: z.string().trim(),
  date: z.string().trim(),
  startTime: z.string().trim(),
  status: z.string().trim(),
  endTime: z.string().trim(),
  totalTime: z.string().trim(),
});

type CompleteTimesheetRecord = z.infer<typeof completeTimesheetRecordSchema>;

const timesheetRecordSchema = z.union([
  completeTimesheetRecordSchema, // ORDER MATTERS. zod will try to parse the first schema first
  clockInTimesheetRecordSchema,
]);

type TimesheetRecord = z.infer<typeof timesheetRecordSchema>;

export default TimesheetRecord;

export {
  timesheetRecordSchema,
  clockInTimesheetRecordSchema,
  completeTimesheetRecordSchema,
  type ClockInTimesheetRecord,
  type CompleteTimesheetRecord,
};
