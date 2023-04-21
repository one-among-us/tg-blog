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
 * Initialize clickable spoilers on the page
 */
export function initSpoilers()
{
  const spoilers = document.querySelectorAll('.spoiler')

  console.log("Spoilers initialized.")

  spoilers.forEach(spoiler =>
  {
    // Toggle all spoilers at once if they are in the same post
    const post = findParent("post", spoiler)
    const siblingSpoilers = post.querySelectorAll(".spoiler")

    // Already initialized
    if (spoiler.classList.contains("spoiler-init")) return
    spoiler.classList.add("spoiler-init")

    // Add event listener
    spoiler.addEventListener('click', () => 
    {
        spoiler.classList.toggle("spoiler-visible")
        console.log(`Spoiler clicked: ${spoiler}`);

        // Toggle sibling spoilers if they are in the same post
        if (post) siblingSpoilers.forEach(it =>
        {
          if (it != spoiler) it.classList.toggle("spoiler-visible")
        })
    })
  })
}
