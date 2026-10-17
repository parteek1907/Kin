export type CanonicalCommand =
  | 'MENU'
  | 'MY_REQUIREMENTS'
  | 'NEW'
  | 'MORE'
  | 'EDIT'
  | 'CLOSE'
  | 'LANGUAGE'
  | 'HELP'
  | 'STOP'
  | 'START'
  | 'DELETE_MY_DATA'
  | 'UNKNOWN';

const ALIASES: Record<CanonicalCommand, string[]> = {
  MENU: ['menu', 'hi', 'hello', 'hey', 'namaste', 'options', 'suchi', 'menu button'],
  MY_REQUIREMENTS: ['my requirements', 'requirements', 'my requests', 'active requests', 'meri requirements', 'status', 'intents', 'my intents'],
  NEW: ['new', 'post', 'nayi', 'naya', 'chahiye', 'post requirement', 'new requirement', 'create requirement'],
  MORE: ['more', 'next', 'aur', 'aur dikhao', 'show more', 'show 5 more', 'next candidates'],
  EDIT: ['edit', 'change', 'update', 'badlo', 'refine', 'refine requirement'],
  CLOSE: ['close', 'done', 'band karo', 'khatam', 'filled', 'close requirement'],
  LANGUAGE: ['language', 'bhasha', 'lang', 'hindi', 'english', 'hinglish'],
  HELP: ['help', 'madad', 'support', 'kaise kaam karta hai', 'how does it work', 'guide', 'info'],
  STOP: ['stop', 'unsubscribe', 'ruko', 'opt out', 'block'],
  START: ['start', 'shuru', 'subscribe', 'opt in', 'unstop'],
  DELETE_MY_DATA: ['delete my data', 'delete data', 'remove me', 'data delete', 'erase data'],
  UNKNOWN: [],
};

/**
 * Resolves raw text into a canonical command using multi-lingual aliases.
 */
export function resolveCommand(rawText?: string): CanonicalCommand {
  if (!rawText) return 'UNKNOWN';
  const clean = rawText.trim().toLowerCase();

  for (const [cmd, list] of Object.entries(ALIASES)) {
    if (list.includes(clean)) {
      return cmd as CanonicalCommand;
    }
  }

  // Exact command name matches
  const upper = clean.toUpperCase().replace(/\s+/g, '_');
  if (upper in ALIASES) {
    return upper as CanonicalCommand;
  }

  return 'UNKNOWN';
}
