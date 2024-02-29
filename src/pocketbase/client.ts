import _Client, { BaseAuthStore, SendOptions } from 'pocketbase'
import { TaroLocalStorageAuthStore } from './authStore'

export class Client extends _Client {
    constructor(baseUrl = '/', authStore?: BaseAuthStore | null, lang = 'zh-CN') {
        super(baseUrl, authStore || new TaroLocalStorageAuthStore(), lang)
    }

    send<T = any>(path: string, options: SendOptions): Promise<T> {
        const newOptions = Object.assign({ fetch: globalThis.fetch }, options)
        return super.send(path, newOptions)
    }
}

export * from 'pocketbase'
export * from './authStore'
