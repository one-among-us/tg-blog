# tg-blog: Display Telegram Channel on Web Page

This is a front-end for displaying telegram (or any compatible) channel data as an interactive web page. The data format is specified in [models.ts](src/logic/models.ts), and can be generated using [TelegramBackup](https://github.com/one-among-us/TelegramBackup).

Demo: https://test-tg.one-among.us/test  
You can also check out [Azalea's Blog](https://aza.moe/life) for a demo.

## Getting Started

### Use in Plain HTML

You can use it in plain HTML without a modern web build tool:

```html
<html lang="en">
<head>
  <title>My Blog</title>

  <!-- Import Libraries -->
  <script src="https://unpkg.com/vue@3"></script>
  <script src="https://unpkg.com/tg-blog"></script>
  <link rel="stylesheet" href="https://unpkg.com/tg-blog/dist/style.css">

  <!-- Styles -->
  <style>
      body { font-family: Avenir, Helvetica, Arial, sans-serif }
  </style>
</head>
<body>
  <!-- Template setup (Paste your data url here) -->
  <div id="app">
    <tg-blog posts-url="https://profile-api.hydev.org/exports/hykilp/posts.json"></tg-blog>
  </div>

  <!-- Vue js setup -->
  <script>
    Vue.createApp().component("tg-blog", TgBlog.TgBlog).mount('#app')
  </script>
</body>
</html>
```

### Use in Vite

You can also use import it into your project using modern build tools like vite:

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

## Component Documentation

### TgBlog

There is only one option that you need to specify: `posts-url`, which should point to the `posts.json` of your blog data.

You can generate `posts.json` using [TelegramBackup](https://github.com/one-among-us/TelegramBackup)

```vue
<tg-blog posts-url="https://profile-api.hydev.org/exports/hykilp/posts.json"></tg-blog>
```

#### Props

| Prop        | Description                                   |
|-------------|-----------------------------------------------|
| `posts-url` | HTTP Link to your blog data `posts.json` file |

### ImageViewer (Internal)

If you only want the image viewer functionality, you can import this module.

TODO: Write more documentation

