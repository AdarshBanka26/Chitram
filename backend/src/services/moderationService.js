// Text-based content moderation — no vision model needed.
// Checks combined work text against blocked and warning word lists.

const BLOCKED = [
  'nude', 'naked', 'porn', 'pornographic', 'xxx', 'nsfw', 'explicit',
  'gore', 'graphic violence', 'snuff', 'child abuse', 'cp',
  'bomb making', 'weapon of mass',
];

const WARNING = [
  'violence', 'blood', 'self-harm', 'suicide', 'drugs', 'hate speech',
  'weapon', 'kill', 'death',
];

/**
 * Check title + description + tags + textContent for policy violations.
 * @returns {{ status: 'safe'|'warning'|'blocked', reason: string|null }}
 */
export const moderateContent = ({ title = '', description = '', tags = [], textContent = '' }) => {
  const combined = [title, description, tags.join(' '), textContent.slice(0, 3000)]
    .join(' ')
    .toLowerCase();

  for (const word of BLOCKED) {
    if (combined.includes(word)) {
      return {
        status: 'blocked',
        reason: 'Your content may violate our community guidelines and could not be published.',
      };
    }
  }

  for (const word of WARNING) {
    if (combined.includes(word)) {
      return {
        status: 'warning',
        reason: 'Your content contains sensitive themes. Please ensure it follows community guidelines.',
      };
    }
  }

  return { status: 'safe', reason: null };
};
