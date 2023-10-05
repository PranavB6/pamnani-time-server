import { type Request, type Response, Router } from 'express'

import auth from '../middlewares/auth'
import expressAsyncHandler from '../utils/expressAsyncHandler'

const router = Router()

router.post(
  '/',
  auth,
  expressAsyncHandler(async (req: Request, res: Response) => {
    res.send({ message: 'Login successful' })
  })
)

export default router
