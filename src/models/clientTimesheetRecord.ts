import { z } from "zod";

const clientTimesheetRecordSchema = z.object({
  username: z.string({
    required_error: "Username is required",
  }),
  startDatetime: z
    .string({
      required_error: "Start time is required",
    })
    .trim()
    .datetime({
      offset: true, // allow timezone offset
      message: "Start datetime must be a valid datetime",
    }),
  endDatetime: z
    .string({
      required_error: "End time is required",
    })
    .trim()
    .datetime({
      offset: true, // allow timezone offset
      message: "End datetime must be a valid datetime",
    }),
  totalTime: z.string().trim().min(1),
  status: z
    .string({
      required_error: "Status is required",
    })
    .trim()
    .min(1),
});

type ClientTimesheetRecord = z.infer<typeof clientTimesheetRecordSchema>;

export default ClientTimesheetRecord;
export { clientTimesheetRecordSchema };
