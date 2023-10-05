import getConfig from '../src/config'
import ENV from '../src/models/env'

process.env.NODE_ENV = ENV.TEST

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  './non-existent-service-account-secrets-file.json'

process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'random-spreadsheet-id'

process.env.CACHE_ENABLED = 'false'

if (!(getConfig().env === ENV.TEST)) {
  console.log('Test Setup Failed')
  process.exit(1)
}

console.log('Test Setup Complete')
