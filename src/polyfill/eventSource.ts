import Taro from '@tarojs/taro'
import { Base64 } from 'js-base64'

type RequestTask = any

class TaroEventSource implements EventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  readonly CONNECTING = TaroEventSource.CONNECTING
  readonly OPEN = TaroEventSource.OPEN
  readonly CLOSED = TaroEventSource.CLOSED

  _url: string
  _withCredentials: boolean
  _readyState: number

  _manualClose = false

  get url(): string { return this._url }

  get withCredentials(): boolean { return this._withCredentials }

  get readyState(): number { return this._readyState }

  private readonly listeners: Record<string, any[]> = {}

  private task: RequestTask | null = null

  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    this._readyState = this.CONNECTING
    this._url = url.toString()
    this._withCredentials = eventSourceInitDict?.withCredentials ?? false
    this.connect()
  }

  private connect(): void {
    const task = Taro.request({
      url: this._url,
      method: 'GET',
      enableChunked: true,
      complete: () => {
        log('EventSource complete')
        this._readyState = this.CLOSED
        !this._manualClose && this.connect()
      },
      fail: (e) => {
        log('EventSource fail', e)
        this.dispatchEvent(new MessageEvent('', 'error', e))
      },
    })
    task.onHeadersReceived(res => {
      log('EventSource onHeadersReceived', res)
      this._readyState = this.OPEN
      this.dispatchEvent(new MessageEvent('', 'open', res))
    })
    task.onChunkReceived(res => {
      log('EventSource onChunkReceived', res)
      this.handleChunk(res.data)
    })
    this.task = task
  }

  private handleChunk(buffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(buffer)
    const data = Base64.decode(Base64.fromUint8Array(uint8Array))
    this.dispatchEvent(this.parseEvent(data))
  }

  private parseEvent(msg: string): MessageEvent<any> {
    const lines = msg.split('\n')
      .filter(l => l != '' && !l.startsWith(':')) // filter empty and comment
    const result: Record<string, string> = {}
    for (let line of lines) {
      const sIndex = line.indexOf(':')
      if (sIndex === -1) {
        continue
      }
      const key = line.substring(0, sIndex).trim()
      let value = line.substring(sIndex + 1).trim()
      if (key === 'data') {
        value = `${result[key] || ''}\n${value}`
      }
      result[key] = value
    }
    return new MessageEvent(result['id'], result['event'] || 'message', result['data'])
  }

  close(): void {
    this._manualClose = true
    this.task?.abort()
    this.task = null
  }

  dispatchEvent(event: any): boolean {
    if (!event.type) {
      throw new Error('Cannot dispatch event without event type')
    }
    this.listeners[event.type]?.forEach((listener) => {
      if (typeof listener === 'function') {
        listener(event)
      } else {
        listener.handleEvent(event)
      }
    })
    return true
  }

  addEventListener(event: string, listener: unknown): void {
    const l = this.listeners[event] || []
    if (l.includes(listener)) return
    l.push(listener)
    this.listeners[event] = l
  }

  removeEventListener(event: string, listener: unknown): void {
    const l = this.listeners[event] || []
    const index = l.indexOf(listener)
    if (index === -1) return
    l.splice(index, 1)
    this.listeners[event] = l
  }

  get onopen(): ((this: EventSource, ev: Event) => any) | null {
    return this.listeners['open']?.[0]
  }

  set onopen(listener: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners['open'] = [listener]
  }

  get onmessage(): ((this: EventSource, ev: MessageEvent<any>) => any) | null {
    return this.listeners['message']?.[0]
  }

  set onmessage(listener: ((this: EventSource, ev: MessageEvent<any>) => any) | null) {
    this.listeners['message'] = [listener]
  }

  get onerror(): ((this: EventSource, ev: Event) => any) | null {
    return this.listeners['error']?.[0]
  }

  set onerror(listener: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners['error'] = [listener]
  }
}

class MessageEvent<T> {
  lastEventId: string
  data: T
  type: string

  constructor(id: string, type: string, data: T) {
    this.lastEventId = id
    this.type = type
    this.data = data
  }
}

// @ts-ignore
globalThis.__ENABLE_EVENT_SOURCE_DEBUG = false
function log(...args: any[]) {
  // @ts-ignore
  if (globalThis.__ENABLE_EVENT_SOURCE_DEBUG) {
    console.info(...args)
  }
}

globalThis.EventSource = TaroEventSource
