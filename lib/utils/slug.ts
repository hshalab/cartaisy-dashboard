/**
 * Generates a URL-safe slug from a given string
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a random suffix if needed
 * Used during database operations to ensure uniqueness
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[] = []): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    slug = `${baseSlug}-${randomSuffix}`;
    counter++;

    // Safety check to prevent infinite loops
    if (counter > 100) {
      throw new Error('Unable to generate unique slug after 100 attempts');
    }
  }

  return slug;
}
