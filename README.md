# tg-blog: Display Telegram Channel in a Blog

Demo: TODO

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
