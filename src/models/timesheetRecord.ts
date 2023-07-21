import { z } from "zod";

const timesheetRecordSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .trim()
    .min(1),
  date: z
    .string({
      required_error: "Date is required",
    })
    .trim()
    .min(1),
  startTime: z
    .string({
      required_error: "Start time is required",
    })
    .trim()
    .min(1),
  endTime: z
    .string({
      required_error: "End time is required",
    })
    .trim()
    .min(1),
  totalTime: z
    .string({
      required_error: "Total time is required",
    })
    .trim()
    .min(1),
  status: z
    .string({
      required_error: "Status is required",
    })
    .trim()
    .min(1),
});

type TimesheetRecord = z.infer<typeof timesheetRecordSchema>;

export default TimesheetRecord;
export { timesheetRecordSchema };
