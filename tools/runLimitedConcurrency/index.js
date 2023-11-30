/**
 * Run concurrent works with a limit
 * @param {Array<Function<Promise<T>>>} works
 * @param {number} limit
 * @return {Array<T | Error>}
 */
const runLimitedConcurrency = async (works = [], limit = works.length) => {
  // format argument limit
  limit = Math.min(works.length, Math.abs(limit))

  // the array where stores the results of all works
  const results = []

  // a function to do a work
  const doWork = async (iterator) => {
    // walk through the itorator
    for (const [index, work] of iterator) {
      let got
      try {
        // console.log(`running ${index}:`, work)
        got = await work()
      } catch (err) {
        got = err
      }
      results[index] = got
    }
  }

  // prepare the workers
  // the Array#entries() will return a iterator of the array
  const workers = Array(limit).fill(works.entries()).map(doWork)

  // begin all works with limited concurrency
  await Promise.all(workers)

  return results
}

export default runLimitedConcurrency
