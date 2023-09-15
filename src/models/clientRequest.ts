import { z } from "zod";

const clientClockInRequestSchema = z.object({
  startDatetime: z
    .string({
      required_error: "Start datetime is required",
    })
    .datetime({
      offset: true,
      message: "Invalid datetime format. Expected ISO 8601 format.",
    })
    .trim(),
});

const clientClockOutRequestSchema = z.object({
  endDatetime: z
    .string({
      required_error: "End datetime is required",
    })
    .datetime({
      offset: true,
      message: "Invalid datetime format. Expected ISO 8601 format.",
    })
    .trim(),
  totalTime: z
    .string({
      required_error: "Total time is required",
    })
    .trim(),
  comments: z
    .string({
      required_error: "Comments is required (but can be an empty string)",
    })
    .trim(),
});

type ClientClockInRequest = z.infer<typeof clientClockInRequestSchema>;
type ClientClockOutRequest = z.infer<typeof clientClockOutRequestSchema>;

export {
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
  type ClientClockInRequest,
  type ClientClockOutRequest,
};
