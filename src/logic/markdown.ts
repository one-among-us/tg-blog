import {marked} from "marked";
import sanitizeHtml from 'sanitize-html';
import {isSafeMediaUrl} from './url';

/**
 * Spoiler markdown extension
 */
const spoilerExtension = {
  name: 'spoiler',
  level: 'inline',
  start(src) {
    return src.match(/\|\|(?!\s)/)?.index;
  },
  tokenizer(src) {
    const rule = /^\|\|(?!\s)([^\n]+)(?!\s)\|\|/;
    const match = rule.exec(src);

    if (match) {
      return {type: 'spoiler', raw: match[0], inner: this.lexer.inlineTokens(match[1].trim())};
    }
  },
  renderer(token) {
    return `<span class="spoiler"><span>${this.parser.parseInline(token.inner)}</span></span>`;
  }
};

const underlineExtension = {
  name: 'underline',
  level: 'inline',
  start(src) {
    return src.match(/--(?!\s)/)?.index;
  },
  tokenizer(src) {
    const rule = /^--(?!\s)([^\n]+)(?!\s)--/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'underline',
        raw: match[0],
        inner: this.lexer.inlineTokens(match[1].trim())
      }
    }
  },
  renderer(token) {
    return `<u><span>${this.parser.parseInline(token.inner)}</span></u>`;
  }
}

marked.use({extensions: [spoilerExtension, underlineExtension]});

/**
 * SanitizeHTML options
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
    "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
    "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
    "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
    "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
    "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
    "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u",

    "img", "del"
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    i: ['emoji-src', 'emoji-orig'],
    pre: ['language', 'class', 'data-language'],
    code: ['class']
  },
  allowedClasses: {
    span: ['spoiler', 'hljs-*'],
    i: ['custom-emoji'],
    code: ['*'],
    pre: ['*']
  },
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
  allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
  allowProtocolRelative: false,
  enforceHtmlBoundary: false,
  transformTags: {
    a: (tagName, attribs) => {
      const nextAttribs = {...attribs};
      if (nextAttribs.target) {
        nextAttribs.rel = 'noopener noreferrer nofollow';
      }
      return {
        tagName,
        attribs: nextAttribs,
      };
    },
  },
}

export function sanitize(html: string) { return sanitizeHtml(html, sanitizeOptions) }
export function mdParseInline(s: string) { return sanitize(marked.parseInline(s) as string) }
export function mdParse(s: string) { return sanitize(marked.parse(s) as string) }

// --- Telegram Web A Composer Markdown Parser & DOM Serializer ---

const CUSTOM_EMOJI_ID_RE = /^\d+$/;
const SAFE_COMMENT_LINK_RE = /^(?:https?:\/\/|mailto:)/i;
const TG_EMOJI_TAG_RE = /^<tg-emoji\b[^>]*\bemoji-id\s*=\s*(?:"(\d+)"|'(\d+)')[^>]*>([\s\S]*?)<\/tg-emoji>/i;
const UNDERLINE_OPEN_RE = /^<u>/i;
const FENCE_OPEN_RE = /^```([a-zA-Z0-9_-]*)\s*$/;
const FENCE_CLOSE_RE = /^```\s*$/;
const ESCAPABLE_CHARS = new Set(['*', '_', '~', '|', '`', '\\', '[', ']', '(', ')', '<', '>']);

export interface ParseMarkdownOptions {
  /** Emit `<img data-custom-emoji-id="...">` or `<i class="custom-emoji" data-custom-emoji-id="...">` (default `'i'`). */
  customEmojiTag?: 'i' | 'img';
  /** Optional resolved custom emoji asset URLs keyed by emoji ID (used when `customEmojiTag === 'img'`). */
  customEmojiUrls?: Record<string, string>;
}

function escapeHtmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(str: string): string {
  return escapeHtmlText(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeMarkdownHref(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (!SAFE_COMMENT_LINK_RE.test(trimmed)) return false;
  return isSafeMediaUrl(trimmed);
}

function findMatchingUnderlineClose(src: string, startAfterOpen: number): number {
  const closeIdx = src.indexOf('</u>', startAfterOpen);
  if (closeIdx >= 0) return closeIdx;
  const closeUpperIdx = src.toLowerCase().indexOf('</u>', startAfterOpen);
  return closeUpperIdx;
}

/**
 * Find the closing delimiter index for `**`, `__`, `~~`, `||`, skipping over
 * inline code spans and escaped characters so nested formatting resolves cleanly.
 */
function findClosingDelimiter(src: string, startAfterOpen: number, delim: string): number {
  let i = startAfterOpen;
  while (i < src.length) {
    if (src[i] === '\\' && i + 1 < src.length) {
      i += 2;
      continue;
    }
    if (src[i] === '`') {
      const codeEnd = src.indexOf('`', i + 1);
      if (codeEnd > i) {
        i = codeEnd + 1;
        continue;
      }
    }
    if (src.startsWith(delim, i)) {
      const inner = src.slice(startAfterOpen, i);
      if (inner.length > 0) {
        return i;
      }
    }
    i++;
  }
  return -1;
}

/**
 * Parse a Markdown link `[label](url)` starting at `src[start] === '['`.
 * Supports nested brackets in label and balanced parentheses in URLs.
 */
function tryParseMarkdownLink(
  src: string,
  start: number
): { label: string; url: string; nextIndex: number } | null {
  if (src[start] !== '[') return null;
  let depth = 0;
  let i = start;
  let labelEnd = -1;
  while (i < src.length) {
    if (src[i] === '\\' && i + 1 < src.length) {
      i += 2;
      continue;
    }
    if (src[i] === '[') {
      depth++;
    } else if (src[i] === ']') {
      depth--;
      if (depth === 0) {
        labelEnd = i;
        break;
      }
    }
    i++;
  }
  if (labelEnd < 0 || src[labelEnd + 1] !== '(') return null;

  let parenDepth = 1;
  let j = labelEnd + 2;
  let urlEnd = -1;
  while (j < src.length) {
    const ch = src[j];
    if (ch === '\\' && j + 1 < src.length) {
      j += 2;
      continue;
    }
    if (ch === '(') {
      parenDepth++;
    } else if (ch === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        urlEnd = j;
        break;
      }
    } else if (ch === '\n') {
      return null;
    }
    j++;
  }
  if (urlEnd < 0) return null;

  const label = src.slice(start + 1, labelEnd);
  const url = src.slice(labelEnd + 2, urlEnd).trim();
  if (!label || !url) return null;
  return { label, url, nextIndex: urlEnd + 1 };
}

function renderCustomEmojiHtml(id: string, altRaw: string, options?: ParseMarkdownOptions): string {
  const alt = (altRaw || '✦').trim() || '✦';
  const safeAlt = escapeHtmlText(alt);
  if (options?.customEmojiTag === 'img') {
    const url = options.customEmojiUrls?.[id];
    const srcAttr = url && isSafeMediaUrl(url) ? ` src="${escapeHtmlAttr(url)}"` : '';
    return `<img class="custom-emoji" data-custom-emoji-id="${id}" alt="${escapeHtmlAttr(alt)}"${srcAttr}>`;
  }
  return `<i class="custom-emoji" data-custom-emoji-id="${id}">${safeAlt}</i>`;
}

function parseInlineMarkdown(src: string, options?: ParseMarkdownOptions): string {
  let out = '';
  let i = 0;

  while (i < src.length) {
    // Escaped punctuation
    if (src[i] === '\\' && i + 1 < src.length && ESCAPABLE_CHARS.has(src[i + 1])) {
      out += escapeHtmlText(src[i + 1]);
      i += 2;
      continue;
    }

    // Inline code `...`
    if (src[i] === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i + 1) {
        out += `<code>${escapeHtmlText(src.slice(i + 1, end))}</code>`;
        i = end + 1;
        continue;
      }
    }

    // <tg-emoji emoji-id="...">✦</tg-emoji>
    if (src[i] === '<') {
      const rest = src.slice(i);
      const emojiMatch = TG_EMOJI_TAG_RE.exec(rest);
      if (emojiMatch) {
        const id = emojiMatch[1] || emojiMatch[2];
        if (id && CUSTOM_EMOJI_ID_RE.test(id)) {
          out += renderCustomEmojiHtml(id, emojiMatch[3], options);
          i += emojiMatch[0].length;
          continue;
        }
      }

      if (UNDERLINE_OPEN_RE.test(rest)) {
        const closeIdx = findMatchingUnderlineClose(src, i + 3);
        if (closeIdx > i + 3) {
          const inner = src.slice(i + 3, closeIdx);
          out += `<u>${parseInlineMarkdown(inner, options)}</u>`;
          i = closeIdx + 4;
          continue;
        }
      }
    }

    // [label](url)
    if (src[i] === '[') {
      const link = tryParseMarkdownLink(src, i);
      if (link && isSafeMarkdownHref(link.url)) {
        out += `<a href="${escapeHtmlAttr(link.url)}" target="_blank" rel="noopener noreferrer nofollow">${parseInlineMarkdown(link.label, options)}</a>`;
        i = link.nextIndex;
        continue;
      }
    }

    // Double-char formatting delimiters: **, __, ~~, ||
    const two = src.slice(i, i + 2);
    if (two === '**' || two === '__' || two === '~~' || two === '||') {
      const closeIdx = findClosingDelimiter(src, i + 2, two);
      if (closeIdx > i + 2) {
        const innerHtml = parseInlineMarkdown(src.slice(i + 2, closeIdx), options);
        if (two === '**') out += `<b>${innerHtml}</b>`;
        else if (two === '__') out += `<em>${innerHtml}</em>`;
        else if (two === '~~') out += `<del>${innerHtml}</del>`;
        else out += `<span class="spoiler"><span>${innerHtml}</span></span>`;
        i = closeIdx + 2;
        continue;
      }
    }

    out += escapeHtmlText(src[i]);
    i++;
  }

  return out;
}

