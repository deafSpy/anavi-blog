# New Puzzle Implementations

This document describes the 6 new puzzles that have been added to the treasure hunt game.

## Overview

The following puzzles have been implemented as stages 7-12 in the hunt:

1. **Responsive Squeeze** (Stage 7) - Browser window resize puzzle
2. **Emoji Encryption** (Stage 8) - Decode emoji sequences
3. **Invisible Ink** (Stage 9) - Highlight hidden text
4. **Love Wordle** (Stage 10) - Wordle-style word game
5. **Fake 404** (Stage 11) - Error page with hidden code
6. **Captcha of Us** (Stage 12) - Photo selection puzzle

---

## 1. The "Responsive Squeeze" (Browser Window)

**Stage 7**

### Concept
A visual metaphor for long distance - the user must make their browser window narrow to "bring you closer."

### Mechanics
- Monitors `window.innerWidth` in real-time
- Shows current window width to the user
- When width drops below 500px (configurable), reveals a code
- Uses CSS media queries for responsive behavior

### Configuration (GameConfig.js)
```javascript
{
  id: 7,
  type: 'responsive_squeeze',
  prompt: "✧ Bridging the Distance ✧",
  subtext: "The world is too big. Shrink the window to bring us closer.",
  hint: "Try making your browser window narrower... like mobile width.",
  code: "CLOSER",
  targetWidth: 500,
  successMessage: "No distance can keep us apart ♡"
}
```

### Customization
- `code`: The code revealed when solved
- `targetWidth`: Pixel width threshold (default: 500)
- `prompt`, `subtext`, `hint`: Text content

---

## 2. The "Emoji" Encryption

**Stage 8**

### Concept
Decode emoji sequences that represent memories or inside jokes.

### Mechanics
- Multiple emoji puzzles on one screen
- Each has emojis + equals sign + input field
- User must decode all correctly to proceed
- Visual feedback (green border) for correct answers

### Configuration (GameConfig.js)
```javascript
{
  id: 8,
  type: 'emoji_puzzle',
  prompt: "✧ Decode Our Memories ✧",
  subtext: "Each emoji sequence tells a story. Can you remember?",
  puzzles: [
    {
      emojis: "🌧️ + ☕ + 🇬🇧",
      answer: "london coffee",
      placeholder: "Enter the memory..."
    },
    {
      emojis: "🥘 + 🌶️ + 🥵",
      answer: "mirchi ka salan",
      placeholder: "That spicy dish..."
    }
  ],
  hint: "Think about our adventures together...",
  successMessage: "You remember everything ♡"
}
```

### Customization
- Add or remove puzzles from the `puzzles` array
- Each puzzle needs `emojis`, `answer`, and `placeholder`
- Answers are case-insensitive

---

## 3. The "Invisible Ink" (Highlight to Reveal)

**Stage 9**

### Concept
Old school spy trick - text is white on white background, revealed by highlighting.

### Mechanics
- Text with `color: transparent` initially
- User must click and drag to highlight
- On selection, text becomes visible
- Hidden code word appears in the text
- Input form appears after revelation

### Configuration (GameConfig.js)
```javascript
{
  id: 9,
  type: 'invisible_ink',
  prompt: "✧ Hidden in Plain Sight ✧",
  subtext: "Some things are only seen when you look for them. Try highlighting the empty space.",
  hiddenText: "The moments we share are written in invisible ink on my heart. REVEAL",
  code: "REVEAL",
  hint: "Click and drag to highlight the whitespace below...",
  successMessage: "You found what was always there ♡"
}
```

### Customization
- `hiddenText`: The full text that will be revealed (include the code word)
- `code`: The answer they need to enter (should be in the hidden text)

---

## 4. The "Love Wordle"

**Stage 10**

### Concept
A hardcoded Wordle clone for a word special to your relationship.

### Mechanics
- 6 attempts to guess a 5-letter word
- Color-coded feedback: green (correct position), yellow (in word), gray (not in word)
- On-screen keyboard + physical keyboard support
- Auto-resets after failed attempts

### Configuration (GameConfig.js)
```javascript
{
  id: 10,
  type: 'love_wordle',
  prompt: "✧ Our Word Game ✧",
  subtext: "Guess the 5-letter word in 6 tries. It's something special to us.",
  answer: "SMILE",
  hint: "Something I always want to see on your face...",
  successMessage: "You guessed it! That's what you give me every day ♡"
}
```

### Customization
- `answer`: Must be exactly 5 letters, uppercase recommended
- Choose a word meaningful to your relationship

