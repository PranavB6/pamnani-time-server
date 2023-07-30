import { type Request, type Response, Router } from "express";

import PamnaniSheetsApi from "../db/pamnaniSheetsApi";
import expressAsyncHandler from "../utils/expressAsyncHandler";
import logger from "../utils/logger";

const router = Router();

router.get(
  "/",
  expressAsyncHandler(async (req: Request, res: Response) => {
    logger.verbose("🍑 Process request to get users");

    const userCredentials = await PamnaniSheetsApi.getAllUserCredentials();

    const usernames = userCredentials.map(
      (userCredential) => userCredential.username
    );

    logger.info(`🍑 Got ${usernames.length} users`);

    res.send(usernames);
  })
);

export default router;
