import type GoogleSheetsRow from '../models/googleSheetsRow'
import type UserCredentials from '../models/userCredentials'
import { userCredentialsSchema } from '../models/userCredentials'

const googleSheetsRowToUserCredentials = (
  row: GoogleSheetsRow
): UserCredentials => {
  const [username, password] = row
  return userCredentialsSchema.parse({ username, password })
}

export default googleSheetsRowToUserCredentials
