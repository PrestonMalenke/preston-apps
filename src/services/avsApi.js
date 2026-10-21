let avsCache = null

async function loadgetAvsData({ force = false } = {}) {
  if (!force && avsCache) return avsCache

  const response = await fetch('/api/avs', {
    headers: { Accept: 'application/json' },
    cache: force ? 'no-store' : 'default',
  })

  if (!response.ok) {
    throw new Error('NHL data is temporarily unavailable.')
  }

  const data = await response.json()
  if (data.error) throw new Error(data.error)

  avsCache = data
  return avsCache
}

let getAvsDataPending = null
export function getAvsData({ force = false } = {}) {
  if (!force && getAvsDataPending) return getAvsDataPending
  const promise = loadgetAvsData({ force })
  getAvsDataPending = promise
  const clear = () => { if (getAvsDataPending === promise) getAvsDataPending = null }
  promise.then(clear,clear)
  return promise
}
