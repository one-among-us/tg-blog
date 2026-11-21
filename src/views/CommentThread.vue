<template>
    <div v-if="ctx && activeApi" ref="chatZoneEl" class="chat-zone" @click.stop>
        <!-- Loading / Error / Empty states -->
        <div v-if="loading" class="thread-status">{{ msg.loadingComments }}</div>
        <div v-else-if="loadError" class="thread-status error">
            <span>{{ msg.commentsLoadFailed }}</span>
            <button type="button" class="link-btn" @click="fetchComments">{{ msg.retry }}</button>
        </div>

        <!-- Flat chronological Telegram Web A chat bubbles -->
        <div v-else-if="chatMessages.length > 0" ref="chatListEl" class="chat-list">
            <div v-for="item in chatMessages"
                 :key="item.comment.id"
                 :id="`comment-${item.comment.id}`"
                 class="Message"
                 :class="{
                     own: item.isOwn,
                     'first-in-group': item.firstInGroup,
                     'last-in-group': item.lastInGroup,
                     'is-deleted': item.comment.deleted,
                     'is-highlighted': highlightedId === item.comment.id,
                     'selector-open': reactionTarget?.id === item.comment.id
                 }">
                <!-- Tombstone for soft-deleted comment with live replies -->
                <template v-if="item.comment.deleted">
                    <div class="tombstone-bubble">{{ msg.commentDeleted }}</div>
                </template>

                <template v-else>
                    <!-- Incoming 32px circular avatar pinned bottom-left on lastInGroup -->
                    <div v-if="!item.isOwn" class="avatar-slot">
                        <template v-if="item.lastInGroup">
                            <img v-if="commentAvatarUrl(item.comment)"
                                 :src="commentAvatarUrl(item.comment)!"
                                 referrerpolicy="no-referrer"
                                 class="bubble-avatar"
                                 :class="avatarClass(item.comment)"
                                 :style="avatarRingStyle(item.comment)"
                                 alt="" loading="lazy" />
                            <span v-else class="bubble-avatar avatar-fallback"
                                  :class="avatarClass(item.comment)"
                                  :style="avatarFallbackStyle(item.comment)">
                                {{ avatarInitial(displayAuthorName(item.comment)) }}
                            </span>
                        </template>
                    </div>

                    <!-- Bubble content + exact Telegram Web A SVG appendix -->
                    <div class="message-content-wrapper"
                         :class="{ 'is-swiping': swipeState?.id === item.comment.id && swipeState.locked === 'h' }"
                         :style="swipeWrapperStyle(item.comment.id)">
                        <div class="message-content has-solid-background"
                             :class="{
                                 'has-appendix': item.lastInGroup && !isStickerOnlyBubble(item),
                                 'is-sticker-only': isStickerOnlyBubble(item)
                             }"
                             @dblclick="canCompose && startReply(item.comment)"
                             @click.capture="onBubbleClickCapture"
                             @contextmenu="onBubbleContextMenu(item.comment, $event)"
                             @pointerdown="onBubblePointerDown(item.comment, $event)">
                            <div class="bubble-media-group"
                                 :class="{
                                     'sticker-card': isStickerCard(item),
                                     'sticker-solo': isStickerOnlyBubble(item) && !isStickerCard(item)
                                 }">
                            <!-- Header row on incoming firstInGroup: sender + badge -->
                            <div v-if="item.firstInGroup && !item.isOwn"
                                 class="message-title">
                                <span class="sender-title" :style="{ color: senderColor(item.comment) }">
                                    {{ displayAuthorName(item.comment) }}
                                </span>
                                <span v-if="item.comment.author.role === 'owner'" class="badge badge-owner">
                                    {{ msg.badgeOwner }}
                                </span>
                                <span v-if="isTelegramSynced(item.comment)" class="badge badge-telegram"
                                      :title="msg.badgeTelegram">
                                    <svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                    </svg>
                                </span>
                                <span v-else-if="item.comment.author.verified" class="badge badge-verified"
                                      :title="providerLabel(item.comment.author.provider)">
                                    <svg v-if="item.comment.author.provider === 'github'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.05a9.38 9.38 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/>
                                    </svg>
                                    <svg v-else-if="item.comment.author.provider === 'google'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.7-5.4 3.7-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/>
                                    </svg>
                                    <svg v-else-if="item.comment.author.provider === 'telegram'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                    </svg>
                                    <svg v-else class="badge-svg" viewBox="0 0 16 16" aria-hidden="true">
                                        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5l3.2 3.2L13 4.8"/>
                                    </svg>
                                </span>
                                <span v-else class="badge badge-anon">
                                    {{ msg.badgeAnonymous }}
                                </span>
                            </div>

                            <!-- Inline Telegram Web A reply quote bar (with optional media thumbnail) -->
                            <button v-if="item.parentComment"
                                    type="button"
                                    class="inline-reply-quote clickable"
                                    @click="jumpToComment(item.parentComment.id)">
                                <div class="inline-reply-row">
                                    <template v-if="!item.parentComment.deleted && item.parentComment.media">
                                        <img v-if="replyThumbUrl(item.parentComment.media)"
                                             :src="replyThumbUrl(item.parentComment.media)!"
                                             class="quote-thumb"
                                             alt=""
                                             loading="lazy" />
                                        <span v-else class="quote-thumb-badge" aria-hidden="true">
                                            {{ replyThumbBadge(item.parentComment.media) }}
                                        </span>
                                    </template>
                                    <div class="quote-meta">
                                        <div class="quote-author">
                                            {{ item.parentComment.deleted ? msg.commentDeleted : displayAuthorName(item.parentComment) }}
                                        </div>
                                        <div class="quote-snippet" v-if="!item.parentComment.deleted" v-html="quoteSnippetHtml(item.parentComment)"></div>
                                    </div>
                                </div>
                            </button>

                            <!-- Rich Comment Media (photo, sticker, animation, document) -->
                            <template v-if="item.comment.media && safeMediaSrc(item.comment.media.url)">
                                <!-- Photo -->
                                <div v-if="item.comment.media.media_type === 'photo'"
                                     class="comment-media comment-media-photo"
                                     :class="{ 'has-caption': commentHasBody(item.comment) }">
                                    <img :src="safeMediaSrc(item.comment.media.thumb || item.comment.media.url)"
                                         :alt="item.comment.body_text || msg.mediaPhoto"
                                         class="clickable"
                                         loading="lazy"
                                         @click.stop="openCommentPhoto(item.comment)" />
                                    <span v-if="!commentHasBody(item.comment) && (item.comment.reactions?.length ?? 0) === 0"
                                          class="message-timestamp media-pill"
                                          :title="formatFullDate(item.comment.created_at)">
                                        <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                        <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                    </span>
                                </div>

                                <!-- Sticker (.webp / .png / .tgs / .webm) -->
                                <div v-else-if="item.comment.media.media_type === 'sticker'"
                                     class="comment-media comment-media-sticker">
                                    <StickerMedia :url="safeMediaSrc(item.comment.media.url)"
                                                  :thumb="safeMediaSrc(item.comment.media.thumb)"
                                                  :emoji="item.comment.media.emoji"
                                                  :is-animated="item.comment.media.is_animated"
                                                  :is-video="item.comment.media.is_video" />
                                    <span v-if="!commentHasBody(item.comment) && (item.comment.reactions?.length ?? 0) === 0"
                                          class="message-timestamp media-pill"
                                          :title="formatFullDate(item.comment.created_at)">
                                        <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                        <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                    </span>
                                </div>

                                <!-- Animation / GIF -->
                                <div v-else-if="item.comment.media.media_type === 'animation'"
                                     class="comment-media comment-media-animation"
                                     :class="{ 'has-caption': commentHasBody(item.comment) }">
                                    <img v-if="isGifMedia(item.comment.media.url)"
                                         :src="safeMediaSrc(item.comment.media.url)"
                                         alt="GIF"
                                         loading="lazy" />
                                    <video v-else
                                           :src="safeMediaSrc(item.comment.media.url)"
                                           :poster="safeMediaSrc(item.comment.media.thumb) || undefined"
                                           preload="metadata"
                                           autoplay
                                           loop
                                           muted
                                           playsinline
                                           disablepictureinpicture />
                                    <span v-if="!commentHasBody(item.comment) && (item.comment.reactions?.length ?? 0) === 0"
                                          class="message-timestamp media-pill"
                                          :title="formatFullDate(item.comment.created_at)">
                                        <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                        <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                    </span>
                                </div>

                                <!-- Video -->
                                <div v-else-if="item.comment.media.media_type === 'video'"
                                     class="comment-media comment-media-video"
                                     :class="{ 'has-caption': commentHasBody(item.comment) }">
                                    <video :src="safeMediaSrc(item.comment.media.url)"
                                           :poster="safeMediaSrc(item.comment.media.thumb) || undefined"
                                           controls
                                           preload="metadata"
                                           playsinline />
                                    <span v-if="!commentHasBody(item.comment) && (item.comment.reactions?.length ?? 0) === 0"
                                          class="message-timestamp media-pill"
                                          :title="formatFullDate(item.comment.created_at)">
                                        <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                        <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                    </span>
                                </div>

                                <!-- Document / Downloadable file -->
                                <a v-else
                                   class="comment-media-doc"
                                   :href="safeMediaSrc(item.comment.media.url)"
                                   :download="item.comment.media.file_name || ''"
                                   target="_blank"
                                   rel="noopener noreferrer">
                                    <span class="doc-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                        </svg>
                                    </span>
                                    <span class="doc-info">
                                        <span class="doc-name">{{ item.comment.media.file_name || msg.mediaDocument }}</span>
                                        <span v-if="item.comment.media.size" class="doc-size">{{ sizeFmt(item.comment.media.size) }}</span>
                                    </span>
                                </a>
                            </template>
                            </div>

                            <!-- Message text (+ inline bottom-right timestamp when there are no reactions) -->
                            <div v-if="commentHasBody(item.comment) || !item.comment.media || (item.comment.media.media_type === 'document' && (item.comment.reactions?.length ?? 0) === 0)"
                                 class="text-content">
                                <span v-if="commentHasBody(item.comment)" class="comment-body" v-html="renderBody(item.comment)"></span>
                                <span v-if="item.comment.moderation_status === 'pending'" class="badge badge-pending-review">
                                    {{ msg.pendingReviewBadge }}
                                </span>
                                <span v-if="(item.comment.reactions?.length ?? 0) === 0"
                                      class="message-timestamp in-text"
                                      :title="formatFullDate(item.comment.created_at)">
                                    <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                    <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                </span>
                            </div>

                            <!-- Comment reaction pills (+ bottom-right timestamp when reactions exist) -->
                            <div v-if="(item.comment.reactions?.length ?? 0) > 0"
                                 class="comment-reactions"
                                 @dblclick.stop>
                                <button v-for="r in item.comment.reactions"
                                        :key="r.reaction_key"
                                        type="button"
                                        class="comment-reaction-btn"
                                        :class="{ chosen: r.reacted }"
                                        @click.stop="onToggleCommentReaction(item.comment, r)">
                                    <CustomEmoji v-if="r.custom_emoji_id"
                                                 :id="r.custom_emoji_id"
                                                 :src="customEmojiSrc(r.custom_emoji_id)"
                                                 :alt="mergedCustomEmojiAlts[r.custom_emoji_id] ?? r.emoji"
                                                 :posts-url="resolvedPostsUrl" />
                                    <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="reaction-emoji" />
                                    <span class="reaction-count" v-if="r.count">{{ r.count }}</span>
                                </button>
                                <span class="message-timestamp in-reactions"
                                      :title="formatFullDate(item.comment.created_at)">
                                    <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                    <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                </span>
                            </div>

                            <!-- Exact Telegram Web A MessageAppendix SVG tail -->
                            <svg v-if="item.lastInGroup && !isStickerOnlyBubble(item)" width="9" height="20" viewBox="0 0 9 20" class="svg-appendix" aria-hidden="true">
                                <path v-if="item.isOwn"
                                      d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 016 17z"
                                      class="corner" />
                                <path v-else
                                      d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
                                      class="corner" />
                            </svg>
                        </div>

                        <!-- Desktop hover quick actions beside the bubble (react removed: desktop uses right-click, mobile uses long-press) -->
                        <div class="bubble-actions" @dblclick.stop>
                            <button v-if="canCompose" type="button" class="bubble-act-btn reply-btn"
                                    :title="msg.reply" :aria-label="msg.reply"
                                    @click="startReply(item.comment)">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                                </svg>
                            </button>
                            <button v-if="item.comment.can_delete || me?.role === 'owner'" type="button"
                                    class="bubble-act-btn danger"
                                    :class="{ confirming: confirmDeleteId === item.comment.id }"
                                    :disabled="deletingId === item.comment.id"
                                    :title="confirmDeleteId === item.comment.id ? msg.confirmDelete : msg.deleteComment"
                                    @click="handleDeleteClick(item.comment)">
                                <span v-if="confirmDeleteId === item.comment.id" class="confirm-text">{{ msg.confirmDelete }}</span>
                                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Touch slide-to-reply indicator pinned along the right margin -->
                    <div v-if="canCompose"
                         class="swipe-reply-hint"
                         :class="{
                             visible: swipeState?.id === item.comment.id && swipeState.locked === 'h' && swipeState.offset < -6,
                             ready: swipeState?.id === item.comment.id && swipeState.locked === 'h' && -swipeState.offset >= SWIPE_REPLY_THRESHOLD
                         }"
                         :style="swipeHintStyle(item.comment.id)"
                         aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                        </svg>
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="thread-status empty">{{ msg.noComments }}</div>

        <!-- Composer (one-among-us/web embedded send button + compact auth strip) -->
        <div class="composer">
            <div class="composer-bar" :class="{ 'has-composer': canCompose, 'menu-open': composerSettingsOpen }">
                <div class="composer-auth-row">
                    <template v-if="me && !isPostingAnon">
                        <div class="composer-avatar signed-in" :title="me.display_name">
                            <img v-if="safeAvatar(me.avatar_url)"
                                 :src="safeAvatar(me.avatar_url)!"
                                 referrerpolicy="no-referrer"
                                 class="composer-avatar-img"
                                 alt="" />
                            <span v-else class="composer-avatar-fallback" :style="meFallbackStyle">
                                {{ avatarInitial(me.display_name) }}
                            </span>
                        </div>
                        <span class="composer-author-name">{{ me.display_name }}</span>
                    </template>
                    <template v-else-if="me">
                        <div class="composer-avatar"
                             :class="{ 'anon-ringed': !!activeAnonTag }"
                             :style="activeAnonRingStyle"
                             :title="activeAnonLabel">
                            <img v-if="activeAnonIdentity?.avatarUrl"
                                 :src="activeAnonIdentity.avatarUrl"
                                 class="composer-avatar-img"
                                 alt="" />
                            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <span class="composer-author-name anon">{{ activeAnonLabel }}</span>
                    </template>
                    <template v-else>
                        <button type="button"
                                class="composer-avatar"
                                :class="{ 'anon-ringed': !!activeAnonTag }"
                                :style="activeAnonRingStyle"
                                :title="msg.signIn"
                                :aria-label="`${activeAnonLabel} - ${msg.signIn}`"
                                @click="ctx.openAuthModal()">
                            <img v-if="activeAnonIdentity?.avatarUrl"
                                 :src="activeAnonIdentity.avatarUrl"
                                 class="composer-avatar-img"
                                 alt="" />
                            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </button>
                        <span v-if="activeAnonTag" class="composer-author-name anon">{{ activeAnonTag }}</span>
                    </template>
                </div>

                <div class="composer-meta-row">
                    <div v-if="me" class="composer-settings-wrap">
                        <button ref="settingsTriggerEl"
                                type="button"
                                class="signin-btn composer-settings-btn"
                                :class="{ open: composerSettingsOpen }"
                                :aria-expanded="composerSettingsOpen"
                                aria-haspopup="menu"
                                @click.stop="toggleComposerSettings">
                            <svg class="settings-gear-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/>
                            </svg>
                            <span>{{ msg.composerSettings }}</span>
                        </button>
                        <div v-if="composerSettingsOpen"
                             ref="settingsMenuEl"
                             class="composer-settings-menu"
                             role="menu"
                             @click.stop>
                            <button v-if="me.email_verified"
                                    type="button"
                                    class="settings-menu-item"
                                    role="menuitemcheckbox"
                                    :aria-checked="me.notify_replies"
                                    :disabled="togglingNotify"
                                    @click="toggleNotify">
                                <span class="settings-item-label">{{ me.notify_replies ? msg.notifyRepliesOn : msg.notifyRepliesOff }}</span>
                                <span class="settings-switch" :class="{ on: me.notify_replies }" aria-hidden="true"></span>
                            </button>
                            <button v-if="allowAnon"
                                    type="button"
                                    class="settings-menu-item"
                                    role="menuitemcheckbox"
                                    :aria-checked="asAnonymous"
                                    @click="asAnonymous = !asAnonymous">
                                <span class="settings-item-label">{{ msg.commentAsAnonymous }}</span>
                                <span class="settings-switch" :class="{ on: asAnonymous }" aria-hidden="true"></span>
                            </button>
                            <div v-if="me.email_verified || allowAnon" class="settings-menu-divider"></div>
                            <button type="button"
                                    class="settings-menu-item danger"
                                    role="menuitem"
                                    @click="handleLogout">
                                <span class="settings-item-label">{{ msg.signOut }}</span>
                            </button>
                        </div>
                    </div>
                    <template v-else>
                        <span v-if="allowAnon" class="guest-hint">{{ msg.commentingAnonymously }}</span>
                        <span v-else class="guest-hint">{{ msg.signInToComment }}</span>
                        <button type="button" class="signin-btn" @click="ctx.openAuthModal()">
                            {{ msg.signIn }}
                        </button>
                    </template>
                </div>
            </div>

            <div v-if="canCompose" class="composer-box">
                <div v-if="replyTarget" class="reply-banner">
                    <div class="reply-banner-content">
                        <span class="reply-banner-title">{{ msg.replyingTo(displayAuthorName(replyTarget)) }}</span>
                        <span class="reply-banner-snippet" v-html="quoteSnippetHtml(replyTarget)"></span>
                    </div>
                    <button type="button" class="cancel-reply-btn" @click="replyTarget = null" :aria-label="msg.cancelReply">
                        ✕
                    </button>
                </div>

                <!-- Web A Rich Composer inside #add-comment -->
                <div id="add-comment" class="add-comment">
                    <button ref="smileyBtnEl"
                            type="button"
                            class="composer-smiley-btn"
                            :class="{ active: symbolMenuOpen }"
                            :title="msg.emojiAndStickers"
                            :aria-label="msg.emojiAndStickers"
                            :disabled="submitting"
                            @mousedown.prevent
                            @click="toggleSymbolMenu">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                        </svg>
                    </button>

                    <RichCommentInput ref="richInputRef"
                                      v-model="draft"
                                      class="composer-rich-input"
                                      :placeholder="msg.writeCommentPlaceholder"
                                      :aria-label="msg.writeCommentPlaceholder"
                                      :readonly="submitting"
                                      :max-length="4000"
                                      :custom-emoji-urls="mergedCustomEmojiUrls"
                                      :custom-emoji-alts="mergedCustomEmojiAlts"
                                      :epoch-emoji-base="epochEmojiBase"
                                      :posts-url="resolvedPostsUrl"
                                      @text-length="n => draftTextLength = n"
                                      @submit="submitComment"
                                      @files="onComposerFiles" />

                    <input ref="fileInputEl"
                           type="file"
                           accept="image/*"
                           style="display: none"
                           @change="onFileInputChange" />

                    <div id="send-comment-btn" class="send-comment-btn">
                        <button type="button"
                                class="attach-btn"
                                :title="msg.attachPhoto"
                                :aria-label="msg.attachPhoto"
                                :disabled="submitting"
                                @click="openFilePicker">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                            </svg>
                        </button>
                        <template v-if="draft.trim().length > 0 || submitting">
                            <span class="char-count unselectable">{{ draftCharCount }}</span>
                            <button type="button"
                                    class="unstyled-button"
                                    :disabled="!canSubmit"
                                    :aria-label="msg.postComment"
                                    @click="submitComment">
                                <span v-if="submitting" class="send-spinner" aria-hidden="true"></span>
                                <i-fas-paper-plane v-else class="icon" />
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Manual ALTCHA fallback ONLY shown if automatic inline PoW failed -->
                <AltchaWidget v-if="needsAltcha && showManualAltcha"
                              ref="altchaRef"
                              :api="activeApi"
                              v-model="altchaPayload" />

                <div v-if="submitError" class="composer-error">{{ submitError }}</div>
            </div>
        </div>

        <SymbolMenu :open="symbolMenuOpen"
                    :posts-url="resolvedPostsUrl"
                    :anchor-rect="symbolAnchorRect"
                    :anchor-el="smileyBtnEl"
                    @select-emoji="onSelectEmoji"
                    @select-custom-emoji="onSelectCustomEmoji"
                    @select-sticker="onSelectSticker"
                    @backspace="onSymbolBackspace"
                    @close="symbolMenuOpen = false" />

        <AttachmentModal :open="attachModalOpen"
                         :file="pendingAttachFile"
                         :initial-caption="draft"
                         :sending="submitting"
                         :error="attachError"
                         :custom-emoji-urls="mergedCustomEmojiUrls"
                         :custom-emoji-alts="mergedCustomEmojiAlts"
                         :epoch-emoji-base="epochEmojiBase"
                         :posts-url="resolvedPostsUrl"
                         @close="closeAttachModal"
                         @send="onSendAttachment" />

        <ImageViewer v-if="!ctx?.openMediaViewer" :imgs="localViewerImgs" v-model:index="localViewerIdx" />

        <ReactionSelector :open="!!reactionTarget"
                          :reactions="availableCommentReactions"
                          :chosen-keys="chosenCommentReactionKeys"
                          :posts-url="resolvedPostsUrl"
                          :anchor="selectorAnchor"
                          @select="onSelectCommentReactionChoice"
                          @close="reactionTargetId = null" />
    </div>
