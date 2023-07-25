import { z } from "zod";

const clientClockInRequestSchema = z.object({
  startDatetime: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid datetime format. Expected ISO 8601 format.",
    })
    .trim(),
});

const clientClockOutRequestSchema = z.object({
  endDatetime: z.string().trim(),
  totalTime: z.string().trim(),
});

const clientTimesheetResponseSchema = z.object({
  username: z.string().trim(),
  startDatetime: z.string().trim(),
  endDatetime: z.string().trim().optional(),
  totalTime: z.string().trim().optional(),
  status: z.string().trim(),
});

type ClientClockInRequest = z.infer<typeof clientClockInRequestSchema>;
type ClientClockOutRequest = z.infer<typeof clientClockOutRequestSchema>;
type ClientTimesheetResponse = z.infer<typeof clientTimesheetResponseSchema>;

export {
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
  clientTimesheetResponseSchema,
  type ClientClockInRequest,
  type ClientClockOutRequest,
  type ClientTimesheetResponse,
};