---

## 5. The "Fake 404" Page

**Stage 11**

### Concept
A deliberate dead-end that looks like an error page, but contains a love note.

### Mechanics
- Styled to look like a standard 404 error
- Error message is actually a romantic message
- Code is hidden in plain sight in the message
- Simple text input to proceed

### Configuration (GameConfig.js)
```javascript
{
  id: 11,
  type: 'fake_404',
  prompt: "Error 404: Life not found without you.",
  subtext: "Return to [Home] or enter code [FOREVER] to proceed.",
  answer: "FOREVER",
  inputPlaceholder: "Enter code...",
  hint: "The answer is literally in the error message...",
  successMessage: "Forever and always ♡"
}
```

### Customization
- `prompt`: Main error message (can be romantic)
- `subtext`: Additional hint text
- `answer`: The code to proceed (should be in the message)

---

## 6. The "Captcha" of Us

**Stage 12**

### Concept
Parody of "Select all traffic lights" bot checks, but with your photos.

### Mechanics
- 3x3 grid of photos
- User clicks to select/deselect images
- Must select all correct images (e.g., "holding hands")
- Visual feedback with checkmarks
- Validates selection matches expected images

### Configuration (GameConfig.js)
```javascript
{
  id: 12,
  type: 'captcha_puzzle',
  prompt: "✧ Verify You're My Girlfriend ✧",
  subtext: "Select all images where we are holding hands.",
  images: [
    { url: '/anniversary/captcha/img1.jpg', isCorrect: true },
    { url: '/anniversary/captcha/img2.jpg', isCorrect: false },
    { url: '/anniversary/captcha/img3.jpg', isCorrect: true },
    { url: '/anniversary/captcha/img4.jpg', isCorrect: false },
    { url: '/anniversary/captcha/img5.jpg', isCorrect: true },
    { url: '/anniversary/captcha/img6.jpg', isCorrect: false },
    { url: '/anniversary/captcha/img7.jpg', isCorrect: true },
    { url: '/anniversary/captcha/img8.jpg', isCorrect: false },
    { url: '/anniversary/captcha/img9.jpg', isCorrect: false },
  ],
  hint: "Look closely at each photo...",
  successMessage: "Identity verified: You're the one ♡"
}
```

### Setup Required
You need to add 9 photos to `/public/anniversary/captcha/`:
- Name them `img1.jpg` through `img9.jpg`
- Set `isCorrect: true` for images matching your prompt (e.g., holding hands)
- Set `isCorrect: false` for other images
- Recommended: Square aspect ratio, 400x400px+

See `/public/anniversary/captcha/README.md` for details.

### Customization
- `subtext`: Change the selection criteria (holding hands, smiling, etc.)
- `images`: Adjust which images are correct based on your photos
- Can use different number of correct images

---

## Styling

All puzzles use the existing hunt theme (pinkish-purple romantic theme) with custom styles in `/src/styles/hunt.css`.

### CSS Classes Added
- `.responsive-squeeze-puzzle`, `.squeeze-status`, `.squeeze-reveal`
- `.emoji-puzzle`, `.emoji-puzzle-item`, `.emoji-sequence`
- `.invisible-ink-puzzle`, `.invisible-text`, `.invisible-text-container`
- `.love-wordle-puzzle`, `.wordle-grid`, `.wordle-cell`, `.wordle-keyboard`
- `.fake-404-puzzle`, `.error-404-container`, `.error-code`
- `.captcha-puzzle`, `.captcha-grid`, `.captcha-image-container`

### Mobile Responsive
All puzzles are mobile-responsive with breakpoints at 640px.

---

## Testing

To test the puzzles:

1. Set `DEBUG_MODE = true` in `GameConfig.js` (skip Konami code)
2. Navigate to `/hunt`
3. Use navigation arrows to jump between stages without solving
4. Test each puzzle's mechanics
5. Remember to set `DEBUG_MODE = false` before deployment

---

## Files Modified

- `/src/hunt/GameConfig.js` - Added 6 new stage configurations
- `/src/hunt/HuntOverlay.astro` - Added render functions for all puzzles
- `/src/styles/hunt.css` - Added styles for all new puzzles
- `/public/anniversary/captcha/` - Created directory for captcha images

---

## Notes

- All puzzles follow the existing hunt architecture
- TypeScript types are properly annotated
- Error handling includes visual shake animations
- Success messages use the existing overlay system
- All puzzles auto-advance to the next stage on completion
- Hints are optional for all puzzles