</template>

<script lang="ts" setup>
import moment from 'moment'
import {computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, onUpdated, ref, watch} from 'vue'
import {
    CommentDTO,
    CommentMediaDTO,
    CustomEmojiAsset,
    MergedReaction,
    ReactionTogglePayload,
    StickerItem,
} from '@/logic/models'
import {solveAltchaChallenge} from '@/logic/altcha'
import {sanitizeCommentHtml, sanitizeCommentSnippetHtml} from '@/logic/api'
import {replaceTextEmojisWithApple, useAppleEmojiBaseUrl} from '@/logic/appleEmoji'
import {sizeFmt} from '@/logic/formatter'
import {
    buildAvailableReactions,
    canonicalReactionKey,
    isValidCustomEmojiId,
    ReactionChoice,
    resolveCustomEmojiBaseSrc,
} from '@/logic/reactions'
import {initSpoilers} from '@/logic/spoilers'
import {buildCustomEmojiCandidates, createCustomEmojiDomManager} from '@/logic/customEmojiDom'
import {
    applyCommentDeleteInList,
    applyOptimisticCommentReactionToggle,
    buildChatMessages,
    ChatBubbleItem,
    formatCommentShortDate,
    loadOwnCommentIds,
    mergeCommentReactionsInList,
    saveOwnCommentId,
    upsertCommentInList,
} from '@/logic/state'
import {useTgbInteractive} from '@/logic/interactive'
import {useTgbMessages} from '@/logic/messages'
import {normalizeAnonDisplayName, pickAnonIdentity} from '@/logic/anonAvatar'
import {resolveApiAssetUrl, sanitizeAvatarUrl} from '@/logic/url'
import AltchaWidget from '@/views/AltchaWidget.vue'
import AppleEmoji from '@/views/AppleEmoji.vue'
import CustomEmoji from '@/views/CustomEmoji.vue'
import type {ViewedImage} from '@/views/ImageViewer.vue'
import RichCommentInput from '@/views/RichCommentInput.vue'
import StickerMedia from '@/views/StickerMedia.vue'

