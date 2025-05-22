import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes intelligently.
 * @param {...(string | null | undefined | false | 0 | Record<string, boolean | null | undefined>)} inputs - Class names or objects to combine.
 * @returns {string} The combined class name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
