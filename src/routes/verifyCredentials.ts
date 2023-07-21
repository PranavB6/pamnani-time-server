import { type Request, type Response, Router } from "express";

import auth from "../middlewares/auth";

const router = Router();

router.post("/", auth, (req: Request, res: Response) => {
  res.send({ message: "Login successful" });
});

export default router;
