import sanitizeHtml from "sanitize-html";

/**
 * Input Sanitization Utility
 * 
 * Protects against XSS (Cross-Site Scripting) attacks by sanitizing user-generated content.
 * All user input from forums, chat messages, and profiles is processed through these functions
 * before being stored in the database.
 * 
 * Example attack prevented:
 * Input:  '<script>alert("stolen cookies: " + document.cookie)</script>Hello'
 * Output: 'Hello'
 */

/**
 * Sanitizes user input to prevent XSS attacks.
 * Allows basic formatting but removes potentially dangerous HTML/scripts.
 *
 * @param dirty - The unsanitized user input
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [], // No HTML tags allowed - plain text only
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

/**
 * Sanitizes user input but allows basic text formatting.
 * Use this for content where users might want basic formatting (bold, italic, links).
 *
 * @param dirty - The unsanitized user input
 * @returns Sanitized string with basic formatting preserved
 */
export function sanitizeWithFormatting(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br"],
    allowedAttributes: {
      a: ["href"],
    },
    allowedSchemes: ["http", "https"],
    disallowedTagsMode: "discard",
  });
}