const ReactionSelector = defineAsyncComponent(() => import('@/views/ReactionSelector.vue'))
const SymbolMenu = defineAsyncComponent(() => import('@/views/SymbolMenu.vue'))
const AttachmentModal = defineAsyncComponent(() => import('@/views/AttachmentModal.vue'))
const ImageViewer = defineAsyncComponent(() => import('@/views/ImageViewer.vue'))

const SENDER_PALETTE = [
    '#c8553d', '#2b8a6e', '#5a6fb8', '#a85d8e', '#b5742c', '#2c7da0', '#8d5b4c',
]

const msg = useTgbMessages()
const ctx = useTgbInteractive()
const appleEmojiBaseUrl = useAppleEmojiBaseUrl()

const props = defineProps<{
    postId: number
    postsUrl?: string
}>()

const chatZoneEl = ref<HTMLElement | null>(null)
const chatListEl = ref<HTMLElement | null>(null)
const comments = ref<CommentDTO[]>([])
const ownCommentIds = ref<Set<number>>(new Set())
const viewerAnonTag = ref<string | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

const draft = ref('')
const replyTarget = ref<CommentDTO | null>(null)
const asAnonymous = ref(false)
const altchaPayload = ref<string | null>(null)
const showManualAltcha = ref(false)
const altchaRef = ref<InstanceType<typeof AltchaWidget> | null>(null)
const richInputRef = ref<InstanceType<typeof RichCommentInput> | null>(null)
const smileyBtnEl = ref<HTMLElement | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const symbolMenuOpen = ref(false)
const symbolAnchorRect = ref<{ left: number; top: number; bottom: number; width: number } | null>(null)
const attachModalOpen = ref(false)
const pendingAttachFile = ref<File | null>(null)
const attachError = ref<string | null>(null)
const localViewerImgs = ref<ViewedImage[]>([])
const localViewerIdx = ref(-1)
const draftTextLength = ref(0)
const commentEmojiManager = createCustomEmojiDomManager()

const confirmDeleteId = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null
const deletingId = ref<number | null>(null)
const togglingNotify = ref(false)
const composerSettingsOpen = ref(false)
const settingsTriggerEl = ref<HTMLElement | null>(null)
const settingsMenuEl = ref<HTMLElement | null>(null)

const highlightedId = ref<number | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null
let autoAltchaController: AbortController | null = null

const reactionTargetId = ref<number | null>(null)
const selectorAnchor = ref({x: 0, y: 0})
const reactionSeqMap = new Map<number, number>()
const reactionInFlightMap = new Map<number, number>()

const channelCustomEmojis = computed(() => ctx?.channelCustomEmojis.value ?? {})
const mergedCustomEmojiUrls = computed(() => ctx?.allCustomEmojis.value ?? channelCustomEmojis.value)
const mergedCustomEmojiAlts = computed((): Record<string, string> => {
    const map: Record<string, string> = {}
    for (const ce of ctx?.customEmojiCatalog.value ?? []) {
        if (ce.id && ce.alt) {
            map[ce.id] = ce.alt
        }
    }
    return map
})
const epochEmojiBase = computed(() => ctx?.epochEmojiBase.value ?? null)
const resolvedPostsUrl = computed(() => props.postsUrl ?? '')
const draftCharCount = computed(() => draftTextLength.value || (draft.value.trim() ? draft.value.trim().length : 0))

const reactionTarget = computed(() => {
    if (reactionTargetId.value === null) return null
    const target = comments.value.find(c => c.id === reactionTargetId.value)
    return target && !target.deleted ? target : null
})

const availableCommentReactions = computed((): ReactionChoice[] =>
    buildAvailableReactions(
        reactionTarget.value?.reactions ?? [],
        channelCustomEmojis.value,
        resolvedPostsUrl.value,
        epochEmojiBase.value,
        ctx?.allowedReactions.value ?? null
    )
)

const chosenCommentReactionKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    for (const r of reactionTarget.value?.reactions ?? []) {
        if (!r.reacted) continue
        keys.add(r.reaction_key)
        const canon = canonicalReactionKey(r)
        if (canon) keys.add(canon)
    }
    return keys
})

function customEmojiSrc(id: string): string {
    return resolveCustomEmojiBaseSrc(id, mergedCustomEmojiUrls.value, resolvedPostsUrl.value, epochEmojiBase.value)
}

const activeApi = computed(() => ctx?.api.value ?? null)
const me = computed(() => ctx?.me.value ?? null)
const allowAnon = computed(() => ctx?.allowAnonComments.value ?? false)
const isPostingAnon = computed(() => !me.value || (allowAnon.value && asAnonymous.value))
const canCompose = computed(() => !!me.value || allowAnon.value)
const needsAltcha = computed(() => canCompose.value && isPostingAnon.value)
const canSubmit = computed(() => {
    if (!activeApi.value || submitting.value) return false
    if (!draft.value.trim() || draftTextLength.value > 4000) return false
    if (needsAltcha.value && showManualAltcha.value && !altchaPayload.value) return false
    return true
})

const chatMessages = computed(() => buildChatMessages(comments.value, ownCommentIds.value))

const activeAnonTag = computed<string | null>(() => {
    if (viewerAnonTag.value) return normalizeAnonDisplayName(viewerAnonTag.value)
    for (let i = comments.value.length - 1; i >= 0; i--) {
        const c = comments.value[i]
        if (!c.deleted && (c.is_mine || ownCommentIds.value.has(c.id)) && isAnonymous(c)) {
            return displayAuthorName(c)
        }
    }
    return null
})

const activeAnonLabel = computed(() => activeAnonTag.value || 'Anon')

const activeAnonIdentity = computed(() =>
    activeAnonTag.value ? pickAnonIdentity(activeAnonTag.value, anonAvatarList.value) : null,
)

const activeAnonRingStyle = computed<Record<string, string>>(() =>
    activeAnonIdentity.value ? {'--tgb-anon-ring': activeAnonIdentity.value.ringColor} : {},
)

const meFallbackStyle = computed<Record<string, string>>(() => {
    const name = me.value?.display_name || ''
    return {
        background: SENDER_PALETTE[hashName(name) % SENDER_PALETTE.length],
        color: '#fff',
    }
})

watch(me, (newMe) => {
    if (!newMe) {
        asAnonymous.value = false
        composerSettingsOpen.value = false
    }
})

watch(needsAltcha, (needed) => {
    if (!needed) {
        altchaPayload.value = null
        showManualAltcha.value = false
    }
})

watch(activeApi, (nextApi) => {
    if (nextApi) {
        void fetchComments()
    }
})

function safeAvatar(url?: string | null): string | null {
    return sanitizeAvatarUrl(url)
}

const anonAvatarList = computed(() =>
    (ctx?.anonAvatars?.value ?? [])
        .map((url) => sanitizeAvatarUrl(url))
        .filter((url): url is string => !!url),
)

function avatarInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase() || '?'
}

function isTelegramSynced(c: CommentDTO): boolean {
    return c.source === 'telegram' || c.author?.role === 'telegram'
}

function isAnonymous(c: CommentDTO): boolean {
    return !c.author?.verified && !isTelegramSynced(c)
}

function displayAuthorName(c: CommentDTO): string {
    if (isAnonymous(c)) return normalizeAnonDisplayName(c.author?.display_name)
    return c.author?.display_name || ''
}

