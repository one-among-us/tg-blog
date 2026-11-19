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
    anonymousPrefix: 'Anonymous ',
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
