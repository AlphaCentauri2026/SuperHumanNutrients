// Application constants to reduce magic numbers and improve maintainability

export const AI_CONSTANTS = {
  TIMEOUTS: {
    FLASH_MODEL: 10000, // 10 seconds
    PRO_MODEL: 15000, // 15 seconds
  },
  COMBINATIONS: {
    TARGET_COUNT: 10,
    MIN_TEXT_LENGTH: 10,
    MAX_DISPLAY_LENGTH: 500,
  },
  DELAYS: {
    RECYCLE_ANIMATION: 500, // 500ms
  },
} as const;

export const UI_CONSTANTS = {
  GRADIENTS: [
    'from-blue-500 to-purple-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-blue-600',
    'from-yellow-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
  ],
} as const;