function anonIdentity(c: CommentDTO) {
    return pickAnonIdentity(c.author?.display_name, anonAvatarList.value)
}

function commentAvatarUrl(c: CommentDTO): string | null {
    const explicit = safeAvatar(c.author?.avatar_url)
    if (explicit) return explicit
    if (isAnonymous(c)) return anonIdentity(c).avatarUrl
    return null
}

function hashName(name: string): number {
    let h = 0
    for (let i = 0; i < name.length; i++) {
        h = ((h << 5) - h + name.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

function senderColor(c: CommentDTO): string {
    if (c.author?.role === 'owner') return '#ab4343'
    if (isTelegramSynced(c)) return '#1982b8'
    if (isAnonymous(c)) return '#8a7357'
    return SENDER_PALETTE[hashName(c.author?.display_name || '') % SENDER_PALETTE.length]
}

function avatarRingStyle(c: CommentDTO): Record<string, string> {
    if (!isAnonymous(c) || safeAvatar(c.author?.avatar_url)) return {}
    return {'--tgb-anon-ring': anonIdentity(c).ringColor}
}

function avatarFallbackStyle(c: CommentDTO): Record<string, string> {
    if (isAnonymous(c)) return avatarRingStyle(c)
    if (c.author?.role === 'owner' || isTelegramSynced(c)) return {}
    const col = senderColor(c)
    return {backgroundColor: col, color: '#fff'}
}

function avatarClass(c: CommentDTO): Record<string, boolean> {
    const anon = isAnonymous(c)
    return {
        owner: c.author?.role === 'owner',
        telegram: isTelegramSynced(c),
        anon,
        'anon-ringed': anon && !safeAvatar(c.author?.avatar_url),
    }
}

function providerLabel(provider?: string | null): string {
    if (!provider) return msg.badgeVerified
    return `${msg.badgeVerified} (${provider})`
}

function formatFullDate(iso: string): string {
    return moment(iso).format(msg.dateFormat)
}

function formatShortDate(iso: string): string {
    return formatCommentShortDate(iso)
}

function formatShortTime(iso: string): string {
    return moment(iso).format('HH:mm')
}

function applyAppleEmojis() {
    const root = chatZoneEl.value ?? chatListEl.value
    if (!root || !appleEmojiBaseUrl.value) return
    root.querySelectorAll<HTMLElement>('.comment-body, .quote-snippet, .reply-banner-snippet').forEach(node => {
        replaceTextEmojisWithApple(node, appleEmojiBaseUrl.value)
    })
}

function initCommentCustomEmojis() {
    const root = chatZoneEl.value ?? chatListEl.value
    if (!root || typeof document === 'undefined') return
    commentEmojiManager.mountAll(root, {
        selector: '.comment-body i.custom-emoji[data-custom-emoji-id], .quote-snippet i.custom-emoji[data-custom-emoji-id], .reply-banner-snippet i.custom-emoji[data-custom-emoji-id]',
        resolveCandidates: (it) => {
            const id = it.getAttribute('data-custom-emoji-id')?.trim()
            if (!id || !isValidCustomEmojiId(id)) return []
            const deferProbe = !!(activeApi.value && ctx && !ctx.customEmojiCatalogReady.value)
            return buildCustomEmojiCandidates(customEmojiSrc(id), deferProbe)
        },
    })
}

function hydrateCommentDom() {
    initCommentCustomEmojis()
    applyAppleEmojis()
    initSpoilers()
}

function safeMediaSrc(raw?: string | null): string {
    return resolveApiAssetUrl(raw, activeApi.value?.baseUrl, resolvedPostsUrl.value)
}

function isGifMedia(url?: string | null): boolean {
    if (!url) return false
    return url.toLowerCase().split('?')[0].split('#')[0].endsWith('.gif')
}

function commentHasBody(c: CommentDTO): boolean {
    return !!(c.body_html?.trim() || c.body_text?.trim())
}

function isStickerOnlyBubble(item: ChatBubbleItem): boolean {
    return item.comment.media?.media_type === 'sticker' && !commentHasBody(item.comment)
}

function isStickerCard(item: ChatBubbleItem): boolean {
    return isStickerOnlyBubble(item) && ((item.firstInGroup && !item.isOwn) || !!item.parentComment)
}

function mediaTypeLabel(media?: CommentMediaDTO | null): string {
    if (!media) return ''
    switch (media.media_type) {
        case 'photo': return msg.mediaPhoto
        case 'sticker': return media.emoji ? `${media.emoji} ${msg.mediaSticker}` : msg.mediaSticker
        case 'animation': return msg.mediaAnimation
        case 'video': return msg.mediaVideo
        case 'document': return media.file_name || msg.mediaDocument
        default: return msg.mediaDocument
    }
}

function replyThumbUrl(media: CommentMediaDTO): string | null {
    const candidate = media.thumb || (media.media_type === 'photo' ? media.url : null) || (
        media.media_type === 'sticker' && !media.is_animated && !media.is_video && !media.url?.toLowerCase().endsWith('.tgs') && !media.url?.toLowerCase().endsWith('.webm')
            ? media.url
            : null
    )
    const safe = safeMediaSrc(candidate)
    return safe || null
}

function replyThumbBadge(media: CommentMediaDTO): string {
    if (media.media_type === 'sticker') return media.emoji || '🎭'
    if (media.media_type === 'animation') return '🎞️'
    if (media.media_type === 'video') return '🎬'
    if (media.media_type === 'photo') return '🖼️'
    return '📎'
}

function openCommentPhoto(c: CommentDTO) {
    if (!c.media) return
    const url = safeMediaSrc(c.media.url)
    if (!url) return
    const item: ViewedImage = {
        url,
        text: c.body_html || c.body_text || undefined,
        date: formatFullDate(c.created_at),
        fileName: c.media.file_name ?? undefined,
    }
    if (ctx?.openMediaViewer) {
        ctx.openMediaViewer([item], 0)
    } else {
        localViewerImgs.value = [item]
        localViewerIdx.value = 0
    }
}

function quoteSnippetHtml(c: CommentDTO): string {
    const mLabel = c.media ? mediaTypeLabel(c.media) : ''
    return sanitizeCommentSnippetHtml(c.body_html, c.body_text, mLabel)
}

function renderBody(c: CommentDTO): string {
    return sanitizeCommentHtml(c.body_html, c.body_text)
}

function jumpToComment(commentId: number) {
    if (typeof document === 'undefined') return
    const target = document.getElementById(`comment-${commentId}`)
    if (!target) return
    target.scrollIntoView({behavior: 'smooth', block: 'center'})
    highlightedId.value = commentId
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
        highlightedId.value = null
    }, 1500)
}

async function fetchComments() {
    if (!ctx || !activeApi.value) return
    loading.value = true
    loadError.value = null
    try {
        const res = await activeApi.value.getComments(props.postId)
        comments.value = res.comments ?? []
        viewerAnonTag.value = res.viewer_anon_tag ? normalizeAnonDisplayName(res.viewer_anon_tag) : null
        ctx.markCommentsSeen(props.postId, comments.value.map(c => c.id))
        if (comments.value.some(c => c.body_html?.includes('data-custom-emoji-id'))) {
            void ctx.ensureCustomEmojis()
        }
    } catch (err: any) {
        loadError.value = err?.message || msg.commentsLoadFailed
    } finally {
        loading.value = false
    }
}

function upsertComment(incoming: CommentDTO) {
    comments.value = upsertCommentInList(comments.value, incoming)
    if (incoming.body_html?.includes('data-custom-emoji-id')) {
        void ctx?.ensureCustomEmojis()
    }
}

function applyDelete(commentId: number) {
    if (replyTarget.value?.id === commentId) {
        replyTarget.value = null
    }
    if (reactionTargetId.value === commentId) {
        reactionTargetId.value = null
    }
    comments.value = applyCommentDeleteInList(comments.value, commentId)
}

const BUBBLE_TRIGGER_IGNORE_SELECTOR = 'a, button, input, textarea, select, .comment-media-video video, .comment-media-doc, .comment-reaction-btn, .inline-reply-quote, pre, code, .spoiler'

function shouldIgnoreBubbleReactionTrigger(target: EventTarget | null): boolean {
    if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) {
        return true
    }
    if (target instanceof Element && target.closest(BUBBLE_TRIGGER_IGNORE_SELECTOR)) {
        return true
    }
    return false
}

function openCommentReactionSelectorAt(comment: CommentDTO, x: number, y: number) {
    if (comment.deleted) return
    selectorAnchor.value = {x, y}
    reactionTargetId.value = comment.id
}

function onBubbleContextMenu(comment: CommentDTO, e: MouseEvent) {
    if (comment.deleted || e.shiftKey) return
    if (shouldIgnoreBubbleReactionTrigger(e.target)) return
    e.preventDefault()
    openCommentReactionSelectorAt(comment, e.clientX, e.clientY)
}

const SWIPE_REPLY_THRESHOLD = 44
const SWIPE_MAX_OFFSET = 68

interface BubbleSwipeState {
    id: number
    startX: number
    startY: number
    offset: number
    locked: 'h' | 'v' | null
    pointerId: number
    comment: CommentDTO
}

const swipeState = ref<BubbleSwipeState | null>(null)

let bubbleLongPressTimer: ReturnType<typeof setTimeout> | null = null
let bubbleGhostClickTimer: ReturnType<typeof setTimeout> | null = null
let bubbleSuppressGhostClick = false
let bubblePressStart = {x: 0, y: 0}
let activeTouchCleanup: (() => void) | null = null

function cancelBubbleLongPress() {
    if (bubbleLongPressTimer) {
        clearTimeout(bubbleLongPressTimer)
        bubbleLongPressTimer = null
    }
}

function clearBubbleGhostClickGuard() {
    bubbleSuppressGhostClick = false
    if (bubbleGhostClickTimer) {
        clearTimeout(bubbleGhostClickTimer)
        bubbleGhostClickTimer = null
    }
}

function armBubbleGhostClickGuard(durationMs = 800) {
    bubbleSuppressGhostClick = true
    if (bubbleGhostClickTimer) clearTimeout(bubbleGhostClickTimer)
    bubbleGhostClickTimer = setTimeout(() => {
        bubbleSuppressGhostClick = false
        bubbleGhostClickTimer = null
    }, durationMs)
}

function cleanupTouchListeners() {
    activeTouchCleanup?.()
    activeTouchCleanup = null
}

function swipeWrapperStyle(commentId: number) {
    if (swipeState.value?.id !== commentId || swipeState.value.locked !== 'h') return undefined
    return {transform: `translateX(${swipeState.value.offset}px)`}
}

