// ============================================================
// اليوم 5 — مغامرة الغابة: حيوانات الغابة المختبئة.
// نفس بنية اليوم الأول (7 مشاهد) بمحتوى جديد عن الغابة.
// ============================================================

const day5 = {
  id: 5,
  title: 'مغامرة الغابة',
  subtitle: 'Jungle Adventure',
  emoji: '🌴',
  color: '#2E7D32',

  sceneSequence: [
    { id: 'wakeup', component: 'WakeUpScene', environment: 'jungle' },
    { id: 'animalSort', component: 'AnimalSortScene', environment: 'jungle', category: 'logic' },
    { id: 'breakfast', component: 'BreakfastScene', environment: 'jungle', category: 'math' },
    { id: 'garden-science', component: 'GardenScienceScene', environment: 'jungle', category: 'science' },
    { id: 'garden-english', component: 'GardenEnglishScene', environment: 'jungle', category: 'english' },
    { id: 'garden-evidence', component: 'GardenEvidenceScene', environment: 'jungle', category: 'logic' },
    { id: 'final', component: 'FinalScene', environment: 'reward' },
  ],

  wakeUp: {
    intro: [
      'Wake up, Yousef! Can you hear the birds? 🦜',
      'It is Captain Shareef. Today we explore the deep green jungle!',
      'But 3 jungle animals are hiding and we cannot find them!',
      'Take your explorer hat. Are you ready for the jungle?',
    ],
    choices: [
      { id: 'yes', label: 'Yes, into the jungle! ✓', correct: true },
      { id: 'wait', label: 'I need a minute', correct: false },
    ],
    waitReply: 'Take your time, Yousef. 😊 Tap "Yes" when you are ready for the jungle.',
    startReply: "Let's go! Watch your step in the jungle, brave explorer! 🌴",
  },

  animalSort: {
    intro: 'First, show me you know the jungle. Every animal has its own place. Put each one in the right place. 🐾',
    habitats: [
      { id: 'trees', label: 'Up in the trees', emoji: '🌳', color: '#4CAF50' },
      { id: 'ground', label: 'On the ground', emoji: '🌿', color: '#8D6E63' },
      { id: 'river', label: 'In the river', emoji: '💧', color: '#4FC3F7' },
    ],
    animals: [
      { id: 'monkey', label: 'Monkey', emoji: '🐒', habitat: 'trees' },
      { id: 'parrot', label: 'Parrot', emoji: '🦜', habitat: 'trees' },
      { id: 'tiger', label: 'Tiger', emoji: '🐯', habitat: 'ground' },
      { id: 'elephant', label: 'Elephant', emoji: '🐘', habitat: 'ground' },
      { id: 'crocodile', label: 'Crocodile', emoji: '🐊', habitat: 'river' },
      { id: 'hippo', label: 'Hippo', emoji: '🦛', habitat: 'river' },
    ],
    wrongHints: {
      trees: 'This one lives high up in the trees! 🌳 Try again.',
      ground: 'This one walks on the ground in the jungle! 🌿 Try again.',
      river: 'This one loves the water in the river! 💧 Try again.',
    },
    successReply: 'Well done, Yousef! 🎉 Every jungle animal is in the right place.',
    followUp: {
      question: 'The animals up in the trees — what is the same about them?',
      choices: [
        { id: 'climb', label: 'They climb and fly high 🌳', correct: true },
        { id: 'swim', label: 'They swim in the river 💧', correct: false },
        { id: 'big', label: 'They are very big 🐘', correct: false },
      ],
      correctReply: "That's right! The monkey and the parrot stay high in the trees. Smart explorer! 🌟",
      wrongReply: 'Nice try! But think — where do the monkey and the parrot stay?',
    },
  },

  breakfast: {
    intro: 'Good morning, my brave explorer. ❤️ Mom packed jungle fruit. Help me with a little math too.',
    challenges: [
      {
        id: 'subtraction',
        speaker: 'mom',
        prompt: 'We have 11 bananas. A monkey eats 5 of them. How many bananas are left?',
        visual: { type: 'items', emoji: '🍌', total: 11, removed: 5 },
        inputMode: 'both',
        choices: [
          { id: '5', label: '5', correct: false },
          { id: '6', label: '6', correct: true },
          { id: '7', label: '7', correct: false },
        ],
        answer: '6',
        correctReply: 'Yes! 11 minus 5 is 6 bananas. 🍌',
        wrongReply: 'Try again, explorer — take 5 away from 11 and count what is left. 😊',
      },
      {
        id: 'multiplication',
        speaker: 'mom',
        prompt: 'We see 3 monkeys. Each monkey grabs 4 bananas. How many bananas in all?',
        visual: { type: 'groups', groupEmoji: '🐒', itemEmoji: '🍌', count: 3, perItem: 4 },
        inputMode: 'choices',
        choices: [
          { id: '7', label: '7', correct: false },
          { id: '10', label: '10', correct: false },
          { id: '12', label: '12', correct: true },
        ],
        answer: '12',
        correctReply: 'Great! 3 times 4 is 12 bananas. 🍌',
        wrongReply: 'Count with me — 4 bananas for each monkey, and we have 3 monkeys. 😊',
      },
      {
        id: 'fraction',
        speaker: 'mom',
        prompt: 'We need half a cup of juice. If we want double — how much do we need?',
        visual: { type: 'cup' },
        inputMode: 'choices',
        choices: [
          { id: 'half', label: 'Half a cup 🥤', correct: false },
          { id: 'full', label: 'A full cup 🥤', correct: true },
          { id: 'two', label: 'Two cups 🥤🥤', correct: false },
        ],
        answer: 'full',
        correctReply: 'Well done! Half + half = one full cup. That is double. 🌟',
        wrongReply: 'Almost! Half a cup two times is how much? 😊',
      },
    ],
  },

  floatingSink: {
    intro: 'A good explorer knows science. See the jungle river? We will do an important test. 🔬',
    predictPrompt: 'Before we try — what do you think for each thing? Will it float or sink?',
    items: [
      { id: 'leaf', label: 'Big leaf', emoji: '🍃', floats: true },
      { id: 'rock', label: 'Rock', emoji: '🪨', floats: false },
      { id: 'log', label: 'Wooden log', emoji: '🪵', floats: true },
      { id: 'coin', label: 'Gold coin', emoji: '🪙', floats: false },
      { id: 'banana', label: 'Banana', emoji: '🍌', floats: true },
    ],
    floatLabel: 'Float',
    sinkLabel: 'Sink',
    resultIntro: "Let's see! We put each thing in the water. 💦",
    conclusion: {
      question: 'What did you notice? The light things —',
      choices: [
        { id: 'float', label: 'They float', correct: true },
        { id: 'sink', label: 'They sink', correct: false },
        { id: 'jump', label: 'They jump', correct: false },
      ],
      correctReply: 'Yes! Light things float on top of the water. 🌟',
      wrongReply: 'Look again at the big leaf and the banana — they are light, what did they do?',
    },
    thinking: {
      question: 'Why did the wooden log float and the gold coin sink?',
      choices: [
        { id: 'lighter', label: 'The log is lighter than water', correct: true },
        { id: 'longer', label: 'The log is longer', correct: false },
        { id: 'shiny', label: 'The coin is shiny', correct: false },
      ],
      correctReply: 'Genius! 🧠 The wooden log is lighter than water, so it floats.',
      wrongReply: 'Think about weight — which is lighter, the wooden log or the gold coin?',
    },
  },

  englishRiddles: {
    intro: 'I found 3 papers on the jungle trees! Each one has a riddle. Can you solve them? 📜',
    riddles: [
      {
        id: 'monkey',
        lines: ['I love bananas.', 'I can climb trees very fast.', 'I have a long tail.', 'What am I?'],
        vocab: [
          { word: 'climb', meaning: 'to go up using hands and feet' },
          { word: 'tail', meaning: 'the long part at the back of an animal' },
        ],
        choices: [
          { id: 'monkey', label: 'Monkey', emoji: '🐒', correct: true },
          { id: 'tiger', label: 'Tiger', emoji: '🐯', correct: false },
          { id: 'snake', label: 'Snake', emoji: '🐍', correct: false },
        ],
        correctReply: 'Yes Yousef! It is a Monkey. 🐒 Great reading!',
        wrongReply: 'Good try Yousef! It loves bananas and climbs trees. Think again. 🐒',
      },
      {
        id: 'snake',
        lines: ['I have no legs.', 'I am very long.', 'I move on the ground.', 'What am I?'],
        vocab: [{ word: 'legs', meaning: 'the body parts we use to walk' }],
        choices: [
          { id: 'lizard', label: 'Lizard', emoji: '🦎', correct: false },
          { id: 'snake', label: 'Snake', emoji: '🐍', correct: true },
          { id: 'frog', label: 'Frog', emoji: '🐸', correct: false },
        ],
        correctReply: 'Amazing Yousef! It is a Snake. 🐍 You are so smart!',
        wrongReply: 'Good try Yousef! Long, with no legs, moving on the ground. Try again. 🐍',
      },
      {
        id: 'parrot',
        lines: ['I have colorful feathers.', 'I can fly.', 'I can copy what you say.', 'What am I?'],
        vocab: [
          { word: 'colorful', meaning: 'having many colors' },
          { word: 'copy', meaning: 'to do or say the same thing' },
        ],
        choices: [
          { id: 'eagle', label: 'Eagle', emoji: '🦅', correct: false },
          { id: 'bat', label: 'Bat', emoji: '🦇', correct: false },
          { id: 'parrot', label: 'Parrot', emoji: '🦜', correct: true },
        ],
        correctReply: 'Wonderful Yousef! It is a Parrot. 🦜 It can copy your words!',
        wrongReply: 'Good try Yousef! Colorful feathers, and it copies what you say. Think again. 🦜',
      },
    ],
  },

  evidence: {
    intro: 'Now we have all the clues. We must find the 3 jungle animals that are hiding. 🔍',
    clues: [
      { id: 'banana', label: 'Banana peels under a tree', emoji: '🍌' },
      { id: 'feather', label: 'A colorful feather', emoji: '🪶' },
      { id: 'skin', label: 'A long snake skin', emoji: '🐍' },
      { id: 'roar', label: 'A loud roar sound', emoji: '🔊' },
    ],
    question: 'From these animals — pick the 3 that are hiding',
    suspects: [
      { id: 'monkey', label: 'Monkey', emoji: '🐒', guilty: true },
      { id: 'parrot', label: 'Parrot', emoji: '🦜', guilty: true },
      { id: 'snake', label: 'Snake', emoji: '🐍', guilty: true },
      { id: 'tiger', label: 'Tiger', emoji: '🐯', guilty: false },
      { id: 'elephant', label: 'Elephant', emoji: '🐘', guilty: false },
    ],
    wrongReply: 'Look at the clues carefully, Yousef. The banana peels, the colorful feather, and the snake skin. 🔍',
    verification: [
      'Banana peels = the Monkey ✓ 🐒',
      'Colorful feather = the Parrot ✓ 🦜',
      'Long snake skin = the Snake ✓ 🐍',
    ],
    successReply: 'You solved the jungle case, Yousef! 🎉 You are a real jungle explorer!',
    finalQuestion: {
      question: 'Why are the Tiger and the Elephant not the hiding animals?',
      choices: [
        { id: 'noevidence', label: 'There are no clues about them', correct: true },
        { id: 'nojungle', label: 'They do not live in the jungle', correct: false },
        { id: 'sleeping', label: 'They are sleeping', correct: false },
      ],
      correctReply: 'Exactly! There is no clue about them. Great thinking! 🧠',
      wrongReply: 'Think again — did we find any clue about the Tiger or the Elephant?',
    },
  },

  final: {
    intro: [
      'Yousef — what an amazing jungle adventure! 🏆',
      'You sorted the animals, did science, solved the riddles, and found the hiding animals.',
      'You are now a real jungle explorer! 🌴',
    ],
    badges: [
      { id: 'd5-sort', label: 'Jungle Sorter', emoji: '🌿' },
      { id: 'd5-float', label: 'River Scientist', emoji: '🍃' },
      { id: 'd5-riddles', label: 'Jungle Riddle Reader', emoji: '📜' },
      { id: 'd5-detective', label: 'Jungle Detective', emoji: '🔍' },
    ],
    reflection: {
      question: 'What is the best thing you learned today?',
      choices: [
        { id: 'log', label: 'That a wooden log floats', correct: false },
        { id: 'monkey', label: 'That a monkey climbs with a long tail', correct: false },
        { id: 'parrot', label: 'That a parrot can copy your words', correct: false },
        { id: 'all', label: 'All of it', correct: true },
      ],
      correctReply: 'Exactly, Yousef! You learned so much in the jungle today! 🌟',
      wrongReply: 'Yes! But not only that... you learned this and much more today! 😊',
    },
    finishLabel: 'I finished Day 5! 🎉',
  },
}

export default day5
