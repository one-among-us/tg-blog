/**
 * Find the parent element with the given class, or null if not found
 *
 * @param cls Class to find
 * @param el Child element
 */
function findParent(cls: string, el: Element): Element | null
{
  // noinspection StatementWithEmptyBodyJS
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}

/**
 * Find the parent element with the given tag, or null if not found
 *
 * @param tag
 * @param el
 */
function findParentByTag(tag: string, el: Element): Element | null
{
  // noinspection StatementWithEmptyBodyJS
  while ((el = el.parentElement) && el.tagName.toLowerCase() != tag);
  return el;
}

/**
 * Initialize clickable spoilers on the page
 */
export function initSpoilers()
{
  if (typeof document === 'undefined') return
  const spoilers = document.querySelectorAll('.spoiler')

  spoilers.forEach(spoiler =>
  {
    // Leave live rich-editor spoilers untouched
    if (typeof spoiler.closest === 'function' && spoiler.closest('[contenteditable="true"]')) return

    // Already initialized
    if (spoiler.classList.contains("spoiler-init")) return
    spoiler.classList.add("spoiler-init")

    // Wrap bare text/inline nodes in an inner <span> so outer text-decoration (e.g. <s>/<del>)
    // cannot propagate onto direct text inside .spoiler above the spoiler background
    const first = spoiler.firstChild
    const alreadyWrappedInSpan =
      spoiler.childNodes.length === 1 &&
      first !== null &&
      first.nodeType === 1 &&
      (first as Element).tagName.toUpperCase() === "SPAN"
    if (!alreadyWrappedInSpan && first) {
      const inner = document.createElement("span")
      inner.className = "tgb-spoiler-inner"
      while (spoiler.firstChild) {
        inner.appendChild(spoiler.firstChild)
      }
      spoiler.appendChild(inner)
    }

    // Toggle all spoilers at once if they are in the same post
    const post = findParent("post", spoiler)
    const siblingSpoilers = post?.querySelectorAll(".spoiler")

    function handleSpoiler()
    {
      spoiler.classList.toggle("spoiler-visible")

      // Toggle sibling spoilers if they are in the same post
      if (post) siblingSpoilers?.forEach(it =>
      {
        if (it != spoiler) it.classList.toggle("spoiler-visible")
      })
    }

    // If the spoiler is wrapped in a link, handle link clicks specially
    const link = findParentByTag("a", spoiler)
    if (link)
    {
      link.addEventListener('click', (e) =>
      {
        // If the spoiler is already visible, let the link work as normal
        if (spoiler.classList.contains("spoiler-visible")) return

        // If not, treat the click as a spoiler click
        handleSpoiler()
        e.preventDefault()
      })

      return
    }

    // Add event listener
    spoiler.addEventListener('click', handleSpoiler)
  })
}
