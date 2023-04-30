// consts
const EMPTY = undefined

/**
 * A simple but enough tasks scheduler based on time interval by using the built-in method setInterval.
 * @param {{name: string, fn: Function, priority: number}[]} tasks - all tasks to be scheduled
 * @param {number?} interval - the time interval between each loop (unit: ms)
 * @return {Object} a controller for the scheduler, including begin, pause, restart and end
 */
const getSimpleTasksScheduler = (tasks = [], interval = 1e3) => {
  let currentLoop = 0
  let timer = EMPTY

  const maxLoopCount = Math.max.apply(
    Math,
    tasks.map((i) => i.priority)
  )
  const isInThisLoop = ({ priority }) => {
    const isExceeded = currentLoop >= priority
    if (!isExceeded) return false
    const isInCycle = currentLoop % priority == 0
    if (!isInCycle) return false
    return true
  }

  const work = () => {
    currentLoop++
    const thisLoopTasks = tasks.filter(isInThisLoop)
    thisLoopTasks.forEach((i) => i.fn())
    if (currentLoop == maxLoopCount) currentLoop = 0
  }
  const clearTimer = () => {
    // clear and reset timer
    clearInterval(timer)
    timer = EMPTY
  }

  const controller = {
    get __timer() {
      return timer
    },
    begin() {
      if (timer) {
        throw 'Scheduler is working now.'
      }
      timer = setInterval(work, interval)
    },
    pause() {
      // clear timer only
      clearTimer()
    },
    restart() {
      // make it simple, so we just redirect to call the begin
      this.begin()
    },
    end() {
      // reset currentLoop
      currentLoop = 0
      // clear timer
      clearTimer()
    },
  }

  return controller
}

export default getSimpleTasksScheduler
