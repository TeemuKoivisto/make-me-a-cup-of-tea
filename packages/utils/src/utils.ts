// import crypto from 'crypto'

export function uuidv4() {
  // // Not available in all browsers (yet) https://caniuse.com/?search=crypto.randomUUID
  // if (crypto.hasOwnProperty('randomUUID')) {
  //   // @ts-ignore
  //   return crypto.randomUUID()
  // }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generateUUID() {
  let d = Date.now()
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0 //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) { //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else { //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}


export class CustomError extends Error {
  statusCode?: number

  constructor(message: string, errorCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = errorCode
    // Doesn't exist in FF
    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
