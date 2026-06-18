// ============================================================
// اليوم 2 — مغامرة تحت البحر: مخلوقات الشُّعب المرجانية المختفية.
// نفس بنية اليوم الأول (7 مشاهد) بمحتوى جديد عن البحر.
// ============================================================

const day2 = {
  id: 2,
  title: 'مغامرة تحت البحر',
  subtitle: 'Under the Sea',
  emoji: '🌊',
  color: '#0288D1',

  sceneSequence: [
    { id: 'wakeup', component: 'WakeUpScene', environment: 'beach' },
    { id: 'animalSort', component: 'AnimalSortScene', environment: 'ocean', category: 'logic' },
    { id: 'breakfast', component: 'BreakfastScene', environment: 'beach', category: 'math' },
    { id: 'garden-science', component: 'GardenScienceScene', environment: 'ocean', category: 'science' },
    { id: 'garden-english', component: 'GardenEnglishScene', environment: 'ocean', category: 'english' },
    { id: 'garden-evidence', component: 'GardenEvidenceScene', environment: 'ocean', category: 'logic' },
    { id: 'final', component: 'FinalScene', environment: 'reward' },
  ],

  wakeUp: {
    intro: [
      'Good morning, Yousef! Welcome to the beach. 🏖️',
      'It is Captain Shareef again. We have a new sea mystery!',
      '3 sea animals are missing from the coral reef! 🪸',
      'Put on your diving mask. Are you ready to dive with me?',
    ],
    choices: [
      { id: 'yes', label: 'Yes, let us dive! ✓', correct: true },
      { id: 'wait', label: 'I need a minute', correct: false },
    ],
    waitReply: 'No problem, Yousef. 😊 Tap "Yes" when you are ready to dive.',
    startReply: "Splash! Let's go under the sea, brave diver! 🤿",
  },

  animalSort: {
    intro: 'First, show me you know the sea. Every sea animal has its own place. Put each one in the right place. 🐚',
    habitats: [
      { id: 'surface', label: 'Top of the sea', emoji: '🌊', color: '#4FC3F7' },
      { id: 'deep', label: 'Deep sea', emoji: '🌑', color: '#1565C0' },
      { id: 'sand', label: 'Sea floor', emoji: '🏝️', color: '#E3C575' },
    ],
    animals: [
      { id: 'dolphin', label: 'Dolphin', emoji: '🐬', habitat: 'surface' },
      { id: 'jellyfish', label: 'Jellyfish', emoji: '🪼', habitat: 'surface' },
      { id: 'whale', label: 'Whale', emoji: '🐋', habitat: 'deep' },
      { id: 'octopus', label: 'Octopus', emoji: '🐙', habitat: 'deep' },
      { id: 'crab', label: 'Crab', emoji: '🦀', habitat: 'sand' },
      { id: 'shell', label: 'Seashell', emoji: '🐚', habitat: 'sand' },
    ],
    wrongHints: {
      surface: 'This one swims near the top of the sea! 🌊 Try again.',
      deep: 'This one lives down in the deep dark sea! 🌑 Try again.',
      sand: 'This one stays on the sandy sea floor! 🏝️ Try again.',
    },
    successReply: 'Well done, Yousef! 🎉 Every sea animal is in the right place.',
    followUp: {
      question: 'The animals on the sea floor — what is the same about them?',
      choices: [
        { id: 'bottom', label: 'They stay on the bottom 🏝️', correct: true },
        { id: 'fly', label: 'They fly 🦅', correct: false },
        { id: 'fur', label: 'They have fur 🧶', correct: false },
      ],
      correctReply: "That's right! They both stay on the sea floor. Smart diver! 🌟",
      wrongReply: 'Nice try! But think — where do the crab and the shell stay?',
    },
  },

  breakfast: {
    intro: 'Good morning, my little diver. ❤️ Mom packed snacks for the boat. Help me with a little math too.',
    challenges: [
      {
        id: 'subtraction',
        speaker: 'mom',
        prompt: 'We caught 10 little fish in the net. 3 of them swim away. How many fish are left?',
        visual: { type: 'items', emoji: '🐟', total: 10, removed: 3 },
        inputMode: 'both',
        choices: [
          { id: '5', label: '5', correct: false },
          { id: '7', label: '7', correct: true },
          { id: '9', label: '9', correct: false },
        ],
        answer: '7',
        correctReply: 'Yes! 10 minus 3 is 7 fish. 🐟',
        wrongReply: 'Try again, diver — take 3 away from 10 and count what is left. 😊',
      },
      {
        id: 'multiplication',
        speaker: 'mom',
        prompt: 'We have 4 small boats. Each boat carries 3 explorers. How many explorers in all?',
        visual: { type: 'groups', groupEmoji: '⛵', itemEmoji: '🧒', count: 4, perItem: 3 },
        inputMode: 'choices',
        choices: [
          { id: '7', label: '7', correct: false },
          { id: '10', label: '10', correct: false },
          { id: '12', label: '12', correct: true },
        ],
        answer: '12',
        correctReply: 'Great! 4 times 3 is 12 explorers. ⛵',
        wrongReply: 'Count with me — 3 explorers in each boat, and we have 4 boats. 😊',
      },
      {
        id: 'fraction',
        speaker: 'mom',
        prompt: 'We need half a bottle of water. If we want double — how much do we need?',
        visual: { type: 'cup' },
        inputMode: 'choices',
        choices: [
          { id: 'half', label: 'Half a bottle 🧴', correct: false },
          { id: 'full', label: 'A full bottle 🧴', correct: true },
          { id: 'two', label: 'Two bottles 🧴🧴', correct: false },
        ],
        answer: 'full',
        correctReply: 'Well done! Half + half = one full bottle. That is double. 🌟',
        wrongReply: 'Almost! Half a bottle two times is how much? 😊',
      },
    ],
  },

  floatingSink: {
    intro: 'A good diver knows science. See the water? We will do an important test. 🔬',
    predictPrompt: 'Before we try — what do you think for each thing? Will it float or sink?',
    items: [
      { id: 'ball', label: 'Beach ball', emoji: '🏐', floats: true },
      { id: 'shell', label: 'Seashell', emoji: '🐚', floats: false },
      { id: 'ring', label: 'Life ring', emoji: '🛟', floats: true },
      { id: 'key', label: 'Metal key', emoji: '🔑', floats: false },
      { id: 'duck', label: 'Toy duck', emoji: '🦆', floats: true },
    ],
    floatLabel: 'Float',
    sinkLabel: 'Sink',
    resultIntro: "Let's see! We put each thing in the water. 💦",
    conclusion: {
      question: 'What did you notice? The light things —',
      choices: [
        { id: 'float', label: 'They float', correct: true },
        { id: 'sink', label: 'They sink', correct: false },
        { id: 'melt', label: 'They melt', correct: false },
      ],
      correctReply: 'Yes! Light things float on top of the water. 🌟',
      wrongReply: 'Look again at the ball and the toy duck — they are light, what did they do?',
    },
    thinking: {
      question: 'Why did the life ring float and the key sink?',
      choices: [
        { id: 'air', label: 'The ring is full of air and light', correct: true },
        { id: 'color', label: 'The ring is colorful', correct: false },
        { id: 'big', label: 'The key is small', correct: false },
      ],
      correctReply: 'Genius! 🧠 The ring is full of air, so it is light and floats.',
      wrongReply: 'Think about weight — what is inside the ring that makes it light?',
    },
  },

  englishRiddles: {
    intro: 'I found 3 papers floating in bottles! Each one has a riddle. Can you solve them? 📜',
    riddles: [
      {
        id: 'octopus',
        lines: ['I have eight arms.', 'I live in the sea.', 'I can change my color.', 'What am I?'],
        vocab: [{ word: 'arms', meaning: 'parts of the body we use to hold things' }],
        choices: [
          { id: 'octopus', label: 'Octopus', emoji: '🐙', correct: true },
          { id: 'crab', label: 'Crab', emoji: '🦀', correct: false },
          { id: 'fish', label: 'Fish', emoji: '🐟', correct: false },
        ],
        correctReply: 'Yes Yousef! It is an Octopus. 🐙 Great reading!',
        wrongReply: 'Good try Yousef! Eight arms and it changes color. Think again. 🌊',
      },
      {
        id: 'dolphin',
        lines: ['I am very smart.', 'I jump out of the water.', 'I am not a fish, but I live in the sea.', 'What am I?'],
        vocab: [{ word: 'jump', meaning: 'to push your body up into the air' }],
        choices: [
          { id: 'shark', label: 'Shark', emoji: '🦈', correct: false },
          { id: 'dolphin', label: 'Dolphin', emoji: '🐬', correct: true },
          { id: 'whale', label: 'Whale', emoji: '🐋', correct: false },
        ],
        correctReply: 'Amazing Yousef! It is a Dolphin. 🐬 You are so smart!',
        wrongReply: 'Good try Yousef! It is smart and jumps out of the water. Try again. 🌊',
      },
      {
        id: 'shark',
        lines: ['I have many sharp teeth.', 'I am a big fish.', 'Many animals are afraid of me.', 'What am I?'],
        vocab: [
          { word: 'sharp', meaning: 'can cut, not soft' },
          { word: 'afraid', meaning: 'feeling scared' },
        ],
        choices: [
          { id: 'seal', label: 'Seal', emoji: '🦭', correct: false },
          { id: 'shark', label: 'Shark', emoji: '🦈', correct: true },
          { id: 'turtle', label: 'Turtle', emoji: '🐢', correct: false },
        ],
        correctReply: 'Wonderful Yousef! It is a Shark. 🦈 Sharp teeth indeed!',
        wrongReply: 'Good try Yousef! A big fish with sharp teeth. Think again. 🦈',
      },
    ],
  },

  evidence: {
    intro: 'Now we have all the clues. We must find the 3 sea animals that are missing. 🔍',
    clues: [
      { id: 'ink', label: 'Black ink in the water', emoji: '🖤' },
      { id: 'tooth', label: 'A sharp tooth on a rock', emoji: '🦷' },
      { id: 'splash', label: 'A big jump splash mark', emoji: '💦' },
      { id: 'bubbles', label: 'Lots of little bubbles', emoji: '🫧' },
    ],
    question: 'From these animals — pick the 3 that are missing',
    suspects: [
      { id: 'octopus', label: 'Octopus', emoji: '🐙', guilty: true },
      { id: 'shark', label: 'Shark', emoji: '🦈', guilty: true },
      { id: 'dolphin', label: 'Dolphin', emoji: '🐬', guilty: true },
      { id: 'crab', label: 'Crab', emoji: '🦀', guilty: false },
      { id: 'turtle', label: 'Turtle', emoji: '🐢', guilty: false },
    ],
    wrongReply: 'Look at the clues carefully, Yousef. The black ink, the sharp tooth, and the big splash. 🔍',
    verification: [
      'Black ink = the Octopus ✓ 🐙',
      'Sharp tooth = the Shark ✓ 🦈',
      'Big splash jump = the Dolphin ✓ 🐬',
    ],
    successReply: 'You solved the sea case, Yousef! 🎉 You are a real diver!',
    finalQuestion: {
      question: 'Why are the Crab and the Turtle not the missing animals?',
      choices: [
        { id: 'noevidence', label: 'There are no clues about them', correct: true },
        { id: 'nosea', label: 'They do not live in the sea', correct: false },
        { id: 'sleeping', label: 'They are sleeping', correct: false },
      ],
      correctReply: 'Exactly! There is no clue about them. Great thinking! 🧠',
      wrongReply: 'Think again — did we find any clue about the Crab or the Turtle?',
    },
  },

  final: {
    intro: [
      'Yousef — that was an amazing dive! 🏆',
      'You sorted the sea animals, did science, solved the riddles, and cracked the sea case.',
      'You are now a real sea explorer! 🤿',
    ],
    badges: [
      { id: 'd2-sort', label: 'Sea Sorter', emoji: '🌊' },
      { id: 'd2-float', label: 'Ocean Scientist', emoji: '🛟' },
      { id: 'd2-riddles', label: 'Sea Riddle Reader', emoji: '📜' },
      { id: 'd2-detective', label: 'Reef Detective', emoji: '🔍' },
    ],
    reflection: {
      question: 'What is the best thing you learned today?',
      choices: [
        { id: 'air', label: 'That a life ring floats because of air', correct: false },
        { id: 'octopus', label: 'That an octopus has eight arms', correct: false },
        { id: 'dolphin', label: 'That a dolphin is smart and not a fish', correct: false },
        { id: 'all', label: 'All of it', correct: true },
      ],
      correctReply: 'Exactly, Yousef! You learned so much under the sea today! 🌟',
      wrongReply: 'Yes! But not only that... you learned this and much more today! 😊',
    },
    finishLabel: 'I finished Day 2! 🎉',
  },
}

export default day2
