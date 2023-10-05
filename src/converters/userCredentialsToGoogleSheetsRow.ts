import type GoogleSheetsRow from '../models/googleSheetsRow'
import type UserCredentials from '../models/userCredentials'

const userCredentialsToGoogleSheetsRows = (
  userCredentials: UserCredentials
): GoogleSheetsRow => {
  return [userCredentials.username, userCredentials.password]
}

export default userCredentialsToGoogleSheetsRows
