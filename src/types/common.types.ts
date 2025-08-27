// Common types used throughout the todo application

/**
 * Priority levels for todo items
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Array of all valid priority values - useful for validation
 */
export const PRIORITY_VALUES: Priority[] = ['low', 'medium', 'high'] as const;
