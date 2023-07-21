import getConfig, { ENV } from "../src/config";

process.env.NODE_ENV = ENV.TEST;
process.env.SHOW_LOGS = "false";

if (!(getConfig().env === ENV.TEST)) {
  console.log("Test Setup Failed");
  process.exit(1);
}

console.log("Test Setup Complete");
