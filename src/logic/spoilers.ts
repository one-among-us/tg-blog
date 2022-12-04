import {marked} from "marked";
import sanitizeHtml from 'sanitize-html';

/**
 * Initialize clickable spoilers on the page
 */
export function initSpoilers()
{
  const spoilers = document.querySelectorAll('.spoiler')

  console.log("Spoilers initialized.")

  for (const spoiler of spoilers)
  {
    // Already initialized
    if (spoiler.classList.contains("spoiler-init")) continue
    spoiler.classList.add("spoiler-init")

    // Add event listener
    spoiler.addEventListener('click', () => spoiler.classList.toggle("spoiler-visible"))
  }
}

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
      // console.log(src, match)
      return {type: 'spoiler', raw: match[0], inner: this.lexer.inlineTokens(match[1].trim())};
    }
  },
  renderer(token) {
    return `<span class="spoiler"><span>${this.parser.parseInline(token.inner)}</span></span>`;
  }
};

marked.use({extensions: [spoilerExtension]})

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
    "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr",

    "img", "del"
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  },
  allowedClasses: {
    span: ['spoiler']
  },
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
  allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false
}

export function sanitize(html: string) { return sanitizeHtml(html, sanitizeOptions) }
export function mdParseInline(s: string) { return sanitize(marked.parseInline(s)) }
export function mdParse(s: string) { return sanitize(marked.parse(s)) }