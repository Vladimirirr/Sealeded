/**
 * camelize a hyphen-delimited string
 * @param {string} name
 * @return {string}
 */
export const camelize = (name) => {
  const reg = /\-(\w)/g
  const handle = (s) => s.toUpperCase()
  return name.replace(reg, (_, g) => handle(g))
}

export const DelegatedEvents = ['click', 'change' /* and more */]

export const DelegatedEventName = '@event'

export const DelegatedEventDataSplit = '::'
