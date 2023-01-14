# tg-blog: Display Telegram Channel on Web Page

This is a front-end for displaying telegram (or any compatible) channel data as an interactive web page. The data format is specified in [models.ts](src/logic/models.ts), and can be generated using [TelegramBackup](https://github.com/one-among-us/TelegramBackup).

Demo: https://test-tg.one-among.us/test  
You can also check out [Azalea's Blog](https://aza.moe/life) for a demo.

## Support Status

### Feature Support

- [x] All text formatting (including spoilers)
- [x] @username, #hashtag
- [x] Forwarded from, reply to (clickable)
- [x] Maps! (location sharing)
- [x] Polls (show result only, unable to vote)
- [x] Contacts

### Media Support

- [x] Stickers, Animated stickers (webm & tgs)
- [x] Custom emojis, animated custom emojis
- [x] Videos, gif animations
- [x] Files
- [x] Audio, voice message (Including an audio player)
- [x] Media groups
- [x] Image viewing & tiling

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

### Use in Hexo Blog

You can also use it in a Hexo blog like in [Linda's Blog](https://blog.1mether.me/tg-channel) ([source code](https://github.com/locoda/blog/blob/master/source/tg-channel.md?plain=1))

Depending on the css of your theme, it might need some modifications to work. For example, [these modifications](https://github.com/locoda/blog/pull/66) were needed for the Icalm theme.

However, you can add the page as a markdown in the following format:

```md
---
title: 'Telegram Blog'
date: 2023-01-13
---

{% raw %}

<!-- Import Libraries -->
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/tg-blog"></script>
<link rel="stylesheet" href="https://unpkg.com/tg-blog/dist/style.css">

<!-- Styles & Patches -->
<style>
    #tg-blog-app { font-family: Avenir, Helvetica, Arial, sans-serif }

    /* Icalm Fix: Override img max-width: 100% set in layout.styl */
    #tg-blog-app img { max-width: unset; }

    /* Icalm Fix: overflow-x: hidden breaks infinite scroll */
    .container { overflow-x: unset !important; }
    body { overflow-x: unset !important; }
</style>

<!-- Template setup (Paste your data url here) -->
<div id="tg-blog-app">
    <tg-blog posts-url="YOUR-POSTS-URL-HERE!"></tg-blog>
</div>

<!-- Vue js setup -->
<script>
const app = Vue.createApp().component("tg-blog", TgBlog.TgBlog)
app.mount('#tg-blog-app')

// Hexo patch: Destroy app when page switched
const interval = setInterval(() => {
    if (!document.getElementById('tg-blog-app')) 
    {
        app.unmount()
        clearInterval(interval)
    }
}, 1000)
</script>

{% endraw %}
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

