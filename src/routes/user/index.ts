import { Router } from 'express'

import clockInRouter from './clockIn'
import clockOutRouter from './clockOut'
import historyRouter from './history'

const router = Router()

router.use('/history', historyRouter)
router.use('/clock-in', clockInRouter)
router.use('/clock-out', clockOutRouter)

export default router
