// ============================================================
// Yousef the Explorer — Day 1
// One single source for all the text, challenges, and answers.
// Simple English for an 8-year-old learning the language.
// ============================================================

export const PLAYER_NAME = 'Yousef'

// Scene order. Each item maps currentScene to a component + environment.
export const SCENE_SEQUENCE = [
  { id: 'wakeup', component: 'WakeUpScene', environment: 'room' },
  { id: 'animalSort', component: 'AnimalSortScene', environment: 'room', category: 'logic' },
  { id: 'breakfast', component: 'BreakfastScene', environment: 'kitchen', category: 'math' },
  { id: 'garden-science', component: 'GardenScienceScene', environment: 'garden', category: 'science' },
  { id: 'garden-english', component: 'GardenEnglishScene', environment: 'garden', category: 'english' },
  { id: 'garden-evidence', component: 'GardenEvidenceScene', environment: 'garden', category: 'logic' },
  { id: 'final', component: 'FinalScene', environment: 'reward' },
]

export const TOTAL_SCENES = SCENE_SEQUENCE.length

// ------------------------------------------------------------
// Scene 1 — Wake Up
// ------------------------------------------------------------
export const wakeUp = {
  intro: [
    'Yousef! You are awake. 🌞',
    'I am Captain Shareef — a real explorer.',
    'We have a big problem. 3 animals are missing from the city park!',
    'I need a smart explorer to help me. Are you ready?',
  ],
  choices: [
    { id: 'yes', label: 'Yes, I am ready! ✓', correct: true },
    { id: 'wait', label: 'I need a minute', correct: false },
  ],
  waitReply: 'Take your time, Yousef. 😊 Tap "Yes" when you are ready.',
  startReply: "Great job, champion! Let's start the adventure. 🧭",
}

// ------------------------------------------------------------
// Scene 2 — Sorting (drag and drop)
// ------------------------------------------------------------
export const animalSort = {
  intro: 'First, show me you know the animals. Every animal lives in a special place. Put each animal in the right home. 🐾',
  habitats: [
    { id: 'forest', label: 'Forest', emoji: '🌳', color: '#4CAF50' },
    { id: 'water', label: 'Water', emoji: '💧', color: '#4FC3F7' },
    { id: 'desert', label: 'Desert', emoji: '🏜️', color: '#E3C575' },
  ],
  animals: [
    { id: 'croc', label: 'Crocodile', emoji: '🐊', habitat: 'water' },
    { id: 'fox', label: 'Fox', emoji: '🦊', habitat: 'forest' },
    { id: 'camel', label: 'Camel', emoji: '🐪', habitat: 'desert' },
    { id: 'duck', label: 'Duck', emoji: '🦆', habitat: 'water' },
    { id: 'wolf', label: 'Wolf', emoji: '🐺', habitat: 'forest' },
    { id: 'lizard', label: 'Lizard', emoji: '🦎', habitat: 'desert' },
  ],
  wrongHints: {
    water: 'This animal loves the water! 💧 Try again.',
    forest: 'This one lives in the trees in the forest! 🌳 Try again.',
    desert: 'This one lives in the hot sand in the desert! 🏜️ Try again.',
  },
  successReply: 'Well done, Yousef! 🎉 You put every animal in the right home.',
  followUp: {
    question: 'The animals in the water — what is the same about them?',
    choices: [
      { id: 'swim', label: 'They swim 🏊', correct: true },
      { id: 'fish', label: 'They eat fish 🐟', correct: false },
      { id: 'feathers', label: 'They have feathers 🪶', correct: false },
    ],
    correctReply: "That's right! They all swim in the water. Smart explorer! 🌟",
    wrongReply: 'Nice thinking! But think again — what do they all do in the water?',
  },
}