/**
 * Parse canonical Telegram Markdown (`**bold**`, `__italic__`, `~~strike~~`, `||spoiler||`,
 * `` `code` ``, ```` ```pre``` ````, `> quote`, `[label](url)`, `<u>...</u>`,
 * `<tg-emoji emoji-id="...">✦</tg-emoji>`) into safe HTML.
 * SSR-safe (pure string parser, no DOM dependencies).
 */
export function parseMarkdownToHtml(md: string, options?: ParseMarkdownOptions): string {
  if (!md) return '';
  const normalized = md.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const parts: Array<{ type: 'block' | 'line'; html: string }> = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block ```[lang]
    const fenceMatch = FENCE_OPEN_RE.exec(line.trimEnd());
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines: string[] = [];
      let j = i + 1;
      let closed = false;
      while (j < lines.length) {
        if (FENCE_CLOSE_RE.test(lines[j].trimEnd())) {
          closed = true;
          break;
        }
        codeLines.push(lines[j]);
        j++;
      }
      if (closed) {
        const langClass = lang ? ` class="language-${escapeHtmlAttr(lang)}"` : '';
        parts.push({
          type: 'block',
          html: `<pre><code${langClass}>${escapeHtmlText(codeLines.join('\n'))}</code></pre>`,
        });
        i = j + 1;
        continue;
      }
    }

    // Blockquote lines (> ...)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        const stripped = lines[i].replace(/^>\s?/, '');
        quoteLines.push(parseInlineMarkdown(stripped, options));
        i++;
      }
      parts.push({
        type: 'block',
        html: `<blockquote>${quoteLines.join('<br>')}</blockquote>`,
      });
      continue;
    }

    parts.push({
      type: 'line',
      html: parseInlineMarkdown(line, options),
    });
    i++;
  }

  let result = '';
  for (let idx = 0; idx < parts.length; idx++) {
    const cur = parts[idx];
    const prev = idx > 0 ? parts[idx - 1] : null;
    if (prev && prev.type === 'line' && cur.type === 'line') {
      result += '<br>';
    }
    result += cur.html;
  }
  return result;
}

// --- Live DOM -> Canonical Telegram Markdown Serializer ---

const BLOCK_TAGS = new Set(['DIV', 'P', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI']);
const ZERO_WIDTH_RE = /\u200B/g;

function wrapSingleLineMark(line: string, open: string, close: string): string {
  if (!line.trim()) return line;
  const leading = line.match(/^\s*/)?.[0] ?? '';
  const trailing = line.match(/\s*$/)?.[0] ?? '';
  const core = line.slice(leading.length, line.length - trailing.length);
  return `${leading}${open}${core}${close}${trailing}`;
}

function wrapMarkdownMark(inner: string, open: string, close: string): string {
  const cleaned = inner.replace(ZERO_WIDTH_RE, '');
  if (!cleaned) return '';
  if (!cleaned.trim()) return cleaned;
  if (!cleaned.includes('\n')) {
    return wrapSingleLineMark(cleaned, open, close);
  }
  return cleaned
    .split('\n')
    .map(line => wrapSingleLineMark(line, open, close))
    .join('\n');
}

function extractRawCodeText(el: HTMLElement): string {
  let out = '';
  const children = Array.from(el.childNodes);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 3) {
      out += (child.nodeValue ?? '').replace(/\u00A0/g, ' ').replace(ZERO_WIDTH_RE, '');
    } else if (child.nodeType === 1) {
      const childEl = child as HTMLElement;
      const tag = childEl.tagName.toUpperCase();
      if (tag === 'BR') {
        out += '\n';
      } else if (BLOCK_TAGS.has(tag)) {
        if (out && !out.endsWith('\n')) out += '\n';
        out += extractRawCodeText(childEl);
        if (i < children.length - 1 && !out.endsWith('\n')) out += '\n';
      } else {
        out += extractRawCodeText(childEl);
      }
    }
  }
  return out;
}

function isEmptyBrSentinelBlock(el: HTMLElement): boolean {
  const nodes = Array.from(el.childNodes).filter(n => {
    if (n.nodeType === 3) {
      return (n.nodeValue ?? '').replace(ZERO_WIDTH_RE, '') !== '';
    }
    return true;
  });
  return nodes.length === 1 && nodes[0].nodeType === 1 && (nodes[0] as HTMLElement).tagName.toUpperCase() === 'BR';
}

function serializeChildList(container: Node): string {
  const children = Array.from(container.childNodes);
  let out = '';

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.nodeType === 3) {
      out += (child.nodeValue ?? '').replace(/\u00A0/g, ' ').replace(ZERO_WIDTH_RE, '');
      continue;
    }

    if (child.nodeType !== 1) continue;
    const el = child as HTMLElement;
    const tag = el.tagName.toUpperCase();

    if (tag === 'BR') {
      // Ignore trailing <br> sentinel inside a block or container when it's the very last child
      const hasMoreContent = children.slice(i + 1).some(n => {
        if (n.nodeType === 3) return (n.nodeValue ?? '').replace(ZERO_WIDTH_RE, '') !== '';
        return n.nodeType === 1;
      });
      if (hasMoreContent) {
        out += '\n';
      }
      continue;
    }

    // Custom emoji chip (<img>, <i>, or <span> with data-custom-emoji-id)
    const customEmojiId = el.getAttribute('data-custom-emoji-id')?.trim();
    if (customEmojiId && CUSTOM_EMOJI_ID_RE.test(customEmojiId)) {
      const alt = (
        el.getAttribute('data-emoji-alt') ||
        el.getAttribute('alt') ||
        el.textContent ||
        '✦'
      ).replace(ZERO_WIDTH_RE, '').trim() || '✦';
      out += `<tg-emoji emoji-id="${customEmojiId}">${alt}</tg-emoji>`;
      continue;
    }

    // Apple emoji <img> inside editor
    if (tag === 'IMG' && el.classList.contains('tgb-apple-emoji')) {
      out += el.getAttribute('alt') || '';
      continue;
    }

    if (tag === 'PRE') {
      if (out && !out.endsWith('\n')) out += '\n';
      const codeEl = el.querySelector('code');
      const langClass = codeEl?.className.match(/\blanguage-([a-zA-Z0-9_-]+)\b/)?.[1]
        || el.getAttribute('data-language')
        || '';
      const rawCode = extractRawCodeText((codeEl as HTMLElement | null) ?? el).replace(/\n+$/, '');
      out += `\`\`\`${langClass}\n${rawCode}\n\`\`\``;
      if (i < children.length - 1) out += '\n';
      continue;
    }

    if (tag === 'BLOCKQUOTE') {
      if (out && !out.endsWith('\n')) out += '\n';
      const inner = serializeChildList(el).replace(/\n+$/, '');
      const quoted = inner
        .split('\n')
        .map(line => (line ? `> ${line}` : '>'))
        .join('\n');
      out += quoted;
      if (i < children.length - 1) out += '\n';
      continue;
    }

    if (tag === 'UL' || tag === 'OL') {
      if (out && !out.endsWith('\n')) out += '\n';
      const items = Array.from(el.children).filter(c => c.tagName.toUpperCase() === 'LI');
      const lines = items.map((li, idx) => {
        const prefix = tag === 'OL' ? `${idx + 1}. ` : '- ';
        return prefix + serializeChildList(li).replace(/\n+$/, '');
      });
      out += lines.join('\n');
      if (i < children.length - 1) out += '\n';
      continue;
    }

    if (tag === 'DIV' || tag === 'P' || tag === 'LI') {
      if (out && !out.endsWith('\n')) out += '\n';
      if (!isEmptyBrSentinelBlock(el)) {
        out += serializeChildList(el);
      }
      if (i < children.length - 1 && !out.endsWith('\n')) {
        out += '\n';
      }
      continue;
    }

    if (tag === 'CODE') {
      const raw = extractRawCodeText(el);
      if (!raw) continue;
      if (raw.includes('`')) {
        out += `\`\` ${raw} \`\``;
      } else {
        out += `\`${raw}\``;
      }
      continue;
    }

    if (tag === 'B' || tag === 'STRONG') {
      out += wrapMarkdownMark(serializeChildList(el), '**', '**');
      continue;
    }

    if (tag === 'EM' || tag === 'I') {
      out += wrapMarkdownMark(serializeChildList(el), '__', '__');
      continue;
    }

    if (tag === 'U') {
      out += wrapMarkdownMark(serializeChildList(el), '<u>', '</u>');
      continue;
    }

    if (tag === 'DEL' || tag === 'S' || tag === 'STRIKE') {
      out += wrapMarkdownMark(serializeChildList(el), '~~', '~~');
      continue;
    }

    if (tag === 'A') {
      const inner = serializeChildList(el).replace(ZERO_WIDTH_RE, '');
      const href = (el.getAttribute('href') || '').trim();
      if (inner && href && isSafeMarkdownHref(href)) {
        out += `[${inner}](${href})`;
      } else {
        out += inner;
      }
      continue;
    }

    if (el.classList.contains('spoiler') || el.hasAttribute('data-spoiler')) {
      out += wrapMarkdownMark(serializeChildList(el), '||', '||');
      continue;
    }

    // Inline styled spans (fallback for contenteditable execCommand / paste quirks)
    if (tag === 'SPAN') {
      let inner = serializeChildList(el);
      const fw = el.style?.fontWeight;
      const fs = el.style?.fontStyle;
      const td = el.style?.textDecoration || el.style?.textDecorationLine || '';
      if (fw === 'bold' || Number(fw) >= 600) {
        inner = wrapMarkdownMark(inner, '**', '**');
      }
      if (fs === 'italic') {
        inner = wrapMarkdownMark(inner, '__', '__');
      }
      if (td.includes('underline')) {
        inner = wrapMarkdownMark(inner, '<u>', '</u>');
      }
      if (td.includes('line-through')) {
        inner = wrapMarkdownMark(inner, '~~', '~~');
      }
      out += inner;
      continue;
    }

    out += serializeChildList(el);
  }

  return out;
}

