/**
 * Optimistic locking utility for concurrent edit detection.
 *
 * This implements a "warn but allow" strategy: if a record was modified
 * by another user since the current user loaded it, the update still
 * proceeds but includes a warning in the response.
 *
 * Server actions can optionally integrate this by:
 * 1. Accepting an `expectedUpdatedAt` from the form
 * 2. Checking it against the current DB value before updating
 * 3. Including the warning in the success response if detected
 */

export interface ConcurrentEditWarning {
  warning: string;
}

/**
 * Checks whether a record was modified since the user loaded it.
 *
 * @param currentUpdatedAt - The current `updatedAt` value from the database
 * @param expectedUpdatedAt - The `updatedAt` value the user had when they loaded the record
 * @returns A warning object if a concurrent edit is detected, or null if no conflict
 */
export function checkConcurrentEdit(
  currentUpdatedAt: number,
  expectedUpdatedAt: number | undefined | null
): ConcurrentEditWarning | null {
  // If no expected value provided, we can't perform the check
  if (expectedUpdatedAt === undefined || expectedUpdatedAt === null) {
    return null;
  }

  // If the record was modified after the user loaded it, warn
  if (currentUpdatedAt > expectedUpdatedAt) {
    return {
      warning:
        "This record was modified by another user since you loaded it. Your changes have been applied.",
    };
  }

  // No conflict detected
  return null;
}
