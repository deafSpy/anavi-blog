/**
 * GameConfig.js - The "Brain" of the Treasure Hunt
 * 
 * Configure all stages here. The HuntEngine will map through this array.
 * 
 * Stage Types:
 * - 'puzzle': Puzzle with optional memories that reveal on solve
 * - 'date_gate': Blocks progress until a specific date
 * - 'video_reveal': Final video embed
 * 
 * Puzzle Stage Fields:
 * - prompt: Main question/prompt text
 * - subtext: Additional hint text
 * - answer: Correct answer (case insensitive for text)
 * - inputType: 'text' or 'numeric'
 * - inputPlaceholder: Placeholder for input
 * - hint: Optional hint shown on button click
 * - imageClue: Optional image URL for visual puzzles
 * - memories: Array of memory objects (revealed after solve)
 *   - Each memory: { image: 'url', livePhoto: 'gifUrl' } or just 'url' string
 * - successMessage: Message shown on correct answer
 */

// ============================================
// DEBUG MODE - Set to true to bypass Konami code
// ============================================
export const DEBUG_MODE = true;

// ============================================
// CUSTOM KONAMI CODE
// ============================================
export const KONAMI_SEQUENCE = [
  'h', 'i'
];

// ============================================
// HUNT STAGES CONFIGURATION
// ============================================
export const huntStages = [
  // ──────────────────────────────────────────
  // STAGE 1: Protocol Initiation
  // ──────────────────────────────────────────
  {
    id: 1,
    type: 'puzzle',
    prompt: "✧ Welcome, Anavi ✧",
    subtext: "To begin this journey, enter the date we started dating (DDMMYYYY)",
    inputType: 'numeric',
    answer: "23012021",
    inputPlaceholder: "DDMMYYYY",
    hint: "Oh come on, you know it...",
    memories: [
      { image: '/anniversary/memories/phase1/pic1.jpg' },
      { image: '/anniversary/memories/phase1/pic2.jpg' },
      { image: '/anniversary/memories/phase1/pic3.jpg' },
      { image: '/anniversary/memories/phase1/pic4.jpg' },
      { image: '/anniversary/memories/phase1/pic5.jpg' },
    ],
    // successMessage: "You remembered ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 2: Location Puzzle
  // ──────────────────────────────────────────
  {
    id: 2,
    type: 'puzzle',
    prompt: "✧ Our Special Place ✧",
    subtext: "Where did we go on our first date?",
    imageClue: '/anniversary/puzzles/clue1.jpg',
    inputType: 'text',
    answer: "piccadilly",
    inputPlaceholder: "Enter the place...",
    hint: "It was in central London, near a famous circus...",
    memories: [
      { image: '/anniversary/memories/phase2/pic1.jpg', livePhoto: '/anniversary/memories/phase2/pic1.gif' },
      { image: '/anniversary/memories/phase2/pic2.jpg' },
      { image: '/anniversary/memories/phase2/pic3.jpg' },
    ],
    successMessage: "I remember that day so well ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 3: Our Adventure Count
  // ──────────────────────────────────────────
  {
    id: 3,
    type: 'puzzle',
    prompt: "✧ Wanderlust Together ✧",
    subtext: "How many countries have we explored together?",
    inputType: 'numeric',
    answer: "7",
    inputPlaceholder: "Enter the number...",
    hint: "Count all our adventures across borders...",
    memories: [
      { image: '/anniversary/memories/phase3/pic1.jpg' },
      { image: '/anniversary/memories/phase3/pic2.jpg', livePhoto: '/anniversary/memories/phase3/pic2.gif' },
      { image: '/anniversary/memories/phase3/pic3.jpg' },
      { image: '/anniversary/memories/phase3/pic4.jpg' },
    ],
    successMessage: "And many more to come ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 4: Glitch Puzzle - Spotify Easter Egg
  // ──────────────────────────────────────────
  {
    id: 4,
    type: 'glitch_puzzle',
    prompt: "⚠ MEMORY FRAGMENT DETECTED",
    subtext: "The system seems to be malfunctioning... can you decode the hidden message?",
    inputType: 'text',
    answer: "music",
    inputPlaceholder: "decode...",
    hint: "Watch the fragments - they're trying to tell you something about our songs...",
    linkFragments: [
      'spotify:playlist/37i9d...',
      'open.spotify.com/track/...',
      'our-playlist-hidden...',
      'bit.ly/our-songs...'
    ],
    memories: [
      { image: '/anniversary/memories/phase4/pic1.jpg' },
      { image: '/anniversary/memories/phase4/pic2.jpg' },
    ],
    memoriesMessage: "Our soundtrack... ♡",
    successMessage: "You cracked the code ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 5: Glitch Puzzle - YouTube Easter Egg
  // ──────────────────────────────────────────
  {
    id: 5,
    type: 'glitch_puzzle',
    prompt: "▓▓▓ SIGNAL INTERFERENCE ▓▓▓",
    subtext: "A video message is trying to break through...",
    inputType: 'text',
    answer: "watch",
    inputPlaceholder: "what should you do?",
    hint: "click on the links :)",
    linkFragments: [
      'inspect',
      'element',
      'hidden-message.mp4',
      'anniversary-video...'
    ],
    successMessage: "Transmission received ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 6: Crossword Puzzle
  // ──────────────────────────────────────────
  {
    id: 6,
    type: 'crossword',
    title: "✧ Our Love Crossword ✧",
    subtitle: "Fill in the blanks with memories of us",
    grid: [
      ['L', 'O', 'V', 'E', '#', 'H', 'E', 'A', 'R', 'T'],
      ['#', '#', '#', '#', '#', 'O', '#', '#', '#', '#'],
      ['K', 'I', 'S', 'S', '#', 'M', 'E', 'M', 'O', 'R', 'Y'],
      ['#', '#', '#', '#', '#', 'E', '#', '#', '#', '#'],
      ['D', 'A', 'T', 'E', '#', '#', '#', '#', '#', '#'],
    ],
    acrossClues: [
      { num: 1, clue: "What we share together ♡" },
      { num: 2, clue: "Where our feelings live" },
      { num: 3, clue: "Something sweet we share" },
      { num: 4, clue: "Precious moments we keep" },
      { num: 5, clue: "Our special outings" },
    ],
    downClues: [
      { num: 2, clue: "Our cozy place together" },
    ],
  },

  // ──────────────────────────────────────────
  // STAGE 7: The "Responsive Squeeze" (Browser Window)
  // ──────────────────────────────────────────
  {
    id: 7,
    type: 'responsive_squeeze',
    prompt: "✧ Bridging the Distance ✧",
    subtext: "The world is too big. Shrink the window to bring us closer.",
    hint: "Try making your browser window narrower... like mobile width.",
    code: "CLOSER",
    targetWidth: 500,
    successMessage: "No distance can keep us apart ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 8: The "Emoji" Encryption
  // ──────────────────────────────────────────
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
  },

  // ──────────────────────────────────────────
  // STAGE 9: The "Invisible Ink" (Highlight to Reveal)
  // ──────────────────────────────────────────
  {
    id: 9,
    type: 'invisible_ink',
    prompt: "✧ Hidden in Plain Sight ✧",
    subtext: "Some things are only seen when you look for them. Try highlighting the empty space.",
    hiddenText: "The moments we share are written in invisible ink on my heart. REVEAL",
    code: "REVEAL",
    hint: "Click and drag to highlight the whitespace below...",
    successMessage: "You found what was always there ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 10: The "Love Wordle"
  // ──────────────────────────────────────────
  {
    id: 10,
    type: 'love_wordle',
    prompt: "✧ Our Word Game ✧",
    subtext: "Guess the 5-letter word in 6 tries. It's something special to us.",
    answer: "SMILE",
    hint: "Something I always want to see on your face...",
    successMessage: "You guessed it! That's what you give me every day ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 11: The "Fake 404" Page
  // ──────────────────────────────────────────
  {
    id: 11,
    type: 'fake_404',
    prompt: "Error 404: Life not found without you.",
    subtext: "Return to [Home] or enter code [FOREVER] to proceed.",
    answer: "FOREVER",
    inputPlaceholder: "Enter code...",
    hint: "The answer is literally in the error message...",
    successMessage: "Forever and always ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 12: The "Captcha" of Us
  // ──────────────────────────────────────────
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
  },

  // ──────────────────────────────────────────
  // STAGE 13: Date Gate (Anniversary Lock)
  // ──────────────────────────────────────────
  {
    id: 13,
    type: 'date_gate',
    unlockDate: '2026-01-28',
    lockedTitle: "✧ A Special Surprise Awaits ✧",
    lockedMessage: "Some treasures are worth waiting for. This unlocks on our special day.",
    clue: "Check back on January 28th...",
    unlockedMessage: "The wait is over ♡"
  },

  // ──────────────────────────────────────────
  // STAGE 14: Final Video Reveal
  // ──────────────────────────────────────────
  {
    id: 14,
    type: 'video_reveal',
    title: "✧ For You, With Love ✧",
    subtitle: "A message from my heart to yours...",
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    endMessage: "Happy Anniversary, my love ♡"
  }
];

// ============================================
// THEME CONFIGURATION
// ============================================
export const themeConfig = {
  primaryColor: '#d4a5d9',
  accentColor: '#e8b4bc',
  secondaryColor: '#b8a5d9',
  dangerColor: '#e07a7a',
  backgroundColor: '#1a1418',
};

