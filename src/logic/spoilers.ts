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

    // Add event listener
    spoiler.addEventListener('click', () => 
    {
        spoiler.classList.toggle("spoiler-visible")
        console.log(`Spoiler clicked: ${spoiler}`);
    })
  })
}