// ------------------------------------------------------------
// Scene 3 — Breakfast and Math
// ------------------------------------------------------------
export const breakfast = {
  intro: 'Good morning, my dear Yousef. ❤️ Come help me make breakfast, and a little math too.',
  challenges: [
    {
      id: 'subtraction',
      speaker: 'mom',
      prompt: 'Yousef, we have 12 eggs. We will use 4. How many eggs are left?',
      visual: { type: 'eggs', total: 12, removed: 4 },
      inputMode: 'both', // can type or pick
      choices: [
        { id: '6', label: '6', correct: false },
        { id: '8', label: '8', correct: true },
        { id: '10', label: '10', correct: false },
      ],
      answer: '8',
      correctReply: 'Yes! 12 minus 4 is 8 eggs. 🥚',
      wrongReply: 'Try again, champion — if we take 4 from 12, count what is left. 😊',
    },
    {
      id: 'multiplication',
      speaker: 'mom',
      prompt: 'We will make pancakes. Each pancake needs 2 spoons of flour. We want 6 pancakes — how many spoons do we need?',
      visual: { type: 'pancakes', count: 6, perItem: 2 },
      inputMode: 'choices',
      choices: [
        { id: '8', label: '8', correct: false },
        { id: '10', label: '10', correct: false },
        { id: '12', label: '12', correct: true },
      ],
      answer: '12',
      correctReply: 'Great! 6 times 2 is 12 spoons. 🥞',
      wrongReply: 'Think with me — 2 spoons for each one, and we have 6. Count them! 😊',
    },
    {
      id: 'fraction',
      speaker: 'mom',
      prompt: 'The recipe needs half a cup of milk. If we want double — how much do we need?',
      visual: { type: 'cup' },
      inputMode: 'choices',
      choices: [
        { id: 'half', label: 'Half a cup 🥛', correct: false },
        { id: 'full', label: 'A full cup 🥛', correct: true },
        { id: 'two', label: 'Two cups 🥛🥛', correct: false },
      ],
      answer: 'full',
      correctReply: 'Well done! Half + half = one full cup. That is double. 🌟',
      wrongReply: 'Almost! Half a cup two times is how much? 😊',
    },
  ],
}

// ------------------------------------------------------------
// Scene 4 — Science (Floating and Sinking)
// ------------------------------------------------------------
export const floatingSink = {
  intro: 'A good explorer knows science. See this pond? We will do an important test. 🔬',
  predictPrompt: 'Before we try — what do you think for each thing? Will it float or sink?',
  items: [
    { id: 'leaf', label: 'Leaf', emoji: '🍃', floats: true },
    { id: 'stone', label: 'Small stone', emoji: '🪨', floats: false },
    { id: 'stick', label: 'Wooden stick', emoji: '🪵', floats: true },
    { id: 'coin', label: 'Coin', emoji: '🪙', floats: false },
    { id: 'feather', label: 'Feather', emoji: '🪶', floats: true },
  ],
  floatLabel: 'Float',
  sinkLabel: 'Sink',
  resultIntro: "Let's see! We put each thing in the water. 💦",
  conclusion: {
    question: 'What did you notice? The light things —',
    choices: [
      { id: 'float', label: 'They float', correct: true },
      { id: 'sink', label: 'They sink', correct: false },
      { id: 'move', label: 'They move', correct: false },
    ],
    correctReply: 'Yes! Light things float on top of the water. 🌟',
    wrongReply: 'Look again at the feather and the leaf — they are light, what did they do?',
  },
  thinking: {
    question: 'Why did the wood float and the stone sink?',
    choices: [
      { id: 'lighter', label: 'The wood is lighter than water', correct: true },
      { id: 'bigger', label: 'The wood is bigger than the stone', correct: false },
      { id: 'black', label: 'The stone is black', correct: false },
    ],
    correctReply: 'Genius! 🧠 The wood is lighter than water, so it floats.',
    wrongReply: 'Think about weight — which is lighter, the wood or the stone?',
  },
}

// ------------------------------------------------------------
// Scene 5 — English Riddles
// ------------------------------------------------------------
export const englishRiddles = {
  intro: 'I found 3 papers on the trees! Each paper has a riddle. Can you solve them? 📜',
  riddles: [
    {
      id: 'bat',
      lines: ['I sleep during the day.', 'I fly at night.', 'I use sound to find my way.', 'What am I?'],
      vocab: [{ word: 'sound', meaning: 'what we hear' }],
      choices: [
        { id: 'bat', label: 'Bat', emoji: '🦇', correct: true },
        { id: 'owl', label: 'Owl', emoji: '🦉', correct: false },
        { id: 'eagle', label: 'Eagle', emoji: '🦅', correct: false },
      ],
      correctReply: 'Yes Yousef! It is a Bat. 🦇 Great reading!',
      wrongReply: 'Good try Yousef! It flies at night and uses sound. Think again. 🌙',
    },
    {
      id: 'zebra',
      lines: ['I have black and white stripes.', 'I live in Africa.', 'I look like a horse but I am not.', 'What am I?'],
      vocab: [{ word: 'stripes', meaning: 'long lines' }],
      choices: [
        { id: 'zebra', label: 'Zebra', emoji: '🦓', correct: true },
        { id: 'tiger', label: 'Tiger', emoji: '🐯', correct: false },
        { id: 'panda', label: 'Panda', emoji: '🐼', correct: false },
      ],
      correctReply: 'Amazing Yousef! It is a Zebra. 🦓 You are so smart!',
      wrongReply: 'Good try Yousef! Black and white stripes, like a horse. Try again. 🐴',
    },
    {
      id: 'elephant',
      lines: [
        'I am the largest animal on land.',
        'I use my nose to drink water and pick up things.',
        'I never forget.',
        'What am I?',
      ],
      vocab: [
        { word: 'largest', meaning: 'the biggest' },
        { word: 'forget', meaning: 'to not remember' },
      ],
      choices: [
        { id: 'rhino', label: 'Rhino', emoji: '🦏', correct: false },
        { id: 'elephant', label: 'Elephant', emoji: '🐘', correct: true },
        { id: 'hippo', label: 'Hippo', emoji: '🦛', correct: false },
      ],
      correctReply: 'Wonderful Yousef! It is an Elephant. 🐘 The largest on land!',
      wrongReply: 'Good try Yousef! The largest animal, with a long nose. Think again. 🐘',
    },
  ],
}

