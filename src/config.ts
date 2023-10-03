import "dotenv/config";
import { z } from "zod";

function getConfig(): Config {
  return configSchema.parse({
    env: process.env.NODE_ENV,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    googleSheets: {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    },
    showLogsInTests: stringToBoolean(process.env.SHOW_LOGS_IN_TESTS),
    cacheEnabled: stringToBoolean(process.env.CACHE_ENABLED),
  });
}

enum ENV {
  PRODUCTION = "production",
  DEVELOPMENT = "development",
  TEST = "test",
}

function stringToBoolean(str: string | undefined): boolean | undefined {
  if (str === undefined) {
    return undefined;
  }

  const strLower = str.trim().toLowerCase();

  if (["true", "y", "yes", "1"].includes(strLower)) {
    return true;
  }

  if (["false", "n", "no", "0"].includes(strLower)) {
    return false;
  }

  throw new Error(`Invalid boolean string: ${str}`);
}

const configSchema = z
  .object({
    env: z.nativeEnum(ENV),
    googleApplicationCredentials: z.string().optional(),
    googleSheets: z.object({
      spreadsheetId: z.string().min(1),
    }),
    showLogsInTests: z
      .boolean({
        invalid_type_error: "showLogs must be a boolean",
      })
      .default(false),
    cacheEnabled: z
      .boolean({
        invalid_type_error: "cacheEnabled must be a boolean",
      })
      .default(true),
  })
  .strict(); // don't allow additional properties

type Config = z.infer<typeof configSchema>;

export default getConfig;
export { ENV };
