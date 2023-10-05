import { type RequestHandler } from 'express'

const expressAsyncHandler = (
  fn: (...args: any[]) => void | Promise<void>
): RequestHandler =>
  async function asyncUtilWrap(...args: any[]) {
    const fnReturn = fn(...args)
    const next = args[args.length - 1]
    await Promise.resolve(fnReturn).catch(next)
  }

export default expressAsyncHandler
