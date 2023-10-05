const stringToBoolean = (str: string | undefined): boolean | undefined => {
  if (str === undefined) {
    return undefined
  }

  const strLower = str.trim().toLowerCase()

  if (['true', 'y', 'yes', '1'].includes(strLower)) {
    return true
  }

  if (['false', 'n', 'no', '0'].includes(strLower)) {
    return false
  }

  throw new Error(`Invalid boolean string: ${str}`)
}

export default stringToBoolean