function swipeHintStyle(commentId: number) {
    if (swipeState.value?.id !== commentId || swipeState.value.locked !== 'h' || swipeState.value.offset >= 0) {
        return undefined
    }
    const progress = Math.min(1, Math.abs(swipeState.value.offset) / SWIPE_REPLY_THRESHOLD)
    const scale = 0.55 + progress * 0.45
    return {
        opacity: String(progress),
        transform: `translateY(-50%) scale(${scale.toFixed(2)})`,
    }
}

function onBubbleClickCapture(e: MouseEvent) {
    if (!bubbleSuppressGhostClick) return
    clearBubbleGhostClickGuard()
    e.preventDefault()
    e.stopPropagation()
}

function onBubblePointerDown(comment: CommentDTO, e: PointerEvent) {
    if (comment.deleted || e.pointerType !== 'touch') return

    cancelBubbleLongPress()
    cleanupTouchListeners()
    bubblePressStart = {x: e.clientX, y: e.clientY}

    if (!shouldIgnoreBubbleReactionTrigger(e.target)) {
        bubbleLongPressTimer = setTimeout(() => {
            bubbleLongPressTimer = null
            if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) return
            armBubbleGhostClickGuard(800)
            swipeState.value = null
            cleanupTouchListeners()
            openCommentReactionSelectorAt(comment, bubblePressStart.x, bubblePressStart.y)
        }, 420)
    }

    if (canCompose.value && typeof window !== 'undefined') {
        swipeState.value = {
            id: comment.id,
            startX: e.clientX,
            startY: e.clientY,
            offset: 0,
            locked: null,
            pointerId: e.pointerId,
            comment,
        }

        const onWindowMove = (ev: PointerEvent) => {
            const cur = swipeState.value
            if (!cur || ev.pointerId !== cur.pointerId) return
            const dx = ev.clientX - cur.startX
            const dy = ev.clientY - cur.startY

            if (Math.hypot(dx, dy) > 8) {
                cancelBubbleLongPress()
            }

            if (cur.locked === null) {
                if (Math.hypot(dx, dy) <= 8) return
                if (dx < 0 && Math.abs(dx) > Math.abs(dy)) {
                    cur.locked = 'h'
                    armBubbleGhostClickGuard(350)
                } else {
                    cur.locked = 'v'
                    swipeState.value = null
                    cleanupTouchListeners()
                    return
                }
            }

            if (cur.locked === 'h') {
                cur.offset = Math.max(-SWIPE_MAX_OFFSET, Math.min(0, dx * 0.72))
            }
        }

        const onWindowEnd = (ev: PointerEvent) => {
            const cur = swipeState.value
            if (cur && ev.pointerId !== cur.pointerId) return
            cancelBubbleLongPress()
            cleanupTouchListeners()
            if (
                ev.type === 'pointerup'
                && cur
                && cur.locked === 'h'
                && -cur.offset >= SWIPE_REPLY_THRESHOLD
                && !cur.comment.deleted
            ) {
                armBubbleGhostClickGuard(350)
                startReply(cur.comment)
            }
            swipeState.value = null
        }

        window.addEventListener('pointermove', onWindowMove, {passive: true})
        window.addEventListener('pointerup', onWindowEnd)
        window.addEventListener('pointercancel', onWindowEnd)
        activeTouchCleanup = () => {
            window.removeEventListener('pointermove', onWindowMove)
            window.removeEventListener('pointerup', onWindowEnd)
            window.removeEventListener('pointercancel', onWindowEnd)
        }
    } else if (typeof window !== 'undefined') {
        const onMoveNoSwipe = (ev: PointerEvent) => {
            if (ev.pointerId !== e.pointerId) return
            if (Math.hypot(ev.clientX - bubblePressStart.x, ev.clientY - bubblePressStart.y) > 8) {
                cancelBubbleLongPress()
            }
        }
        const onEndNoSwipe = (ev: PointerEvent) => {
            if (ev.pointerId !== e.pointerId) return
            cancelBubbleLongPress()
            cleanupTouchListeners()
        }
        window.addEventListener('pointermove', onMoveNoSwipe, {passive: true})
        window.addEventListener('pointerup', onEndNoSwipe)
        window.addEventListener('pointercancel', onEndNoSwipe)
        activeTouchCleanup = () => {
            window.removeEventListener('pointermove', onMoveNoSwipe)
            window.removeEventListener('pointerup', onEndNoSwipe)
            window.removeEventListener('pointercancel', onEndNoSwipe)
        }
    }
}

async function toggleCommentReaction(comment: CommentDTO, payload: ReactionTogglePayload) {
    const api = activeApi.value
    if (!api || comment.deleted) return
    const commentId = comment.id
    const prevSnapshot = (comment.reactions ?? []).map(r => ({...r}))

    const seq = (reactionSeqMap.get(commentId) ?? 0) + 1
    reactionSeqMap.set(commentId, seq)
    reactionInFlightMap.set(commentId, (reactionInFlightMap.get(commentId) ?? 0) + 1)

    // Optimistic UI update
    comments.value = applyOptimisticCommentReactionToggle(comments.value, commentId, payload)

    try {
        const res = await api.toggleCommentReaction(commentId, payload)
        if (activeApi.value === api && reactionSeqMap.get(commentId) === seq) {
            comments.value = mergeCommentReactionsInList(comments.value, commentId, res.reactions)
        }
        if (activeApi.value === api && !viewerAnonTag.value) {
            void api.getComments(props.postId).then((r) => {
                if (activeApi.value === api && r.viewer_anon_tag) {
                    viewerAnonTag.value = normalizeAnonDisplayName(r.viewer_anon_tag)
                }
            }).catch(() => {})
        }
    } catch (err) {
        console.warn('[tg-blog] Comment reaction toggle failed:', err)
        const remaining = (reactionInFlightMap.get(commentId) ?? 1) - 1
        if (activeApi.value === api) {
            if (reactionSeqMap.get(commentId) === seq && remaining === 0) {
                comments.value = mergeCommentReactionsInList(comments.value, commentId, prevSnapshot)
            } else {
                void fetchComments()
            }
        }
    } finally {
        const nextInFlight = Math.max(0, (reactionInFlightMap.get(commentId) ?? 1) - 1)
        if (nextInFlight === 0) {
            reactionInFlightMap.delete(commentId)
        } else {
            reactionInFlightMap.set(commentId, nextInFlight)
        }
    }
}

function onToggleCommentReaction(comment: CommentDTO, r: MergedReaction) {
    if (r.custom_emoji_id) {
        void toggleCommentReaction(comment, {custom_emoji_id: r.custom_emoji_id})
    } else if (r.emoji) {
        void toggleCommentReaction(comment, {emoji: r.emoji})
    }
}

function onSelectCommentReactionChoice(choice: ReactionChoice) {
    const target = reactionTarget.value
    if (!target) return
    if (choice.custom_emoji_id) {
        void toggleCommentReaction(target, {custom_emoji_id: choice.custom_emoji_id})
    } else if (choice.emoji) {
        void toggleCommentReaction(target, {emoji: choice.emoji})
    }
}

function startReply(comment: CommentDTO) {
    if (comment.deleted) return
    replyTarget.value = comment
    nextTick(() => {
        richInputRef.value?.focus()
    })
}

async function resolveAltchaForSend(): Promise<string | null> {
    if (!needsAltcha.value) return null
    if (altchaPayload.value) return altchaPayload.value
    if (!activeApi.value) return null

    autoAltchaController?.abort()
    const controller = new AbortController()
    autoAltchaController = controller
    try {
        const challenge = await activeApi.value.getCaptchaChallenge(controller.signal)
        if (controller.signal.aborted) return null
        const res = await solveAltchaChallenge(challenge, controller.signal)
        if (controller.signal.aborted) return null
        return res.payload
    } catch (powErr: any) {
        if (controller.signal.aborted || powErr?.name === 'AbortError') return null
        showManualAltcha.value = true
        throw new Error(msg.altchaError, {cause: powErr})
    } finally {
        if (autoAltchaController === controller) {
            autoAltchaController = null
        }
    }
}

function recordCreatedComment(created: CommentDTO) {
    saveOwnCommentId(created.id)
    const nextOwn = new Set(ownCommentIds.value)
    nextOwn.add(created.id)
    ownCommentIds.value = nextOwn

    if (!created.author?.verified && !isTelegramSynced(created) && created.author?.display_name) {
        viewerAnonTag.value = normalizeAnonDisplayName(created.author.display_name)
    }

    upsertComment({...created, is_mine: true})
    if (created.moderation_status !== 'pending') {
        ctx?.notifyLocalCommentCreated(created)
    }
    replyTarget.value = null
    altchaPayload.value = null
    showManualAltcha.value = false
    altchaRef.value?.reset()
}

async function submitComment() {
    if (!ctx || !activeApi.value || !canSubmit.value) return
    submitting.value = true
    submitError.value = null

    try {
        const solvedPayload = await resolveAltchaForSend()
        if (needsAltcha.value && !solvedPayload) return

        const created = await activeApi.value.createComment(props.postId, {
            body: draft.value.trim(),
            parent_id: replyTarget.value?.id ?? null,
            as_anonymous: isPostingAnon.value,
            altcha_payload: solvedPayload,
        })

        recordCreatedComment(created)
        draft.value = ''
        draftTextLength.value = 0
        richInputRef.value?.clear()
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to post comment'
        altchaPayload.value = null
        altchaRef.value?.reset()
    } finally {
        submitting.value = false
    }
}

function toggleSymbolMenu() {
    if (symbolMenuOpen.value) {
        symbolMenuOpen.value = false
        return
    }
    const rect = smileyBtnEl.value?.getBoundingClientRect()
    if (rect) {
        symbolAnchorRect.value = {
            left: rect.left,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
        }
    }
    symbolMenuOpen.value = true
}

function onSelectEmoji(emoji: string) {
    richInputRef.value?.insertEmoji(emoji)
}

function onSelectCustomEmoji(asset: CustomEmojiAsset) {
    richInputRef.value?.insertCustomEmoji({
        id: asset.id,
        url: asset.url,
        alt: asset.alt ?? mergedCustomEmojiAlts.value[asset.id] ?? null,
    })
}

function onSymbolBackspace() {
    richInputRef.value?.backspaceAtSelection()
}

