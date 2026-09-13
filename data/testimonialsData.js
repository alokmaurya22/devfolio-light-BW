/**
 * Recommendations shown on the site.
 *
 * The section renders nothing and hides itself while this array is empty, so it
 * is safe to ship like this until there are real quotes to publish.
 *
 * Only put words here that the named person actually wrote or explicitly
 * approved - a testimonial is the one thing on a portfolio that cannot be
 * paraphrased. A LinkedIn recommendation is the easiest source: it is already
 * written, already public, and already attributed.
 *
 * Entry shape:
 *   {
 *     quote:    "their words, one to three sentences",
 *     name:     "Full Name",
 *     role:     "Their Title",
 *     company:  "Company",
 *     link:     "https://www.linkedin.com/in/..."   // optional, proves it is real
 *     avatar:   "images/rec-name.webp",             // optional
 *     width: 96, height: 96                          // required if avatar is set
 *   }
 *
 * Drafts assembled from Alok's own written performance reviews are kept below,
 * commented out. They are a starting point to SEND for approval, not something
 * to publish as-is - the wording is not yet the reviewer's own.
 *
 *   {
 *     quote: "Alok took complete ownership of the TwynUp backend, the upload " +
 *            "pipeline and the server infrastructure, and delivered all of it. " +
 *            "Over 90% of his tasks land before the deadline, and when something " +
 *            "is going to slip he says so ahead of time.",
 *     name: "Manvendra Yadav",
 *     role: "Tech Head",
 *     company: "TwynUp",
 *     link: "https://www.linkedin.com/in/..."
 *   }
 */
const testimonialsData = [];
