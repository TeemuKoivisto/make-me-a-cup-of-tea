/**
 * Observable class to perform basic pub/sub pattern
 * 
 * Define events as strings eg 'update' | 'unmount' to which you can subscribe event listeners to.
 */
export class Observable<K = string> {
  #observers = new Map<K, Set<(...args: any[]) => void>>()

  on(key: K, cb: (...args: any[]) => void) {
    const current = this.#observers.get(key)
    if (current) {
      this.#observers.set(key, new Set(current.add(cb)))
    } else {
      this.#observers.set(key, new Set([cb]))
    }
  }

  off(key: K, cb: (...args: any[]) => void) {
    const observers = this.#observers.get(key)
    if (observers) {
      observers.delete(cb)
      if (observers.size === 0) {
        this.#observers.delete(key)
      }
    }
  }

  emit(key: K, ...args: any[]) {
    return Array.from((this.#observers.get(key) || new Set()).values()).forEach(
      (cb) => cb(...args)
    )
  }

  destroy() {
    this.#observers = new Map()
  }
}