async function onSelectSticker(sticker: StickerItem) {
    if (!ctx || !activeApi.value || submitting.value) return
    if (needsAltcha.value && showManualAltcha.value && !altchaPayload.value) {
        submitError.value = msg.altchaError
        return
    }
    submitting.value = true
    submitError.value = null
    try {
        const solvedPayload = await resolveAltchaForSend()
        if (needsAltcha.value && !solvedPayload) return

        const media: CommentMediaDTO = {
            media_type: 'sticker',
            url: sticker.url,
            thumb: sticker.thumb ?? null,
            emoji: sticker.emoji ?? null,
            is_animated: !!sticker.is_animated || sticker.format === 'tgs',
            is_video: !!sticker.is_video || sticker.format === 'webm',
            sticker_id: sticker.id,
        }
        const created = await activeApi.value.createComment(props.postId, {
            body: '',
            media,
            parent_id: replyTarget.value?.id ?? null,
            as_anonymous: isPostingAnon.value,
            altcha_payload: solvedPayload,
        })
        recordCreatedComment(created)
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to send sticker'
        altchaPayload.value = null
        altchaRef.value?.reset()
    } finally {
        submitting.value = false
    }
}

function openFilePicker() {
    if (submitting.value) return
    fileInputEl.value?.click()
}

function onFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (file) {
        openAttachmentForFile(file)
    }
}

function onComposerFiles(files: File[]) {
    if (files.length > 0) {
        openAttachmentForFile(files[0])
    }
}

function openAttachmentForFile(file: File) {
    pendingAttachFile.value = file
    attachError.value = null
    symbolMenuOpen.value = false
    attachModalOpen.value = true
}

function closeAttachModal() {
    if (submitting.value) return
    attachModalOpen.value = false
    pendingAttachFile.value = null
    attachError.value = null
}

async function onSendAttachment({file, caption}: { file: File; caption: string }) {
    if (!ctx || !activeApi.value || submitting.value) return
    if (needsAltcha.value && showManualAltcha.value && !altchaPayload.value) {
        attachError.value = msg.altchaError
        return
    }

    submitting.value = true
    attachError.value = null
    submitError.value = null

    try {
        const solvedPayload = await resolveAltchaForSend()
        if (needsAltcha.value && !solvedPayload) return

        const media = await activeApi.value.uploadCommentMedia(file)
        const created = await activeApi.value.createComment(props.postId, {
            body: caption,
            media,
            parent_id: replyTarget.value?.id ?? null,
            as_anonymous: isPostingAnon.value,
            altcha_payload: solvedPayload,
        })
        recordCreatedComment(created)
        draft.value = ''
        draftTextLength.value = 0
        richInputRef.value?.clear()
        attachModalOpen.value = false
        pendingAttachFile.value = null
    } catch (err: any) {
        attachError.value = err?.message || msg.uploadFailed
        altchaPayload.value = null
        altchaRef.value?.reset()
    } finally {
        submitting.value = false
    }
}

async function handleDeleteClick(comment: CommentDTO) {
    if (!ctx || !activeApi.value) return
    if (confirmDeleteId.value !== comment.id) {
        confirmDeleteId.value = comment.id
        if (confirmTimer) clearTimeout(confirmTimer)
        confirmTimer = setTimeout(() => {
            confirmDeleteId.value = null
        }, 3000)
        return
    }

    if (confirmTimer) clearTimeout(confirmTimer)
    confirmDeleteId.value = null
    deletingId.value = comment.id
    try {
        await activeApi.value.deleteComment(comment.id)
        applyDelete(comment.id)
        ctx.notifyLocalCommentDeleted(props.postId, comment.id)
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to delete comment'
    } finally {
        deletingId.value = null
    }
}

async function toggleNotify() {
    if (!ctx || !me.value || togglingNotify.value) return
    togglingNotify.value = true
    try {
        await ctx.updateProfile({notify_replies: !me.value.notify_replies})
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to update notification setting'
    } finally {
        togglingNotify.value = false
    }
}

async function handleLogout() {
    if (!ctx) return
    composerSettingsOpen.value = false
    await ctx.logout()
}

function toggleComposerSettings() {
    composerSettingsOpen.value = !composerSettingsOpen.value
}

function onDocumentClickForSettings(e: MouseEvent) {
    if (!composerSettingsOpen.value) return
    const target = e.target as Node | null
    if (
        target &&
        (settingsMenuEl.value?.contains(target) || settingsTriggerEl.value?.contains(target))
    ) {
        return
    }
    composerSettingsOpen.value = false
}

function onDocumentKeydownForSettings(e: KeyboardEvent) {
    if (composerSettingsOpen.value && e.key === 'Escape') {
        composerSettingsOpen.value = false
    }
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
    ownCommentIds.value = loadOwnCommentIds()
    if (typeof document !== 'undefined') {
        document.addEventListener('click', onDocumentClickForSettings)
        document.addEventListener('keydown', onDocumentKeydownForSettings)
    }
    if (!ctx) return
    void fetchComments()
    unsubscribe = ctx.subscribeComments(props.postId, {
        onCreated: (c) => upsertComment(c),
        onDeleted: (ev) => applyDelete(ev.comment_id),
        onReactionUpdated: (ev) => {
            if ((reactionInFlightMap.get(ev.comment_id) ?? 0) > 0) return
            comments.value = mergeCommentReactionsInList(comments.value, ev.comment_id, ev.reactions)
        },
        onAuthChanged: () => { void fetchComments() },
    })
    nextTick(() => {
        hydrateCommentDom()
    })
})

onUpdated(() => {
    hydrateCommentDom()
})

watch([appleEmojiBaseUrl, mergedCustomEmojiUrls, () => ctx?.customEmojiCatalogReady.value ?? true], () => {
    nextTick(() => hydrateCommentDom())
})

watch(replyTarget, (nextTarget) => {
    if (nextTarget?.body_html?.includes('data-custom-emoji-id') || nextTarget?.body_text?.includes('<tg-emoji')) {
        void ctx?.ensureCustomEmojis()
    }
    nextTick(() => hydrateCommentDom())
})

onUnmounted(() => {
    unsubscribe?.()
    autoAltchaController?.abort()
    commentEmojiManager.destroyAll()
    cancelBubbleLongPress()
    cleanupTouchListeners()
    clearBubbleGhostClickGuard()
    if (typeof document !== 'undefined') {
        document.removeEventListener('click', onDocumentClickForSettings)
        document.removeEventListener('keydown', onDocumentKeydownForSettings)
    }
    if (confirmTimer) clearTimeout(confirmTimer)
    if (highlightTimer) clearTimeout(highlightTimer)
})
</script>

<style lang="sass" scoped>
@use "sass:color"
@use "css/colors" as *
@use "css/global" as *

// External chat zone tucked cleanly underneath .post.tgb-card's 20px rounded bottom corners
.chat-zone
    position: relative
    margin: 0 14px
    padding: 14px 12px 14px
    text-align: left
    font-size: 0.9em
    background: linear-gradient(180deg, rgba(255, 131, 115, 0.14) 0%, rgba(255, 131, 115, 0.04) 65%, rgba(255, 131, 115, 0) 100%)

    // Two delicate 1px vertical pink-to-transparent lines along left & right edges (integer 1px avoids Firefox subpixel mismatch)
    &::before, &::after
        content: ""
        position: absolute
        top: 0
        bottom: 0
        width: 1px
        background: linear-gradient(180deg, rgba(255, 131, 115, 0.52) 0%, rgba(255, 131, 115, 0.16) 75%, rgba(255, 131, 115, 0) 100%)
        pointer-events: none

    &::before
        left: 0

    &::after
        right: 0

.thread-status
    padding: 8px 6px
    font-size: 0.88em
    color: $color-text-light
    display: flex
    align-items: center
    justify-content: center
    gap: 8px

    &.error
        color: #c93b3b

.link-btn
    background: none
    border: none
    color: $color-text-special
    font-weight: 600
    font-size: inherit
    cursor: pointer
    padding: 0
    text-decoration: underline

.chat-list
    display: flex
    flex-direction: column
    margin-bottom: 10px

// Telegram Web A Message bubble layout (Message.scss + _message-content.scss + MessageAppendix.tsx)
.Message
    --border-radius-messages: 15px
    --border-radius-messages-small: 6px
    --border-top-left-radius: var(--border-radius-messages)
    --border-top-right-radius: var(--border-radius-messages)
    --border-bottom-left-radius: var(--border-radius-messages)
    --border-bottom-right-radius: var(--border-radius-messages)
    --tgb-bubble-bg: #fffcf9
    --tgb-bubble-highlight-bg: #fff1ee

    position: relative
    display: flex
    align-items: flex-end
    margin-bottom: 3px
    touch-action: pan-y

    &.last-in-group
        margin-bottom: 9px

    &.is-highlighted .message-content
        animation: tgb-bubble-highlight 1.4s ease

    &.is-highlighted .svg-appendix .corner
        animation: tgb-appendix-highlight 1.4s ease

    &.is-highlighted .tombstone-bubble
        animation: tgb-tombstone-highlight 1.4s ease

    &:not(.own)
        padding-left: 2.35rem

        &.first-in-group:not(.last-in-group)
            --border-bottom-left-radius: var(--border-radius-messages-small)

        &:not(.first-in-group):not(.last-in-group)
            --border-top-left-radius: var(--border-radius-messages-small)
            --border-bottom-left-radius: var(--border-radius-messages-small)

        &.last-in-group:not(.first-in-group)
            --border-top-left-radius: var(--border-radius-messages-small)

        &.last-in-group .message-content.has-appendix
            --border-bottom-left-radius: 0

    &.own
        flex-direction: row-reverse

        &.first-in-group:not(.last-in-group)
            --border-bottom-right-radius: var(--border-radius-messages-small)

        &:not(.first-in-group):not(.last-in-group)
            --border-top-right-radius: var(--border-radius-messages-small)
            --border-bottom-right-radius: var(--border-radius-messages-small)

        &.last-in-group:not(.first-in-group)
            --border-top-right-radius: var(--border-radius-messages-small)

        &.last-in-group .message-content.has-appendix
            --border-bottom-right-radius: 0

        .message-content-wrapper
            flex-direction: row-reverse

        .svg-appendix
            right: -8.5px
            left: auto

.tombstone-bubble
    font-style: italic
    font-size: 0.82em
    color: $color-text-light
    padding: 4px 10px
    border-radius: 10px
    border: 1px dashed rgba(112, 81, 42, 0.2)

.avatar-slot
    position: absolute
    bottom: 0
    left: 0
    width: 32px
    height: 32px
    flex-shrink: 0

