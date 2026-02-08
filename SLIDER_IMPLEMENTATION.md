# Puzzle Slider Implementation

## Overview
Implemented a smooth sliding carousel system for puzzle navigation with content preloading for optimization.

## Key Changes

### 1. New Slider Architecture

**HTML Structure:**
```html
<div id="stage-container" class="stage-container">
  <div id="stage-slider" class="stage-slider">
    <!-- Slides are dynamically added here -->
    <div class="stage-slide active">Puzzle 1</div>
    <div class="stage-slide">Puzzle 2</div>
    <div class="stage-slide">Puzzle 3</div>
  </div>
</div>
```

**CSS:**
- `.stage-container`: Fixed container with overflow hidden
- `.stage-slider`: Horizontal flexbox that slides left/right
- `.stage-slide`: Individual puzzle slides (flex: 0 0 100%)
- Smooth transitions with GSAP animations

### 2. Preloading System

**Slide Cache:**
```typescript
let slideCache = new Map<number, HTMLElement>();
```

- Caches rendered puzzle slides
- Preloads current + adjacent puzzles (prev/next)
- Cleans up distant slides to save memory

**Functions:**
- `renderStageToSlide(index)`: Creates and caches a puzzle slide
- `preloadAdjacentStages(index)`: Preloads prev/next puzzles
- `cleanupDistantSlides(index)`: Removes puzzles >2 positions away

### 3. Smooth Transitions

**Animation Flow:**
1. User clicks next/prev or solves puzzle
2. Target slide is preloaded if not cached
3. GSAP animates the slider's x position
4. Previous slide fades out (opacity: 0.3 → 0)
5. New slide fades in (opacity: 0 → 1)
6. Cleanup runs to remove distant slides

**Parameters:**
- Duration: 0.6s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Direction-aware ('next' | 'prev')

### 4. Updated Navigation

```typescript
async function goToStage(index: number, direction: 'next' | 'prev' = 'next')
```

- Prevents multiple simultaneous transitions (isSliding flag)
- Renders new stage if not cached
- Preloads adjacent stages
- Animates transition
- Cleans up old slides
- Updates progress and navigation state

### 5. New Generator Functions

Each puzzle type now has two functions:

**HTML Generators:**
- `generatePuzzleHTML(stage, stageIndex)`: Returns HTML string
- `generateGlitchPuzzleHTML(stage, stageIndex)`: Returns HTML string
- etc.

**Interaction Initializers:**
- `initPuzzleInteractionsInSlide(stage, slideElement, stageIndex)`
- `initGlitchPuzzleInSlide(stage, slideElement, stageIndex)`
- etc.

All IDs are now scoped with stageIndex: `#puzzle-input-0`, `#puzzle-input-1`, etc.

### 6. Memory Optimization

**Cache Management:**
- Current puzzle + 1 on each side = 3 slides loaded
- Keeps slides within 2 positions
- Automatically cleans up when navigating further

**Example:**
- At puzzle 5: Keeps puzzles 3, 4, 5, 6, 7
- Move to puzzle 6: Removes puzzle 3, adds puzzle 8
- Move to puzzle 10: Removes puzzles 4-7, keeps 8-12

## Implementation Status

### ✅ Fully Implemented
- Slider architecture and CSS
- Preloading system
- Smooth GSAP transitions
- Cache management
- Standard puzzle type with memories
- Glitch puzzle type

### 🔄 Placeholder (Need Full Refactoring)
- Crossword
- Responsive Squeeze
- Emoji Puzzle
- Invisible Ink
- Love Wordle
- Fake 404
- Captcha Puzzle
- Date Gate
- Video Reveal

## How It Works (User Perspective)

1. **Initial Load:**
   - Puzzle 1 renders immediately
   - Puzzles 0 (if exists) and 2 preload silently

2. **Navigation:**
   - Click next → Smooth slide animation to puzzle 2
   - Puzzle 3 preloads in background
   - Puzzle 0 removed from memory (if >2 away)

3. **Solving:**
   - Submit correct answer
   - Success message shows
   - Memories revealed (if any)
   - Click "Next" → Slides to next puzzle

4. **Backtracking:**
   - Click prev → Slides back smoothly
   - Previous puzzle already cached (instant load)

## Performance Benefits

1. **Instant Navigation**: Adjacent puzzles preloaded
2. **Smooth Animations**: Hardware-accelerated GSAP transforms
3. **Memory Efficient**: Only 3-5 puzzles in memory at once
4. **No Flash**: Content preloaded before transition
5. **Direction-Aware**: Knows prev vs next context

## Technical Details

### Transform-based Animation
```typescript
gsap.to(stageSlider, {
  x: -stageIndex * slideWidth,
  duration: 0.6,
  ease: 'power2.inOut'
});
```

### Opacity Crossfade
```typescript
// Fade out previous
gsap.to(fromSlide, { opacity: 0.3, duration: 0.3 });

// Fade in new
gsap.fromTo(toSlide, 
  { opacity: 0 },
  { opacity: 1, duration: 0.4, delay: 0.2 }
);
```

### isSliding Guard
```typescript
if (isSliding) return; // Prevents transition overlaps
isSliding = true;
// ... animation ...
isSliding = false;
```

## Next Steps

To complete the implementation, each placeholder puzzle type needs:

1. **HTML Generator Function**
   - Extract HTML template from old render function
   - Add stageIndex to all IDs
   - Return string instead of setting innerHTML

2. **Interaction Initializer**
   - Query elements from slideElement (not document)
   - Use scoped IDs with stageIndex
   - Initialize event listeners
   - Setup PASS bypass

3. **Testing**
   - Verify transitions work smoothly
   - Check preloading is working
   - Ensure memory cleanup happens
   - Test back/forward navigation

## Example Refactor Pattern

**Before:**
```typescript
function renderMyPuzzle(stage: any) {
  const html = `<div id="my-input">...</div>`;
  stageContainer.innerHTML = html;
  
  const input = document.getElementById('my-input');
  input.addEventListener('change', ...);
}
```

**After:**
```typescript
function generateMyPuzzleHTML(stage: any, stageIndex: number): string {
  return `<div id="my-input-${stageIndex}">...</div>`;
}

function initMyPuzzleInSlide(stage: any, slideElement: HTMLElement, stageIndex: number) {
  const input = slideElement.querySelector(`#my-input-${stageIndex}`);
  input.addEventListener('change', ...);
}
```
