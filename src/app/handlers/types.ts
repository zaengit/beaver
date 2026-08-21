/**
 * Shared handler types — imported by all handler modules.
 */

/** Current user session (null = unauthenticated). */
export type Session = { user: { id: string } } | null
