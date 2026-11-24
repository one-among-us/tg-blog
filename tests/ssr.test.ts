import {describe, expect, test} from 'bun:test'
import {createSSRApp, h} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {
  AttachmentModal,
  CommentThread,
  RichCommentInput,
  StickerMedia,
  SymbolMenu,
  TextFormatter,
  TgBlog,
} from '../dist/tg-blog.es.js'
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
            thumb: '../media/epochs/1/photo_thumb.webp',
            jxl_url: '../media/epochs/1/photo.jxl',
            thumb_jxl_url: '../media/epochs/1/photo_thumb.jxl',
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
          {
            url: 'https://www.youtube.com/watch?v=M8-vje-bq9c',
            mime_type: '',
            media_type: 'web_page',
            site_name: 'YouTube',
            title: 'Demo Track',
            description: 'Preview snippet text',
            thumb: '../media/epochs/1/29_wp_thumb.webp',
            prefer_large_media: true,
            has_large_media: true,
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
    expect(staticHtml).toContain('/api/life/media/epochs/1/photo_thumb.webp')
    expect(staticHtml).toContain('type="image/jxl"')
    expect(staticHtml).toContain('/api/life/media/epochs/1/photo_thumb.jxl')
    expect(staticHtml).toContain('Empty images + location + video')
    expect(staticHtml).toContain('class="web-page is-large"')
    expect(staticHtml).toContain('https://www.youtube.com/watch?v=M8-vje-bq9c')
    expect(staticHtml).toContain('/api/life/media/epochs/1/29_wp_thumb.webp')
    expect(staticHtml).toContain('Demo Track')
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

  test('renders v3 composer & media components safely during SSR without browser globals', async () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')

    const richHtml = await renderToString(
      createSSRApp({
        render: () => h(RichCommentInput, {
          modelValue: '**hello**',
          placeholder: 'Write a reply...',
        }),
      })
    )
    expect(richHtml).toContain('tgb-rich-input')

    const stickerHtml = await renderToString(
      createSSRApp({
        render: () => h(StickerMedia, {
          url: '/api/life/media/stickers/starter/hello.webp',
          emoji: '✨',
        }),
      })
    )
    expect(stickerHtml).toContain('/api/life/media/stickers/starter/hello.webp')

    const tgsStickerHtml = await renderToString(
      createSSRApp({
        render: () => h(StickerMedia, {
          url: '/api/life/media/stickers/starter/anim.tgs',
          isAnimated: true,
          emoji: '🎉',
        }),
      })
    )
    expect(tgsStickerHtml).toContain('tgb-sticker-tgs-host')
    expect(tgsStickerHtml).not.toContain('<img')

    const closedWidgetsHtml = await renderToString(
      createSSRApp({
        render: () => h('div', [
          h(TextFormatter, {
            open: true,
            anchor: {x: 100, y: 100},
            activeFormats: {
              bold: true,
              italic: false,
              underline: false,
              strikethrough: false,
              monospace: false,
              spoiler: false,
              blockquote: false,
              hasFormatting: true,
            },
          }),
          h(SymbolMenu, {open: true}),
          h(AttachmentModal, {open: true, file: null}),
          h(CommentThread, {postId: 1}),
        ]),
      })
    )
    expect(typeof closedWidgetsHtml).toBe('string')
  })
})
