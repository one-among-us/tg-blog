import type {InjectionKey, Reactive} from 'vue'
import {inject, reactive} from 'vue'
import type {Post} from '@/logic/models'

/**
 * All user-visible strings in tg-blog. Interpolated messages are functions so
 * consumers aren't locked into any i18n library's placeholder syntax.
 */
export interface TgBlogMessages {
    /** Search input placeholder */
    searchPlaceholder: string
    /** Error card heading, followed by the posts URL */
    loadFailed: string
    /** Header above forwarded posts */
    forwardedFrom: string
    /** Header above reply context */
    replyTo: string
    /** Fallback title for voice messages without metadata */
    voiceMessage: string
    /** Share button tooltip (idle) */
    copyShareLink: string
    /** Share button tooltip (after click) */
    linkCopied: string
    /** Poll subtitle, non-anonymous regular poll */
    poll: string
    /** Poll subtitle, quiz type */
    quiz: string
    /** Prepended to poll/quiz when anonymous (include trailing separator if wanted) */
    anonymousPrefix: string
    /** Poll footer with total response count */
    pollResults: (count: number) => string
    /** Image viewer position label, 1-based index of total */
    photoIndex: (index: number, total: number) => string
    /** moment.js format string for post timestamps */
    dateFormat: string

    // --- Interactive mode: Reactions ---
    /** Tooltip / aria-label for the add-reaction button */
    addReaction: string

    // --- Interactive mode: Polls ---
    /** Submit button for multiple-choice polls */
    pollVote: string
    /** Action label to retract a regular poll vote */
    pollRetractVote: string
    /** Subtitle suffix when a poll is closed */
    pollClosed: string
    /** Label above quiz explanation callout */
    pollExplanation: string
    /** Hint shown on multiple-choice polls */
    pollMultipleChoice: string

    // --- Interactive mode: Comments ---
    /** Label for opening comments when count is 0 */
    reply: string
    /** Formatted comment count button label */
    commentsCount: (count: number) => string
    /** Empty state inside comment thread */
    noComments: string
    /** Loading state inside comment thread */
    loadingComments: string
    /** Error state when comments fail to load */
    commentsLoadFailed: string
    /** Generic retry button label */
    retry: string
    /** Comment composer placeholder */
    writeCommentPlaceholder: string
    /** Indicator when replying to a specific comment author */
    replyingTo: (name: string) => string
    /** Cancel reply target button */
    cancelReply: string
    /** Submit comment button */
    postComment: string
    /** Submit comment button while submitting */
    postingComment: string
    /** Delete comment button */
    deleteComment: string
    /** Second-click delete confirmation label */
    confirmDelete: string
    /** Tombstone placeholder for soft-deleted comments with replies */
    commentDeleted: string
    /** Prompt when anonymous comments are disabled and user is signed out */
    signInToComment: string
    /** Sign in button */
    signIn: string
    /** Sign out button */
    signOut: string
    /** Toggle to post anonymously */
    commentAsAnonymous: string
    /** Indicator shown when posting anonymously */
    commentingAnonymously: string
    /** Tooltip/label when reply email notifications are enabled */
    notifyRepliesOn: string
    /** Tooltip/label when reply email notifications are disabled */
    notifyRepliesOff: string

    // --- Interactive mode: Badges ---
    badgeOwner: string
    badgeVerified: string
    badgeTelegram: string
    badgeAnonymous: string

    // --- Interactive mode: ALTCHA PoW ---
    altchaPrompt: string
    altchaVerifying: string
    altchaVerified: string
    altchaError: string

    // --- Interactive mode: Auth Modal ---
    authTitle: string
    authSubtitle: string
    authContinueWithGithub: string
    authContinueWithGoogle: string
    authContinueWithTelegram: string
    authContinueWithOidc: (providerName: string) => string
    authOrEmail: string
    authEmailPlaceholder: string
    authDisplayNamePlaceholder: string
    authSendMagicLink: string
    authSendingMagicLink: string
    authMagicLinkSent: (email: string) => string
    authClose: string

    // --- Original Photo Viewer ---
    viewOriginal: string
    viewOriginalWithSize: (size: string) => string
    loadingOriginal: string
    viewingOriginal: string

