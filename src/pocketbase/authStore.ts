import Taro from '@tarojs/taro'
import { AuthModel, BaseAuthStore } from 'pocketbase'

export class TaroLocalStorageAuthStore extends BaseAuthStore {
    private storageKey: string

    constructor(storageKey = 'pocketbase_auth') {
        super()
        this.storageKey = storageKey
    }

    get token(): string {
        const data = this._storageGet(this.storageKey) || {}

        return data.token || ''
    }

    get model(): AuthModel {
        const data = this._storageGet(this.storageKey) || {}

        return data.model || null
    }

    save(token: string, model?: AuthModel) {
        this._storageSet(this.storageKey, {
            token: token,
            model: model,
        })

        super.save(token, model)
    }

    clear() {
        this._storageRemove(this.storageKey)

        super.clear()
    }

    private _storageGet(key: string): any {
        const rawValue = Taro.getStorageSync(key) || ''
        try {
            return JSON.parse(rawValue)
        } catch (e) {
            return rawValue
        }
    }

    private _storageSet(key: string, value: any) {
        let normalizedVal = value
        if (typeof value !== 'string') {
            normalizedVal = JSON.stringify(value)
        }
        Taro.setStorageSync(key, normalizedVal)
    }

    private _storageRemove(key: string) {
        Taro.removeStorageSync(key)
    }
}
