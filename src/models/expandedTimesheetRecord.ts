import { z } from "zod";

const emptyStringToUndefined = (value?: string): string | undefined => {
  if (value == null) {
    return undefined;
  }

  if (value === "") {
    return undefined;
  }

  return value;
};

const expandedTimesheetRecordSchema = z
  .object({
    id: z.string().trim(),
    username: z.string().trim(),
    date: z.string().trim(),
    startTime: z.string().trim(),
    endTime: z.string().trim().optional().transform(emptyStringToUndefined),
    totalTime: z.string().trim().optional().transform(emptyStringToUndefined),
    status: z.string().trim(),
    comments: z.string().trim().optional().transform(emptyStringToUndefined),
  })
  .refine(
    (data) => {
      // if one of them is null, they should both be null
      if (data.endTime == null || data.totalTime == null) {
        return data.endTime == null && data.totalTime == null;
      }

      return true;
    },
    {
      message: "endTime and totalTime must both be nullish or both be defined",
      path: ["endTime", "totalTime"],
    }
  );

type ExpandedTimesheetRecord = z.infer<typeof expandedTimesheetRecordSchema>;

const isCompleteExpandedTimesheetRecord = (
  record: ExpandedTimesheetRecord
): record is Required<ExpandedTimesheetRecord> => {
  return record.endTime != null && record.totalTime != null;
};

export default ExpandedTimesheetRecord;
export { expandedTimesheetRecordSchema, isCompleteExpandedTimesheetRecord };
