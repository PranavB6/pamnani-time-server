import { z } from "zod";

const userCredentialsRecordSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .trim()
    .min(1),
  password: z
    .string({
      required_error: "Password is required",
    })
    .trim()
    .min(1),
});

type UserCredentialsRecord = z.infer<typeof userCredentialsRecordSchema>;

export default UserCredentialsRecord;
export { userCredentialsRecordSchema };
