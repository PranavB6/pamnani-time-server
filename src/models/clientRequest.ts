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
  endDatetime: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid datetime format. Expected ISO 8601 format.",
    })
    .trim(),
  totalTime: z.string().trim(),
  comments: z.string().trim(),
});

type ClientClockInRequest = z.infer<typeof clientClockInRequestSchema>;
type ClientClockOutRequest = z.infer<typeof clientClockOutRequestSchema>;

export {
  clientClockInRequestSchema,
  clientClockOutRequestSchema,
  type ClientClockInRequest,
  type ClientClockOutRequest,
};
