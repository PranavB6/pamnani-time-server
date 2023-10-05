import { expect } from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import createApp from '../../../src/app'
import GoogleSheetsDatabaseSimulator from '../../mocks/googleSheetsDatabaseSimulator'

const verifyCredentialsUrl = '/api/v1/verify-credentials'

const validUser = {
  username: 'Username A',
  password: 'Password A',
}
describe('POST /verify-credentials request', function () {
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

  describe('when the database has no users', function () {
    it('should return 401', async function () {
      const response = await supertest(createApp())
        .post(verifyCredentialsUrl)
        .auth('Test Username', 'Test Password')

      expect(response.status).to.be.equal(401)
    })
  })

  describe('when the database has a user', function () {
    beforeEach(function () {
      googleSheetsDatabaseSimulator.addUser(validUser)
    })

    describe('and the user is not found', function () {
      it('should return 401', async function () {
        const response = await supertest(createApp())
          .post(verifyCredentialsUrl)
          .auth('Non Existent Username', validUser.password)

        expect(response.status).to.be.equal(401)
      })
    })

    describe('and the user is found', function () {
      describe('and the password is incorrect', function () {
        it('should return 401', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(validUser.username, 'Incorrect Password')

          expect(response.status).to.be.equal(401)
        })
      })

      describe('and the password is correct', function () {
        it('should return 200', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(validUser.username, validUser.password)

          expect(response.status).to.be.equal(200)
        })
      })
    })
  })

  describe('when the database has multiple users', function () {
    const userA = {
      username: 'Username A',
      password: 'Password A',
    }
    const userB = {
      username: 'Username B',
      password: 'Password B',
    }

    beforeEach(function () {
      googleSheetsDatabaseSimulator.addUser(userA)
      googleSheetsDatabaseSimulator.addUser(userB)
    })

    describe('and the first user is found', function () {
      describe('and the password is correct', function () {
        it('should return 200', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(userA.username, userA.password)

          expect(response.status).to.be.equal(200)
        })
      })

      describe('and the password is incorrect', function () {
        it('should return 401', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(userA.username, 'Incorrect Password')

          expect(response.status).to.be.equal(401)
        })
      })
    })

    describe('and the second user is found', function () {
      describe('and the password is correct', function () {
        it('should return 200', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(userB.username, userB.password)

          expect(response.status).to.be.equal(200)
        })
      })

      describe('and the password is incorrect', function () {
        it('should return 401', async function () {
          const response = await supertest(createApp())
            .post(verifyCredentialsUrl)
            .auth(userB.username, 'Incorrect Password')

          expect(response.status).to.be.equal(401)
        })
      })
    })
  })
})
