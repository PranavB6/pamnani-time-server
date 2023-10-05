import createApp from './app'
import getGoogleSheetsDatabase from './db/googleSheetsDatabase'

const PORT = 8000

const main = async (): Promise<void> => {
  const googleSheetsDatabase = getGoogleSheetsDatabase()
  await googleSheetsDatabase.connect()

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`)
  })
}

void main()
