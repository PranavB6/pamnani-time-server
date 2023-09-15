import createApp from "./app";
import GoogleSheetsDatabase from "./db/googleSheetsDatabase";

async function main(): Promise<void> {
  const googleSheetsDatabase = new GoogleSheetsDatabase();
  await googleSheetsDatabase.connect();

  const app = createApp();
  const port = 8000;

  app.listen(port, () => {
    console.log(`🚀 Server listening at http://localhost:${port}`);
  });
}

void main();
