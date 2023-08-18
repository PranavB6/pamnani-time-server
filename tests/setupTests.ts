import getConfig, { ENV } from "../src/config";

process.env.NODE_ENV = ENV.TEST;

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "./non-existent-service-account-secrets-file.json";

process.env.GOOGLE_SHEETS_SPREADSHEET_ID = "random-spreadsheet-id";

process.env.SHOW_LOGS_IN_TESTS = "no";

if (!(getConfig().env === ENV.TEST)) {
  console.log("Test Setup Failed");
  process.exit(1);
}

console.log("Test Setup Complete");
