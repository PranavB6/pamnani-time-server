import { expect } from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import createApp from '../../../../src/app'
import type UserCredentials from '../../../../src/models/userCredentials'
import GoogleSheetsDatabaseSimulator from '../../../mocks/googleSheetsDatabaseSimulator'
import TimesheetRecordCreator from '../../../mocks/timesheetRecordCreator'

const user: UserCredentials = {
  username: 'user-a',
  password: 'password-a',
}

const clockOutUrl = '/api/v2/user/clock-out'

describe('POST /user/clock-out', function () {
  let googleSheetsDatabaseSimulator: GoogleSheetsDatabaseSimulator

  before(function () {
    googleSheetsDatabaseSimulator = new GoogleSheetsDatabaseSimulator()
  })

  beforeEach(function () {
    googleSheetsDatabaseSimulator.setup()
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('when the user is authenticated', function () {
    beforeEach(function () {
      const users = [user]

      users.forEach((user) => {
        googleSheetsDatabaseSimulator.addUser(user)
      })
    })

    it('should calculate time accurately', async function () {
      const clockInTimesheet = new TimesheetRecordCreator()
        .clockInWithStartDatetime(user.username, '2023-10-06T15:56:07-06:00')
        .build()

      googleSheetsDatabaseSimulator.addTimesheetRecord(clockInTimesheet)

      const clockInId = clockInTimesheet.id

      const clockOutResponse = await supertest(createApp())
        .post(clockOutUrl)
        .send({
          id: clockInId,
          endDatetime: '2023-10-06T19:18:51-06:00',
          totalTime: '03:15',
        })
        .auth(user.username, user.password)

      expect(clockOutResponse.status).to.be.equal(200)
    })
  })
})
