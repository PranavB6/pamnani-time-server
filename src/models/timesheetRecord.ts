import { z } from 'zod'

const timesheetRecordSchema = z.object({
  id: z.string().trim(),
  username: z.string().trim(),
  startDatetime: z.string().trim(),
  endDatetime: z.string().trim().optional(),
  totalTime: z.string().trim().optional(),
  status: z.string().trim(),
  comments: z.string().trim().default(''),
})

type TimesheetRecord = z.infer<typeof timesheetRecordSchema>

const isClockedInRecord = (record: TimesheetRecord): boolean => {
  return record.status.toLowerCase() === 'clocked in'
}

export default TimesheetRecord

export { timesheetRecordSchema, isClockedInRecord }
