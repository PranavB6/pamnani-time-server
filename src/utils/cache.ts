function cache<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  _context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >
): (this: This, ...args: Args) => Return {
  const cacheMap = new Map<string, Return>();

  function replacementMethod(this: This, ...args: Args): Return {
    const cacheKey = JSON.stringify(args);

    const cacheValue = cacheMap.get(cacheKey);
    if (cacheValue != null) {
      console.log(`Cache Hit. Key: ${cacheKey}, Value:`, cacheValue);
      return cacheValue;
    }

    const result = target.call(this, ...args);

    cacheMap.set(cacheKey, result);

    return result;
  }

  return replacementMethod;
}

export default cache;
