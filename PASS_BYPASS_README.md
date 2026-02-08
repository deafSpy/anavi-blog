# PASS Bypass Feature

## Overview
A hidden bypass mechanism for all puzzles in the treasure hunt, similar to the Konami code. Typing "PASS" anywhere on the screen (outside of input fields) will automatically submit the correct answer and move to the next stage.

## How It Works

### User Experience
1. Navigate to any puzzle in the hunt
2. Type "PASS" anywhere on the screen (not in the password input box)
3. The correct answer is automatically filled in and submitted
4. The puzzle is marked as solved and you progress to the next stage

### Technical Implementation

#### Files Created/Modified

**New File: `src/components/PassBypass.ts`**
- Listens for keyboard events globally
- Tracks the sequence of keys typed: ['p', 'a', 's', 's']
- Ignores keypresses when user is typing in input fields, textareas, or contenteditable elements
- Triggers a callback function when "PASS" is detected
- Provides cleanup functions to prevent memory leaks

**Modified File: `src/hunt/HuntOverlay.astro`**
- Imports PassBypass functions
- Initializes bypass for each puzzle type
- Defines custom bypass behavior for each puzzle:
  - **Standard Puzzles**: Auto-fills the correct answer and submits the form
  - **Crossword**: Auto-fills all cells with correct letters and triggers check
  - **Responsive Squeeze**: Triggers the win condition without requiring window resize
  - **Emoji Puzzle**: Auto-fills all emoji answers and submits
  - **Invisible Ink**: Auto-reveals the text and submits the code
  - **Love Wordle**: Auto-completes with the correct word
  - **Fake 404**: Auto-fills and submits the correct code
  - **Captcha**: Auto-selects all correct images and submits
  - **Glitch Puzzle**: Auto-fills and submits the decoded answer
- Resets bypass progress when switching between stages
- Cleans up bypass listener when hunt is deactivated

### Key Features

1. **Non-intrusive**: Only activates when typing outside input fields
2. **Stage-specific**: Each puzzle type has custom bypass logic
3. **Clean**: Properly cleans up event listeners to prevent memory leaks
4. **Reset-safe**: Progress resets when switching puzzles
5. **Universal**: Works on all puzzle types in the hunt

### Puzzle Types Supported

✅ Standard Puzzle (with text/numeric input)  
✅ Glitch Puzzle  
✅ Crossword  
✅ Responsive Squeeze  
✅ Emoji Puzzle  
✅ Invisible Ink  
✅ Love Wordle  
✅ Fake 404  
✅ Captcha Puzzle  
❌ Date Gate (time-locked, bypass not applicable)  
❌ Video Reveal (no puzzle to bypass)  

### Usage Example

```typescript
// Initialize bypass for a puzzle
initPassBypass(() => {
  // Custom logic when "PASS" is typed
  const input = document.getElementById('puzzle-input') as HTMLInputElement;
  input.value = correctAnswer;
  form.submit();
});

// Clean up when leaving the puzzle
destroyPassBypass();

// Reset progress when switching puzzles
resetBypassProgress();
```

## Security Considerations

This is a **testing/debugging feature** meant for:
- Development testing
- QA validation
- Demo purposes
- Emergency access

For production, you may want to:
- Remove this feature entirely
- Protect it with additional authentication
- Only enable it in DEBUG_MODE
- Change the bypass sequence to something harder to guess

## Future Enhancements

Potential improvements:
- Make the bypass sequence configurable in GameConfig.js
- Add visual feedback when bypass is triggered
- Log bypass usage for analytics
- Add a secret admin panel to configure bypasses
- Support multiple bypass sequences for different purposes
