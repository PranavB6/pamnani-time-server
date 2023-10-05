enum ErrorType {
  SERVER_ERROR = 'Server Error',
  TESTING_ERROR = 'Testing Error',
  PARSING_ERROR = 'Parsing Error',
  MISSING_AUTHORIZATION_HEADER = 'Missing Authorization Header',
  INVALID_CREDENTIALS = 'Invalid Credentials',
  GOOGLE_SHEETS_API_ERROR = 'Google Sheets API Error',
  TIMESHEET_RECORD_NOT_FOUND = 'Timesheet Record Not Found',
  ALREADY_CLOCKED_IN = 'Already Clocked In',
  NOT_CLOCKED_IN = 'Not Clocked In',
  TIMESHEET_RECORD_MISMATCH = 'Timesheet Record Mismatch',
  TIMESHEET_RECORD_VALIDATION_ERROR = 'Timesheet Record Validation Error',
  INVALID_DATE = 'Invalid Date',
}

export default ErrorType
