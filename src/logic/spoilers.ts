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
  const spoilers = document.querySelectorAll('.spoiler')

  console.log("Spoilers initialized.")

  spoilers.forEach(spoiler =>
  {
    // Already initialized
    if (spoiler.classList.contains("spoiler-init")) return
    spoiler.classList.add("spoiler-init")

    // Toggle all spoilers at once if they are in the same post
    const post = findParent("post", spoiler)
    const siblingSpoilers = post.querySelectorAll(".spoiler")

    function handleSpoiler()
    {
      spoiler.classList.toggle("spoiler-visible")
      console.log(`Spoiler clicked: ${spoiler}`);

      // Toggle sibling spoilers if they are in the same post
      if (post) siblingSpoilers.forEach(it =>
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
