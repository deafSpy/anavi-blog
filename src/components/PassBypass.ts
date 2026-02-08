/**
 * PassBypass.ts
 * Bypass mechanism for puzzles - typing "PASS" anywhere on screen
 * (except in input boxes) automatically submits the correct answer
 */

const BYPASS_SEQUENCE = ['p', 'a', 's', 's'];
let bypassProgress: string[] = [];
let bypassCallback: (() => void) | null = null;

/**
 * Initialize the PASS bypass listener
 * @param onBypassTriggered - Callback function to execute when "PASS" is typed
 */
export function initPassBypass(onBypassTriggered: () => void): void {
  bypassCallback = onBypassTriggered;
  
  // Remove any existing listener to prevent duplicates
  document.removeEventListener('keydown', handleBypassKeydown);
  
  // Add the listener
  document.addEventListener('keydown', handleBypassKeydown);
}

/**
 * Remove the PASS bypass listener
 */
export function destroyPassBypass(): void {
  document.removeEventListener('keydown', handleBypassKeydown);
  bypassProgress = [];
  bypassCallback = null;
}

/**
 * Handle keydown events for bypass detection
 */
function handleBypassKeydown(e: KeyboardEvent): void {
  // Ignore if typing in an input, textarea, or contenteditable element
  const target = e.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  // Get the key and convert to lowercase
  const key = e.key.length === 1 ? e.key.toLowerCase() : '';
  
  // Only process single character keys
  if (!key) return;

  // Add to progress array
  bypassProgress.push(key);

  // Keep only the last N characters (where N is the sequence length)
  if (bypassProgress.length > BYPASS_SEQUENCE.length) {
    bypassProgress = bypassProgress.slice(-BYPASS_SEQUENCE.length);
  }

  // Check if the sequence matches
  const matches = BYPASS_SEQUENCE.every((char, i) => char === bypassProgress[i]);

  if (matches && bypassProgress.length === BYPASS_SEQUENCE.length) {
    // Reset progress
    bypassProgress = [];
    
    // Trigger the bypass callback
    if (bypassCallback) {
      bypassCallback();
    }
  }
}

/**
 * Reset the bypass progress (useful when switching puzzles)
 */
export function resetBypassProgress(): void {
  bypassProgress = [];
}
