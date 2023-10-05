const emptyStringToUndefined = (value?: string): string | null => {
  if (value == null) {
    return null
  }

  if (value.trim() === '') {
    return null
  }

  return value
}

export default emptyStringToUndefined
