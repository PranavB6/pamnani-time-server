import { expect } from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import createApp from '../../../../src/app'
import type TimesheetRecord from '../../../../src/models/timesheetRecord'
import type UserCredentials from '../../../../src/models/userCredentials'
import GoogleSheetsDatabaseSimulator from '../../../mocks/googleSheetsDatabaseSimulator'
import TimesheetBuilder from '../../../mocks/timesheetBuilder'

const userA: UserCredentials = {
  username: 'user-a',
  password: 'password-a',
}

const userB: UserCredentials = {
  username: 'user-b',
  password: 'password-b',
}

const userC: UserCredentials = {
  username: 'user-c',
  password: 'password-c',
}

const historyUrl = '/api/v1/user/history'

describe('GET /user/history', function () {
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

  describe('when the user is not authenticated', function () {
    it('should return 401', async function () {
      const response = await supertest(createApp()).get(historyUrl)

      expect(response.status).to.be.equal(401)
    })
  })

  describe('when the user is authenticated', function () {
    beforeEach(function () {
      const users = [userA, userB, userC]

      users.forEach((user) => {
        googleSheetsDatabaseSimulator.addUser(user)
      })
    })
    describe('and the user has no timesheet records', function () {
      it('should return 200 and an empty array', async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userA.username, userA.password)

        expect(response.status).to.be.equal(200)
        expect(response.body).to.be.deep.equal([])
      })
    })

    describe('and the user has timesheet records', function () {
      let timesheetRecords: TimesheetRecord[]

      beforeEach(function () {
        timesheetRecords = new TimesheetBuilder()
          .add(userB.username, {
            count: 2,
            clockOut: false,
          })
          .build()

        timesheetRecords.forEach((timesheetRecord) => {
          googleSheetsDatabaseSimulator.addTimesheetRecord(timesheetRecord)
        })
      })

      it('should return 200 and the user timesheet records', async function () {
        const response = await supertest(createApp())
          .get(historyUrl)
          .auth(userB.username, userB.password)

        expect(response.status).to.be.equal(200)

        const expectedResponse =
          googleSheetsDatabaseSimulator.getUserTimesheetRecords(userB.username)
        expect(response.body).to.be.eql(expectedResponse)
      })
    })
  })
})
