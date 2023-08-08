import { expect } from "chai";
import dayjs from "dayjs";
import sinon from "sinon";
import supertest from "supertest";

import GoogleSheetsDatabaseSimulator from "./helpers/googleSheetsDatabaseSimulator";
import createApp from "../src/app";

const clockOutUrl = "/api/v1/user/clock-out";

const userA = {
  username: "User A",
  password: "Password A",
};

const userB = {
  username: "User B",
  password: "Password B",
};

const now = dayjs().set("millisecond", 0).toISOString();

describe("POST /clock-out request", function () {
  let googleSheetsSimulator: GoogleSheetsDatabaseSimulator;

  beforeEach(function () {
    googleSheetsSimulator = new GoogleSheetsDatabaseSimulator();

    [userA, userB].forEach((user) => {
      googleSheetsSimulator.addUser(user.username, user.password);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("with valid user credentials in the request", function () {
    describe("and the user does not have any records", function () {
      it("should return 409 even if the request body is valid", async function () {
        const requestBody = {
          endDateTime: now,
          totalTime: "00:15",
        };

        const response = await supertest(createApp())
          .post(clockOutUrl)
          .auth(userA.username, userA.password)
          .send(requestBody);

        expect(response.status).to.be.equal(409);
      });
    });
  });
});