    // --- Interactive mode v3: Rich Media & Composer ---
    mediaPhoto: string
    mediaSticker: string
    mediaAnimation: string
    mediaVideo: string
    mediaDocument: string
    attachPhoto: string
    emojiAndStickers: string
    emojiTab: string
    stickersTab: string
    siteCustomEmojis: string
    standardEmojis: string
    searchEmojisPlaceholder: string
    noStickersFound: string
    backspace: string
    sendPhoto: string
    sendingPhoto: string
    captionPlaceholder: string
    uploadFailed: string
    formatBold: string
    formatItalic: string
    formatUnderline: string
    formatStrikethrough: string
    formatMonospace: string
    formatSpoiler: string
    formatBlockquote: string
    formatLink: string
    formatClear: string
    formatLinkPlaceholder: string
    formatToolbarLabel: string
    cancel: string
    apply: string
    pendingReviewBadge: string
    composerSettings: string
    userInfoClose: string
    reviewQueueBtn: string
    reviewModalTitle: string
    reviewTabPending: string
    reviewTabWhitelist: string
    reviewApprove: string
    reviewApproveWhitelist: string
    reviewReject: string
    reviewWhitelistRemove: string
    reviewEmpty: string
    reviewWhitelistEmpty: string
    reviewOpenPost: (postId: number) => string
}

/** English defaults matching tg-blog's historical literals. */
export const defaultMessages: TgBlogMessages = {
    searchPlaceholder: 'Search...',
    loadFailed: 'Failed loading posts from:',
    forwardedFrom: 'Forwarded from:',
    replyTo: 'Reply to:',
    voiceMessage: 'Voice Message',
    copyShareLink: 'Copy share link',
    linkCopied: 'Link copied!',
    poll: 'Poll',
    quiz: 'Quiz',
    anonymousPrefix: 'Anon ',
    pollResults: (count) => `Final Results - ${count} Responses`,
    photoIndex: (index, total) => `Photo ${index} of ${total}`,
    dateFormat: 'YYYY-MM-DD H:mm',

    // Reactions
    addReaction: 'Add reaction',

    // Polls
    pollVote: 'Submit Vote',
    pollRetractVote: 'Retract vote',
    pollClosed: 'Closed',
    pollExplanation: 'Explanation',
    pollMultipleChoice: 'Select one or more options',

    // Comments
    reply: 'Reply',
    commentsCount: (count) => `${count}`,
    noComments: 'No comments yet. Start the conversation!',
    loadingComments: 'Loading comments...',
    commentsLoadFailed: 'Failed to load comments.',
    retry: 'Retry',
    writeCommentPlaceholder: 'Write a reply...',
    replyingTo: (name) => `Replying to @${name}`,
    cancelReply: 'Cancel',
    postComment: 'Send',
    postingComment: 'Sending...',
    deleteComment: 'Delete',
    confirmDelete: 'Confirm?',
    commentDeleted: '[deleted]',
    signInToComment: 'Sign in to join the conversation.',
    signIn: 'Sign in',
    signOut: 'Sign out',
    commentAsAnonymous: 'Post anonymously',
    commentingAnonymously: 'Commenting anonymously',
    notifyRepliesOn: 'Reply emails: On',
    notifyRepliesOff: 'Reply emails: Off',

    // Badges
    badgeOwner: 'Owner',
    badgeVerified: 'Verified',
    badgeTelegram: 'Telegram',
    badgeAnonymous: 'Unverified',

    // ALTCHA
    altchaPrompt: "Verify I'm human",
    altchaVerifying: 'Verifying...',
    altchaVerified: 'Verified',
    altchaError: 'Verification failed, click to retry',

    // Auth Modal
    authTitle: 'Sign in',
    authSubtitle: 'Sign in to comment with a verified badge and get reply notifications.',
    authContinueWithGithub: 'Continue with GitHub',
    authContinueWithGoogle: 'Continue with Google',
    authContinueWithTelegram: 'Continue with Telegram',
    authContinueWithOidc: (providerName) => `Continue with ${providerName}`,
    authOrEmail: 'or sign in with email',
    authEmailPlaceholder: 'you@example.com',
    authDisplayNamePlaceholder: 'Display name (optional)',
    authSendMagicLink: 'Send magic link',
    authSendingMagicLink: 'Sending...',
    authMagicLinkSent: (email) => `Magic link sent to ${email}. Check your inbox to finish signing in!`,
    authClose: 'Close',

    // Original Photo Viewer
    viewOriginal: 'View Original',
    viewOriginalWithSize: (size) => `View Original (${size})`,
    loadingOriginal: 'Loading original...',
    viewingOriginal: 'Viewing Original',

    // Interactive mode v3: Rich Media & Composer
    mediaPhoto: '[Photo]',
    mediaSticker: '[Sticker]',
    mediaAnimation: '[GIF]',
    mediaVideo: '[Video]',
    mediaDocument: '[File]',
    attachPhoto: 'Attach photo',
    emojiAndStickers: 'Emoji & Stickers',
    emojiTab: 'Emoji',
    stickersTab: 'Stickers',
    siteCustomEmojis: 'Custom Emojis',
    standardEmojis: 'Emojis',
    searchEmojisPlaceholder: 'Search emojis...',
    noStickersFound: 'No stickers available',
    backspace: 'Delete',
    pendingReviewBadge: 'Pending review',
    composerSettings: 'Settings',
    userInfoClose: 'Close user info',
    reviewQueueBtn: 'Review Queue',
    reviewModalTitle: 'Moderation Review',
    reviewTabPending: 'Pending',
    reviewTabWhitelist: 'Whitelisted Senders',
    reviewApprove: 'Approve',
    reviewApproveWhitelist: 'Approve & Whitelist Sender',
    reviewReject: 'Reject & Delete',
    reviewWhitelistRemove: 'Remove',
    reviewEmpty: 'No comments awaiting review.',
    reviewWhitelistEmpty: 'No whitelisted senders yet.',
    reviewOpenPost: (postId) => `Post #${postId}`,
    sendPhoto: 'Send Photo',
    sendingPhoto: 'Sending...',
    captionPlaceholder: 'Add a caption...',
    uploadFailed: 'Failed to upload image',
    formatBold: 'Bold',
    formatItalic: 'Italic',
    formatUnderline: 'Underline',
    formatStrikethrough: 'Strikethrough',
    formatMonospace: 'Monospace',
    formatSpoiler: 'Spoiler',
    formatBlockquote: 'Quote',
    formatLink: 'Add link',
    formatClear: 'Clear formatting',
    formatLinkPlaceholder: 'Enter URL...',
    formatToolbarLabel: 'Text formatting',
    cancel: 'Cancel',
    apply: 'Apply',
}