.bubble-avatar
    width: 32px
    height: 32px
    border-radius: 50%
    object-fit: cover
    display: block
    box-sizing: border-box
    box-shadow: 0 1px 3px rgba(112, 81, 42, 0.16)

    &.anon-ringed
        border: 2px solid var(--tgb-anon-ring, #8a7357)
        padding: 1px
        background: #fdf9f1
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.72), 0 1px 4px rgba(112, 81, 42, 0.2)

.avatar-fallback
    display: inline-flex
    align-items: center
    justify-content: center
    background: rgba(112, 81, 42, 0.16)
    color: $color-text-main
    font-size: 0.82em
    font-weight: 700
    user-select: none

    &.owner
        background: $color-text-special
        color: #fff

    &.telegram
        background: #24a1de
        color: #fff

    &.anon
        background: rgba(112, 81, 42, 0.12)
        color: $color-text-light

.message-content-wrapper
    display: flex
    align-items: center
    gap: 5px
    max-width: 88%
    min-width: 0
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)

    &.is-swiping
        transition: none

.swipe-reply-hint
    position: absolute
    right: 2px
    top: 50%
    width: 26px
    height: 26px
    border-radius: 50%
    background: rgba(253, 249, 241, 0.94)
    border: 1px solid rgba(112, 81, 42, 0.14)
    color: $color-text-light
    display: flex
    align-items: center
    justify-content: center
    pointer-events: none
    opacity: 0
    transform: translateY(-50%) scale(0.55)
    transition: background-color 0.14s ease, border-color 0.14s ease, color 0.14s ease

    svg
        width: 14px
        height: 14px

    &.ready
        background: $color-text-special
        border-color: $color-text-special
        color: #fff

.message-content
    position: relative
    min-width: 64px
    max-width: 100%
    background: var(--tgb-bubble-bg)
    box-shadow: 0 1px 2px rgba(112, 81, 42, 0.12)
    border-top-left-radius: var(--border-top-left-radius)
    border-top-right-radius: var(--border-top-right-radius)
    border-bottom-left-radius: var(--border-bottom-left-radius)
    border-bottom-right-radius: var(--border-bottom-right-radius)
    padding: 6px 10px 6px 11px
    box-sizing: border-box

    &.is-sticker-only
        background: transparent !important
        box-shadow: none !important
        padding: 0
        min-width: 0

        .comment-reactions
            margin-top: 4px

.bubble-media-group
    display: contents

    &.sticker-card
        display: flex
        flex-direction: column
        width: 164px
        max-width: 100%
        background: var(--tgb-bubble-bg)
        border-radius: 14px
        overflow: hidden
        box-shadow: 0 1px 2px rgba(112, 81, 42, 0.1)

        .message-title
            margin: 0
            padding: 5px 10px 4px
            border-bottom: 1px solid rgba(112, 81, 42, 0.08)
            min-width: 0

        .inline-reply-quote
            margin: 4px 6px 2px
            border-radius: 8px
            background: rgba(112, 81, 42, 0.06)
            box-shadow: none
            backdrop-filter: none

        .comment-media-sticker
            width: 100%
            height: auto
            aspect-ratio: 1 / 1
            margin: 0
            padding: 0
            border-radius: 0

    &.sticker-solo
        display: block

        .comment-media-sticker
            border-radius: 14px
            overflow: hidden

.svg-appendix
    position: absolute
    bottom: -3px
    left: -8.5px
    width: 9px
    height: 20px
    overflow: hidden
    pointer-events: none
    filter: drop-shadow(0 1px 1px rgba(112, 81, 42, 0.08))

    .corner
        fill: var(--tgb-bubble-bg)

.message-title
    display: flex
    align-items: center
    gap: 4px
    margin-bottom: 2px
    font-size: 0.82em
    font-weight: 600
    line-height: 1.25
    user-select: none

    .sender-title
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

// Bottom-right timestamp inside every bubble (date by default, hover over the date for HH:mm)
.message-timestamp
    display: inline-grid
    align-items: center
    justify-items: end
    font-size: 0.72em
    font-weight: 400
    line-height: 1.1
    color: $color-text-light
    font-variant-numeric: tabular-nums
    white-space: nowrap
    flex-shrink: 0
    cursor: default
    user-select: none

    &.in-text
        float: right
        margin: 4px 0 -1px 8px

    &.in-reactions
        margin-left: auto
        align-self: flex-end
        padding: 2px 0 1px 4px

    > span
        grid-area: 1 / 1
        transition: opacity 0.15s ease

    .ts-time
        opacity: 0

.message-timestamp:hover
    .ts-date
        opacity: 0

    .ts-time
        opacity: 1

.badge
    display: inline-flex
    align-items: center
    gap: 2px
    padding: 0 5px
    border-radius: 999px
    font-size: 0.78em
    font-weight: 600
    line-height: 1.35
    flex-shrink: 0

    .badge-svg
        width: 10px
        height: 10px

.badge-owner
    background: $color-text-special
    color: #fff

.badge-verified
    padding: 2px
    background: rgba(47, 158, 68, 0.13)
    color: #2b8a3e

.badge-telegram
    padding: 2px
    background: rgba(36, 161, 222, 0.14)
    color: #1982b8

.badge-pending-review
    padding: 1px 6px
    background: rgba(245, 158, 11, 0.16)
    color: #b45309
    margin-left: 4px
    vertical-align: middle

.badge-anon
    background: rgba(112, 81, 42, 0.08)
    color: $color-text-light
    font-weight: 500

.inline-reply-quote
    display: block
    width: 100%
    text-align: left
    margin: 2px 0 5px
    padding: 3px 8px
    border: none
    border-left: 2.5px solid $color-text-special
    border-radius: 4px 6px 6px 4px
    background: rgba(255, 131, 115, 0.1)
    font-family: inherit
    transition: background-color 0.15s ease

    &:hover
        background: rgba(255, 131, 115, 0.17)

    .inline-reply-row
        display: flex
        align-items: center
        gap: 6px
        min-width: 0

    .quote-thumb
        width: 20px
        height: 20px
        border-radius: 4px
        object-fit: cover
        flex-shrink: 0
        display: block

    .quote-thumb-badge
        width: 20px
        height: 20px
        border-radius: 4px
        background: rgba(255, 131, 115, 0.16)
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 12px
        line-height: 1
        flex-shrink: 0

    .quote-meta
        min-width: 0
        flex: 1

    .quote-author
        font-size: 0.78em
        font-weight: 700
        color: $color-text-special-dark
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

    .quote-snippet
        font-size: 0.78em
        color: $color-text-light
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

.comment-media
    position: relative
    margin: 2px 0 4px

    &:last-child
        margin-bottom: 0

.comment-media-photo, .comment-media-animation, .comment-media-video
    border-radius: 10px
    overflow: hidden
    max-width: 256px
    background: rgba(112, 81, 42, 0.06)

    &.has-caption
        margin-bottom: 6px

    img, video
        display: block
        max-width: 100%
        max-height: 280px
        width: auto
        height: auto
        object-fit: cover
        border-radius: 10px

.comment-media-video video
    width: 100%
    background: #1a140e

.comment-media-sticker
    position: relative
    width: 136px
    height: 136px
    margin: 0
    display: flex
    align-items: center
    justify-content: center
    border-radius: 12px
    overflow: hidden

.message-timestamp.media-pill
    position: absolute
    right: 6px
    bottom: 6px
    padding: 2px 6px
    border-radius: 999px
    background: rgba(56, 40, 22, 0.56)
    color: #fff
    backdrop-filter: blur(4px)

.comment-media-doc
    display: flex
    align-items: center
    gap: 8px
    padding: 6px 9px
    margin: 2px 0 4px
    border-radius: 10px
    background: rgba(255, 131, 115, 0.1)
    color: $color-text-main
    text-decoration: none
    transition: background-color 0.15s ease

    &:hover
        background: rgba(255, 131, 115, 0.18)

    .doc-icon
        width: 28px
        height: 28px
        border-radius: 8px
        background: $color-text-special
        color: #fff
        display: inline-flex
        align-items: center
        justify-content: center
        flex-shrink: 0

        svg
            width: 16px
            height: 16px

    .doc-info
        display: flex
        flex-direction: column
        min-width: 0

    .doc-name
        font-size: 0.86em
        font-weight: 600
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

    .doc-size
        font-size: 0.74em
        color: $color-text-light

.text-content
    display: flow-root
    font-size: 0.94em
    line-height: 1.42
    overflow-wrap: anywhere
    color: $color-text-main

.comment-body
    :deep(p)
        display: inline
        margin: 0

    :deep(p + p::before)
        content: "\A"
        white-space: pre

    :deep(a)
        color: $color-text-special
        text-decoration: underline

    :deep(code)
        background: rgba(0, 0, 0, 0.06)
        padding: 1px 4px
        border-radius: 4px
        font-size: 0.9em

    :deep(blockquote)
        margin: 4px 0
        padding: 2px 8px
        border-left: 2.5px solid $color-text-special
        border-radius: 3px 6px 6px 3px
        background: rgba(255, 131, 115, 0.1)
        font-size: 0.92em

    :deep(pre)
        margin: 4px 0
        padding: 6px 8px
        border-radius: 6px
        background: rgba(0, 0, 0, 0.06)
        overflow-x: auto
        font-size: 0.88em

        code
            background: none
            padding: 0

.text-content, .quote-snippet, .reply-banner-snippet
    :deep(u)
        text-decoration: underline

    :deep(del), :deep(s)
        text-decoration: line-through

    :deep(i.custom-emoji)
        display: inline-flex
        align-items: center
        justify-content: center
        width: 1.25em
        height: 1.25em
        vertical-align: -0.22em
        margin: 0 1px

        img, video, .tgb-tgs-host
            width: 100%
            height: 100%
            object-fit: contain
            display: block
            pointer-events: none

        .tgb-tgs-host svg
            width: 100% !important
            height: 100% !important
            display: block

.comment-reactions
    display: flex
    flex-wrap: wrap
    gap: 4px
    margin-top: 5px

.comment-reaction-btn
    --custom-emoji-size: 1.05rem
    --apple-emoji-size: 1rem
    display: inline-flex
    align-items: center
    gap: 3px
    height: 1.45rem
    padding: 0 7px 0 5px
    border: none
    border-radius: 999px
    font-family: inherit
    font-size: 0.78em
    font-weight: 600
    font-variant-numeric: tabular-nums
    line-height: 1
    white-space: nowrap
    cursor: pointer
    background: rgba(255, 131, 115, 0.13)
    color: $color-text-special-dark
    transition: background-color 150ms ease, color 150ms ease, transform 120ms ease

    .reaction-emoji
        --apple-emoji-size: 0.98rem
        font-size: 0.95rem
        line-height: 1
        vertical-align: middle !important

    .reaction-count
        color: inherit
        font-size: 0.92em
        font-weight: 600

    &:hover
        background: rgba(255, 131, 115, 0.22)

    &:active
        transform: scale(0.95)

    &.chosen
        background: $color-text-special
        color: #ffffff

        &:hover
            background: color.adjust($color-text-special, $lightness: -4%)

