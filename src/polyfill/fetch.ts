import { File, FormData, formdataEncode } from 'miniprogram-polyfill'
import 'taro-fetch-polyfill'

globalThis.FormData = FormData as any
globalThis.File = File as any

const _fetch = globalThis.fetch

function fetch(this: any, input: RequestInfo | URL, init?: RequestInit) {
    const option = Object.assign({}, init)
    if (init?.body && init.body instanceof FormData) {
        const blob = formdataEncode(init.body)
        option.body = blob
        const headers = new Headers(option.headers)
        headers.append('Content-Type', blob.type)
        option.headers = headers
    }
    return _fetch.call(this, input, option)
}

globalThis.fetch = fetch