/**
 * Serialize a `contenteditable` rich editor DOM tree back into canonical Telegram Markdown.
 */
export function serializeEditorDomToMarkdown(root: HTMLElement | null | undefined): string {
  if (!root) return '';
  return serializeChildList(root)
    .replace(ZERO_WIDTH_RE, '')
    .replace(/\n+$/, '');
}

// --- Live Markdown Auto-Formatting Rule Matcher ---

export interface InlineMarkdownRuleMatch {
  format: 'bold' | 'italic' | 'strike' | 'spoiler' | 'code';
  raw: string;
  content: string;
  start: number;
  end: number;
}

const LIVE_MARKDOWN_RULES: Array<{
  format: InlineMarkdownRuleMatch['format'];
  delim: string;
  re: RegExp;
}> = [
  { format: 'bold', delim: '**', re: /(?:^|[^*])\*\*([^*\n]+)\*\*$/ },
  { format: 'italic', delim: '__', re: /(?:^|[^_])__([^_\n]+)__$/ },
  { format: 'strike', delim: '~~', re: /(?:^|[^~])~~([^~\n]+)~~$/ },
  { format: 'spoiler', delim: '||', re: /(?:^|[^|])\|\|([^|\n]+)\|\|$/ },
  { format: 'code', delim: '`', re: /(?:^|[^`])`([^`\n]+)`$/ },
];

/**
 * Match a completed inline Telegram Markdown sequence ending right at the caret
 * (e.g. `**hello**`, `__world__`, `~~old~~`, `||secret||`, `` `code` ``).
 */
export function matchLiveMarkdownRule(textBeforeCaret: string): InlineMarkdownRuleMatch | null {
  if (!textBeforeCaret) return null;
  for (const rule of LIVE_MARKDOWN_RULES) {
    const m = rule.re.exec(textBeforeCaret);
    if (!m) continue;
    const content = m[1];
    if (!content || !content.trim()) continue;
    const raw = `${rule.delim}${content}${rule.delim}`;
    const end = textBeforeCaret.length;
    const start = end - raw.length;
    return {
      format: rule.format,
      raw,
      content,
      start,
      end,
    };
  }
  return null;
}