.bubble-actions
    display: flex
    align-items: center
    gap: 2px
    opacity: 0
    transition: opacity 0.15s ease
    flex-shrink: 0

@media (hover: hover) and (pointer: fine)
    .Message:hover .bubble-actions,
    .Message:focus-within .bubble-actions,
    .Message.selector-open .bubble-actions
        opacity: 1

@media (hover: none), (pointer: coarse)
    .bubble-act-btn.reply-btn
        display: none

    .bubble-actions:has(.bubble-act-btn.danger)
        opacity: 0.85

    .bubble-actions:has(.bubble-act-btn.confirming)
        opacity: 1

    .bubble-act-btn.danger
        min-width: 28px
        height: 28px

    .bubble-actions:not(:has(.bubble-act-btn.danger))
        display: none

.bubble-act-btn
    background: rgba(253, 249, 241, 0.85)
    border: 1px solid rgba(112, 81, 42, 0.1)
    border-radius: 999px
    min-width: 24px
    height: 24px
    padding: 0 5px
    color: $color-text-light
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    font-family: inherit
    font-size: 0.72em
    transition: color 0.14s ease, background-color 0.14s ease, border-color 0.14s ease

    svg
        width: 13px
        height: 13px

    &:hover
        color: $color-text-special-dark
        border-color: rgba(255, 131, 115, 0.45)

    &.danger:hover, &.confirming
        color: #c93b3b
        border-color: rgba(201, 59, 59, 0.45)

    .confirm-text
        font-weight: 600
        white-space: nowrap

// Composer area
.composer
    display: flex
    flex-direction: column
    gap: 6px

.composer-bar
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: 6px
    position: relative
    z-index: 1

    &.menu-open
        z-index: 5

.composer-auth-row
    display: inline-flex
    align-items: center
    gap: 8px
    min-width: 0

.composer-meta-row
    display: inline-flex
    align-items: center
    gap: 8px
    margin-left: auto

.composer-bar.has-composer
    align-items: flex-end

    .composer-auth-row, .composer-meta-row
        align-items: flex-end

    .composer-avatar
        margin-left: 12px
        margin-bottom: -16px

    .signin-btn
        margin-bottom: 0

.composer-avatar
    width: 30px
    aspect-ratio: 1
    padding: 0
    border-radius: 50%
    flex-shrink: 0
    display: inline-flex
    align-items: center
    justify-content: center
    overflow: hidden
    background: #eee5d7
    color: $color-text-light
    border: 1px solid rgba(112, 81, 42, 0.14)
    box-sizing: border-box
    user-select: none
    transition: transform 0.16s ease, box-shadow 0.16s ease

    &.signed-in
        width: 40px
        border: 2px solid #fdf9f1
        padding: 1px
        background: #fdf9f1
        box-shadow: 0 0 0 1px rgba(112, 81, 42, 0.14), 0 1px 4px rgba(112, 81, 42, 0.2)

    &.anon-ringed
        width: 40px
        border: 2px solid var(--tgb-anon-ring, #8a7357)
        padding: 1px
        background: #fdf9f1
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.72), 0 1px 4px rgba(112, 81, 42, 0.2)

    &:is(button)
        cursor: pointer

        &:hover
            transform: translateY(-1px)

    .composer-avatar-img
        width: 100%
        height: auto
        aspect-ratio: 1
        border-radius: 50%
        object-fit: cover
        display: block

    .composer-avatar-fallback
        width: 100%
        height: 100%
        border-radius: 50%
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 0.92em
        font-weight: 700
        user-select: none

    svg
        width: 18px
        height: 18px

.composer-author-name
    font-size: 0.78em
    font-weight: 600
    color: $color-text-main
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    max-width: 180px

    &.anon
        color: #8a7357

.composer-settings-wrap
    position: relative
    display: inline-flex
    align-items: center

.composer-settings-btn
    .settings-gear-icon
        width: 13px
        height: 13px
        flex-shrink: 0

    &.open
        color: $color-text-special

.composer-settings-menu
    position: absolute
    right: 0
    bottom: calc(100% + 6px)
    z-index: 20
    min-width: 186px
    padding: 5px
    border-radius: 12px
    background: #fdf9f1
    border: 1px solid rgba(112, 81, 42, 0.14)
    box-shadow: 0 10px 26px rgba(48, 30, 12, 0.16)
    display: flex
    flex-direction: column
    gap: 2px

.settings-menu-item
    width: 100%
    box-sizing: border-box
    display: flex
    align-items: center
    justify-content: space-between
    gap: 10px
    padding: 7px 10px
    border: none
    border-radius: 8px
    background: transparent
    color: $color-text-main
    font-family: inherit
    font-size: 0.8em
    font-weight: 500
    text-align: left
    cursor: pointer
    transition: background 0.14s ease, color 0.14s ease

    &:hover:not(:disabled)
        background: rgba(255, 131, 115, 0.12)

    &:disabled
        opacity: 0.55
        cursor: wait

    &.danger
        color: #c93b3b

        &:hover:not(:disabled)
            background: rgba(201, 59, 59, 0.08)

.settings-item-label
    white-space: nowrap

.settings-switch
    position: relative
    width: 28px
    height: 16px
    border-radius: 999px
    background: rgba(112, 81, 42, 0.22)
    flex-shrink: 0
    transition: background 0.16s ease

    &::after
        content: ""
        position: absolute
        top: 2px
        left: 2px
        width: 12px
        height: 12px
        border-radius: 50%
        background: #fff
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18)
        transition: transform 0.16s ease

    &.on
        background: $color-text-special

        &::after
            transform: translateX(12px)

.settings-menu-divider
    height: 1px
    margin: 2px 6px
    background: rgba(112, 81, 42, 0.1)

.signin-btn
    display: inline-flex
    align-items: center
    gap: 5px
    background: $color-bg-card
    border: none
    color: $color-text-light
    border-radius: 999px
    padding: 3px 10px
    font-size: 0.82em
    font-weight: 400
    line-height: 1.4
    font-family: inherit
    cursor: pointer
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 8%)
    transition: color 0.2s ease, transform 0.2s ease

    &:hover
        color: $color-text-special
        transform: translateY(-1px)

.guest-hint
    font-size: 0.78em
    color: $color-text-light

.composer-box
    position: relative
    z-index: 2
    display: flex
    flex-direction: column
    gap: 6px

.reply-banner
    display: flex
    align-items: center
    justify-content: space-between
    gap: 8px
    padding: 5px 10px
    border-left: 2.5px solid $color-text-special
    border-radius: 6px 10px 10px 6px
    background: #fbf4ea
    font-size: 0.8em

    .reply-banner-content
        display: flex
        flex-direction: column
        min-width: 0

    .reply-banner-title
        font-weight: 600
        color: $color-text-special-dark

    .reply-banner-snippet
        color: $color-text-light
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

.cancel-reply-btn
    background: none
    border: none
    color: $color-text-light
    font-size: 0.95em
    cursor: pointer
    padding: 2px 4px
    flex-shrink: 0

    &:hover
        color: $color-text-special-dark

// Web A Rich Composer inside #add-comment
.add-comment
    position: relative

.composer-smiley-btn
    position: absolute
    left: 7px
    bottom: 7px
    z-index: 2
    width: 26px
    height: 26px
    padding: 0
    border: none
    border-radius: 50%
    background: transparent
    color: $color-text-light
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    transition: color 0.14s ease, background-color 0.14s ease

    svg
        width: 19px
        height: 19px

    &:hover:not(:disabled), &.active
        color: $color-text-special
        background: rgba(255, 131, 115, 0.12)

    &:disabled
        opacity: 0.5
        cursor: default

.composer-rich-input
    --tgb-rich-pad-left: 38px
    --tgb-rich-pad-right: 78px

.send-comment-btn
    position: absolute
    right: 8px
    bottom: 7px
    z-index: 2
    color: $color-text-special
    display: flex
    align-items: center
    gap: 3px

    .attach-btn
        width: 26px
        height: 26px
        padding: 0
        border: none
        border-radius: 50%
        background: transparent
        color: $color-text-light
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        transition: color 0.14s ease, background-color 0.14s ease

        svg
            width: 18px
            height: 18px

        &:hover:not(:disabled)
            color: $color-text-special
            background: rgba(255, 131, 115, 0.12)

        &:disabled
            opacity: 0.5
            cursor: default

    .char-count
        font-size: 10px
        color: $color-text-light
        margin-right: 2px
        font-variant-numeric: tabular-nums

    .unstyled-button
        background: none
        border: none
        padding: 2px
        color: inherit
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1.05em
        transition: transform 0.12s ease, opacity 0.15s ease

        &:hover:not(:disabled)
            transform: scale(1.1)

        &:disabled
            opacity: 0.55
            cursor: wait

.send-spinner
    width: 14px
    height: 14px
    border-radius: 50%
    border: 2px solid rgba(255, 131, 115, 0.28)
    border-top-color: $color-text-special
    animation: tgb-chat-spin 0.75s linear infinite

.composer-error
    color: #c93b3b
    font-size: 0.8em
    padding: 0 4px

@keyframes tgb-chat-spin
    to
        transform: rotate(360deg)

@keyframes tgb-bubble-highlight
    0%, 100%
        background: var(--tgb-bubble-bg)
        filter: drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0))
    25%, 65%
        background: var(--tgb-bubble-highlight-bg)
        box-shadow: none
        filter: drop-shadow(1.5px 0 0 rgba(255, 131, 115, 0.85)) drop-shadow(-1.5px 0 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 1.5px 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 -1.5px 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 0 6px rgba(255, 131, 115, 0.45))

@keyframes tgb-appendix-highlight
    0%, 100%
        fill: var(--tgb-bubble-bg)
    25%, 65%
        fill: var(--tgb-bubble-highlight-bg)

@keyframes tgb-tombstone-highlight
    0%, 100%
        box-shadow: 0 1px 2px rgba(112, 81, 42, 0.12)
    25%, 65%
        box-shadow: 0 0 0 2.5px rgba(255, 131, 115, 0.65), 0 4px 12px rgba(255, 131, 115, 0.2)
</style>
