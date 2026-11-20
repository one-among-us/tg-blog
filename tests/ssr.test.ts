import {describe, expect, test} from 'bun:test'
import {createSSRApp, h} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {TgBlog} from '../dist/tg-blog.es.js'
import type {Post} from '../src/logic/models'

describe('TgBlog SSR rendering (pure server environment)', () => {
  test('renders static and interactive posts including location, video, empty images[], and original photos without crashing', async () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')

    const posts: Post[] = [
      {
        id: 1,
        date: '2026-11-19T08:00:00Z',
        text: '<p>Photo + Original</p>',
        author: 'Owner',
        images: [
          {
            url: '../media/epochs/1/photo.webp',
            width: 1200,
            height: 800,
            original_url: '../media/epochs/1/photo_orig.jpg',
            original_size: 4_194_304,
            original_name: 'IMG_001.JPG',
          },
        ],
        reactions: [{emoji: '❤️', count: 3}],
      },
      {
        id: 2,
        date: '2026-11-19T08:05:00Z',
        text: '<p>Empty images + location + video</p>',
        images: [],
        files: [
          {
            url: '',
            mime_type: '',
            media_type: 'location',
            latitude: 37.7749,
            longitude: -122.4194,
            title: 'San Francisco',
            address: 'CA',
          } as any,
          {
            url: '../media/epochs/1/clip.mp4',
            mime_type: 'video/mp4',
            media_type: 'video_file',
          },
        ],
      },
    ]

    const staticHtml = await renderToString(
      createSSRApp({
        render: () => h(TgBlog, {postsUrl: '/api/life/exports/posts.json', postsData: posts}),
      })
    )
    expect(staticHtml).toContain('Photo + Original')
    expect(staticHtml).toContain('2026-11-19 8:00')
    expect(staticHtml).toContain('/api/life/media/epochs/1/photo.webp')
    expect(staticHtml).toContain('Empty images + location + video')
    // No empty .head div when post has no forwarded_from (flush top edge fix)
    expect(staticHtml).not.toContain('class="head unselectable"')
    // Apple emoji image rendered in reaction pills by default
    expect(staticHtml).toContain('emoji-datasource-apple@16.0.0/img/apple/64/2764-fe0f.png')
    expect(staticHtml).not.toContain('add-reaction-btn')
    expect(staticHtml).not.toContain('quick-reaction')
    expect(staticHtml).not.toContain('comment-toggle')

    // Forwarded post renders .head; empty appleEmojiBaseUrl disables Apple emoji images
    const forwardedNoAppleHtml = await renderToString(
      createSSRApp({
        render: () =>
          h(TgBlog, {
            postsUrl: '/api/life/exports/posts.json',
            postsData: [{...posts[0], forwarded_from: 'Friend'}],
            appleEmojiBaseUrl: '',
          }),
      })
    )
    expect(forwardedNoAppleHtml).toContain('class="head unselectable"')
    expect(forwardedNoAppleHtml).not.toContain('emoji-datasource-apple')
    expect(forwardedNoAppleHtml).toContain('tgb-apple-emoji-fallback')

    const interactiveHtml = await renderToString(
      createSSRApp({
        render: () =>
          h(TgBlog, {
            postsUrl: '/api/life/exports/posts.json',
            postsData: posts,
            apiUrl: '/api/life',
          }),
      })
    )
    expect(interactiveHtml).not.toContain('add-reaction-btn')
    expect(interactiveHtml).not.toContain('quick-reaction')
    expect(interactiveHtml).toContain('interactive-reactions')
    expect(interactiveHtml).toContain('comment-toggle')
  })
})
