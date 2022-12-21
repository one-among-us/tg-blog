# tg-blog: Display Telegram Channel with Vue 3

Demo: https://test-tg.one-among.us/test  
You can also check out [Azalea's Blog](https://aza.moe/life) for a demo.

## Usage

###  Usage in Vite

#### 1. Install dependencies

```
yarn add tg-blog
```

#### 2. Import CSS in your `main.ts`

```ts
import {createApp, h} from 'vue'
import App from './App.vue'
// Add this:
import 'tg-blog/dist/style.css'
```

#### 3. In your `vite.config.ts`, you shall configure to dedupe `vue`

```ts
export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
});
```

#### 4. Import components

```ts
import { TgBlog } from 'tg-blog';

// If you're using Vue-TS Class Component, then add this:
@Options({components: { TgBlog }})
export default class ...
```
