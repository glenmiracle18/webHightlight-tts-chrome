/**
 * List of HTML tags that we want to ignore when finding the top level readable elements
 * These elements should not be chosen while rendering the hover player
 */
const IGNORE_LIST = [
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BUTTON",
  "LABEL",
  "SPAN",
  "IMG",
  "PRE",
  "SCRIPT",
];

/**
 *  **TBD:**
 *  Implement a function that returns all the top level readable elements on the page, keeping in mind the ignore list.
 *  Start Parsing inside the body element of the HTMLPage.
 *  A top level readable element is defined as follows:
 *      1. The text node contained in the element should not be empty
 *      2. The element should not be in the ignore list (also referred as the block list)
 *      3. The element should not be a child of another element that has only one child.
 *            For example: <div><blockquote>Some text here</blockquote></div>. div is the top level readable element and not blockquote
 *      4. A top level readable element should not contain another top level readable element.
 *            For example: Consider the following HTML document:
 *            <body>
 *              <div id="root"></div>
 *              <div id="content-1">
 *                <article>
 *                  <header>
 *                    <h1 id="title">An Interesting HTML Document</h1>
 *                    <span>
 *                      <address id="test">John Doe</address>
 *                    </span>
 *                  </header>
 *                  <section></section>
 *                </article>
 *              </div>
 *            </body>;
 *            In this case, #content-1 should not be considered as a top level readable element.
 */
export function getTopLevelReadableElementsOnPage(): HTMLElement[] {
  const allElements = Array.from(
    document.body.querySelectorAll("*"),
  ) as HTMLElement[];
  const readableElements: HTMLElement[] = [];

  for (const element of allElements) {
    // Check if element is in ignore list
    if (IGNORE_LIST.includes(element.tagName)) {
      continue;
    }

    // Check if element has non empty text content
    const textContent = element.textContent?.trim();
    if (!textContent) {
      continue;
    }

    // Rule 3: Skip if element is a child of another element that has only one child
    // We want the parent in this case, not the child
    const parent = element.parentElement;
    if (parent && parent.children.length === 1 && parent !== document.body) {
      continue;
    }

    // Rule 4: A top level readable element should not contain another top level readable element
    // Check if this element has readable children that would also be candidates
    const hasReadableChildren = Array.from(element.children).some((child) => {
      return (
        child instanceof HTMLElement &&
        child.textContent?.trim() &&
        !IGNORE_LIST.includes(child.tagName)
      );
    });

    // If element has readable children, we need to decide which level to include
    // Include the element only if it doesn't have readable children, OR
    // if it's a container with multiple readable children (like a div with multiple paragraphs)
    if (!hasReadableChildren || element.children.length > 1) {
      // Additional check: make sure this element isn't already covered by a parent
      const isChildOfReadableElement = readableElements.some((existing) =>
        existing.contains(element),
      );

      if (!isChildOfReadableElement) {
        readableElements.push(element);
      }
    }
  }

  // Final pass: remove any elements that contain other elements in our list
  return readableElements.filter((element) => {
    return !readableElements.some(
      (other) => other !== element && element.contains(other),
    );
  });
}