/** Simplified Chinese (zh-CN) preset matching all tg-blog UI strings. */
export const zhCnMessages: TgBlogMessages = {
    searchPlaceholder: '搜索...',
    loadFailed: '加载文章失败：',
    forwardedFrom: '转发自：',
    replyTo: '回复：',
    voiceMessage: '语音消息',
    copyShareLink: '复制分享链接',
    linkCopied: '链接已复制！',
    poll: '投票',
    quiz: '测验',
    anonymousPrefix: '匿名',
    pollResults: (count) => `最终结果 - 共 ${count} 票`,
    photoIndex: (index, total) => `第 ${index} 张，共 ${total} 张`,
    dateFormat: 'YYYY-MM-DD H:mm',

    // Reactions
    addReaction: '添加回应',

    // Polls
    pollVote: '提交投票',
    pollRetractVote: '撤回投票',
    pollClosed: '已结束',
    pollExplanation: '解析',
    pollMultipleChoice: '可选择多个选项',

    // Comments
    reply: '回复',
    commentsCount: (count) => `${count}`,
    noComments: '还没有评论，来聊聊吧！',
    loadingComments: '加载评论中...',
    commentsLoadFailed: '加载评论失败。',
    retry: '重试',
    writeCommentPlaceholder: '写下你的回复...',
    replyingTo: (name) => `正在回复 @${name}`,
    cancelReply: '取消',
    postComment: '发送',
    postingComment: '发送中...',
    deleteComment: '删除',
    confirmDelete: '确认删除？',
    commentDeleted: '[已删除]',
    signInToComment: '登录后即可参与讨论。',
    signIn: '登录',
    signOut: '退出登录',
    commentAsAnonymous: '匿名发表',
    commentingAnonymously: '当前将以匿名身份发表',
    notifyRepliesOn: '回复邮件通知：开',
    notifyRepliesOff: '回复邮件通知：关',

    // Badges
    badgeOwner: '站长',
    badgeVerified: '已认证',
    badgeTelegram: 'Telegram',
    badgeAnonymous: '未认证',

    // ALTCHA
    altchaPrompt: '人机验证',
    altchaVerifying: '验证中...',
    altchaVerified: '已验证',
    altchaError: '验证失败，点击重试',

    // Auth Modal
    authTitle: '登录',
    authSubtitle: '登录后可获得认证徽章并接收回复邮件通知。',
    authContinueWithGithub: '使用 GitHub 继续',
    authContinueWithGoogle: '使用 Google 继续',
    authContinueWithTelegram: '使用 Telegram 继续',
    authContinueWithOidc: (providerName) => `使用 ${providerName} 继续`,
    authOrEmail: '或使用邮箱登录',
    authEmailPlaceholder: 'you@example.com',
    authDisplayNamePlaceholder: '昵称（可选）',
    authSendMagicLink: '发送登录链接',
    authSendingMagicLink: '发送中...',
    authMagicLinkSent: (email) => `登录链接已发送至 ${email}，请查收邮件完成登录！`,
    authClose: '关闭',

    // Original Photo Viewer
    viewOriginal: '查看原图',
    viewOriginalWithSize: (size) => `查看原图 (${size})`,
    loadingOriginal: '加载原图中...',
    viewingOriginal: '正在查看原图',

    // Interactive mode v3: Rich Media & Composer
    mediaPhoto: '[图片]',
    mediaSticker: '[贴纸]',
    mediaAnimation: '[动图]',
    mediaVideo: '[视频]',
    mediaDocument: '[文件]',
    attachPhoto: '添加图片',
    emojiAndStickers: '表情与贴纸',
    emojiTab: '表情',
    stickersTab: '贴纸',
    siteCustomEmojis: '自定义表情',
    standardEmojis: '表情符号',
    searchEmojisPlaceholder: '搜索表情...',
    noStickersFound: '暂无贴纸',
    backspace: '删除',
    pendingReviewBadge: '待审核',
    reviewQueueBtn: '审核队列',
    reviewModalTitle: '评论审核',
    reviewTabPending: '待审核',
    reviewTabWhitelist: '白名单发送者',
    reviewApprove: '通过',
    reviewApproveWhitelist: '通过并加入白名单',
    reviewReject: '拒绝并删除',
    reviewWhitelistRemove: '移除',
    reviewEmpty: '暂无待审核评论。',
    reviewWhitelistEmpty: '暂无白名单发送者。',
    reviewOpenPost: (postId) => `动态 #${postId}`,
    sendPhoto: '发送图片',
    sendingPhoto: '发送中...',
    captionPlaceholder: '添加说明文字...',
    uploadFailed: '图片上传失败',
    formatBold: '加粗',
    formatItalic: '斜体',
    formatUnderline: '下划线',
    formatStrikethrough: '删除线',
    formatMonospace: '等宽代码',
    formatSpoiler: '剧透隐藏',
    formatBlockquote: '引用',
    formatLink: '添加链接',
    formatClear: '清除格式',
    formatLinkPlaceholder: '输入链接地址...',
    formatToolbarLabel: '文本格式',
    cancel: '取消',
    apply: '确定',
    composerSettings: '设置',
    userInfoClose: '关闭用户信息',
}

export const tgbMessagesKey: InjectionKey<Reactive<TgBlogMessages>> = Symbol('tgb-messages')

/** Merge consumer overrides over the English defaults. Reactive so a consumer switching languages live-updates. */
export function createMessages(overrides?: Partial<TgBlogMessages>): Reactive<TgBlogMessages> {
    return reactive({...defaultMessages, ...overrides})
}

/** For child components; falls back to English defaults when used outside <TgBlog>. */
export function useTgbMessages(): TgBlogMessages {
    return inject(tgbMessagesKey, defaultMessages)
}

/**
 * Per-post content translations keyed by post id. Partial: override only the
 * fields that differ (typically just `text`); media, author, dates stay canonical.
 */
export type TgBlogTranslations = Record<number, Partial<Post>>

/** Merge translations over canonical posts. Untranslated posts pass through unchanged. */
export function applyTranslations(posts: Post[], translations?: TgBlogTranslations): Post[] {
    if (!translations) return posts
    return posts.map(p => {
        const t = translations[p.id]
        return t ? {...p, ...t, id: p.id} : p
    })
}
