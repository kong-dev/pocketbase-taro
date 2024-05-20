# pocketbase-taro

PocketBase JavaScript SDK for Taro

<div>
  <a href="https://www.npmjs.com/package/pocketbase-taro">
    <img src="https://img.shields.io/npm/v/pocketbase-taro.svg">
  </a>
</div>

## Installation

```sh
# npm
npm install pocketbase-taro
# yarn
yarn add pocketbase-taro
# pnpm
pnpm add pocketbase-taro
```

> Due to the utilization of ES6 syntax in the PocketBase SDK, the following options need to be added:
> 
> ```diff
> # project.config.json
> 
> {
>   "setting": {
> +    "es6": true,
> +    "enhance": true,
>   },
> }
> ```

> For projects that use the [@tarojs/plugin-http](https://github.com/NervJS/taro/tree/main/packages/taro-plugin-http)
> plugin, you'll need to add the following options:
> ```diff
> # config/index.ts
>
> plugins: [
>   ['@tarojs/plugin-http', {
> +    disabledFormData: false,
> +    disabledBlob: false,
>      // other options...
>   }],
> ]
> ```

## Usage

```diff
- import PocketBase from 'pocketbase'
+ import PocketBase from 'pocketbase-taro'

const pb = new PocketBase('http://127.0.0.1:8090')
```
