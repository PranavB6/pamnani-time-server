import { type Request, type Response, Router } from "express";

import TimeeySheetsApi from "../db/timeeySheetsApi";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import logger from "../utils/logger";

const cache = new Map();

const router = Router();

router.get(
  "/",
  expressAsyncHandler(async (req: Request, res: Response) => {
    logger.verbose("🍑 Process request to get users");

    if (cache.has("users")) {
      logger.verbose("🍑 Got users from cache");

      res.send(cache.get("users"));

      return;
    }

    const userCredentials = await TimeeySheetsApi.getAllUserCredentials();

    const usernames = userCredentials.map(
      (userCredential) => userCredential.username
    );

    logger.info(`🍑 Got ${usernames.length} users`);

    cache.set("users", usernames);
    res.send(usernames);
  })
);

export default router;
