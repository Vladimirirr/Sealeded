// consts
const empty = undefined // void 0
const oneSecond = 1e3 // 一秒
const TimeTypeTick = 'TICK'
const TimeTypeEnd = 'END'

// utils
const set = localStorage.setItem.bind(localStorage)
const get = localStorage.getItem.bind(localStorage)
const remove = localStorage.removeItem.bind(localStorage)
const int = (v) => {
  v = parseInt(v, 10)
  if (isNaN(v)) {
    // It is ensured that the v must be a number, so it is safe to use the global `isNaN` without the need for `Number.isNaN`.
    return 0
  }
  return v
}
const makePositive = (v) => Math.max(0, int(v))

/**
 * 一个持久化的倒计时工具
 * @param {string} name - 倒计时唯一标识
 * @param {number} time - 倒计时总时长，如果此倒计时已存在就忽略此参数，单位：秒
 * @param {(type: string, remaining: number)} cb - 倒计时 callback
 * @return {{ begin: Function, reset: Function, end: Function }} 控制器 ctlr = controller
 */
const useTimeout = (name, time, cb) => {
  const originTime = makePositive(time)

  let timer = empty

  name = `useTimeout__${name}`
  time = originTime

  const updateTimeToStore = () => set(name, time)
  const beginTimeout = () => {
    // 此处 time 必定 >= 0

    // check and execute callback once called
    if (time > 0) {
      cb(TimeTypeTick, time)
    } else {
      cb(TimeTypeEnd, time)
      return // 不必再计时了
    }

    // 此处 time 必定 > 0

    // actual timeout function
    const doTimeout = () => {
      let type = empty
      if (--time > 0) {
        type = TimeTypeTick
      } else {
        // timeout done
        type = TimeTypeEnd
      }
      updateTimeToStore()
      return type
    }

    // set a interval timer
    timer = setInterval(() => {
      const type = doTimeout()
      if (type == TimeTypeEnd) {
        stopTimeout()
      }
      cb(type, time)
    }, oneSecond)
  }
  const stopTimeout = () => {
    if (timer == empty) return
    clearInterval(timer)
    timer = empty
  }

  const ctlr = {
    /**
     * begin timeout
     */
    begin() {
      if (timer) {
        throw 'Begin failed because of timeouting.'
      }
      // begin a brand-new or continue a existed
      const stored = get(name)
      if (stored) {
        // restore from the stored time
        time = makePositive(stored)
      } else {
        // store the brand-new time
        updateTimeToStore()
      }
      beginTimeout()
    },
    /**
     * pause timeout
     */
    pause() {
      // stop timeout
      stopTimeout()
    },
    /**
     * reset timeout
     */
    reset() {
      // stop timeout
      stopTimeout()
      // reset origin time
      time = originTime
      // force update time
      updateTimeToStore()
      // re-begin
      beginTimeout()
    },
    /**
     * end timeout
     */
    end() {
      // stop timeout
      stopTimeout()
      // set time to 0
      time = 0
      // force update time
      updateTimeToStore()
      // call the callback
      cb(TimeTypeEnd, time)
    },
    /**
     * clear timeout = 'call end()' + 'remove stored time data from your computer'
     */
    clear() {
      // end it
      ctlr.end() // DO NOT use this, because the reference relationship is fragile in JS.
      // remove stored item
      remove(name)
    },
  }

  return ctlr
}

export default useTimeout