// ------------------------------------------------------------
// Scene 6 — Clue Analysis
// ------------------------------------------------------------
export const evidence = {
  intro: 'Now we have all the clues. We must find the 3 animals that are missing. 🔍',
  clues: [
    { id: 'tracks', label: 'Very big footprints', emoji: '👣' },
    { id: 'hair', label: 'Black and white hair on the fence', emoji: '🦓' },
    { id: 'feathers', label: 'Big brown feathers on the ground', emoji: '🪶' },
    { id: 'drag', label: 'A heavy drag mark on the sand', emoji: '〰️' },
  ],
  question: 'From these animals — pick the 3 that are missing',
  suspects: [
    { id: 'elephant', label: 'Elephant', emoji: '🐘', guilty: true },
    { id: 'zebra', label: 'Zebra', emoji: '🦓', guilty: true },
    { id: 'eagle', label: 'Eagle', emoji: '🦅', guilty: true },
    { id: 'lion', label: 'Lion', emoji: '🦁', guilty: false },
    { id: 'bear', label: 'Bear', emoji: '🐻', guilty: false },
  ],
  wrongReply: 'Look at the clues carefully, Yousef. The big footprints, the black and white hair, and the brown feathers. 🔍',
  verification: [
    'Big footprints = the Elephant ✓ 🐘',
    'Black and white hair = the Zebra ✓ 🦓',
    'Big brown feathers = the Eagle ✓ 🦅',
  ],
  successReply: 'You solved the case, Yousef! 🎉 You are a real explorer!',
  finalQuestion: {
    question: 'Why are the Lion and the Bear not the missing animals?',
    choices: [
      { id: 'noevidence', label: 'There are no clues about them', correct: true },
      { id: 'nogarden', label: 'They do not live in the park', correct: false },
      { id: 'sleeping', label: 'They are sleeping', correct: false },
    ],
    correctReply: 'Exactly! There is no clue about them. Great thinking! 🧠',
    wrongReply: 'Think again — did we find any clue about the Lion or the Bear?',
  },
}

// ------------------------------------------------------------
// Scene 7 — Reward and Explorer Notebook
// ------------------------------------------------------------
export const final = {
  intro: [
    'Yousef — you did something not everyone can do! 🏆',
    'You sorted the animals, learned science, solved the clues, and read the riddles by yourself.',
    'You are now a real first-class explorer! 🧭',
  ],
  badges: [
    { id: 'animals', label: 'Animal Explorer — Level 1', emoji: '🐾' },
    { id: 'float', label: 'Floating Scientist', emoji: '💧' },
    { id: 'riddles', label: 'Riddle Reader', emoji: '📜' },
    { id: 'detective', label: 'Clue Detective', emoji: '🔍' },
  ],
  reflection: {
    question: 'What is the best thing you learned today?',
    choices: [
      { id: 'wood', label: 'That wood floats', correct: false },
      { id: 'bat', label: 'That a bat uses sound', correct: false },
      { id: 'elephant', label: 'That an elephant is the biggest animal on land', correct: false },
      { id: 'all', label: 'All of it', correct: true },
    ],
    correctReply: 'Exactly, Yousef! You learned so much today. I am so proud of you! 🌟',
    wrongReply: 'Yes! But not only that... you learned this and much more today! 😊',
  },
  finishLabel: 'I finished Day 1! 🎉',
}
