import { z } from 'zod'

const userCredentialsSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
})

type UserCredentials = z.infer<typeof userCredentialsSchema>

export default UserCredentials
export { userCredentialsSchema }
