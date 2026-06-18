// ============================================================
// اليوم 3 — رحلة إلى الفضاء: النجوم والكواكب المفقودة.
// نفس بنية اليوم الأول (7 مشاهد) بمحتوى جديد عن الفضاء.
// ============================================================

const day3 = {
  id: 3,
  title: 'رحلة إلى الفضاء',
  subtitle: 'Space Journey',
  emoji: '🚀',
  color: '#5E35B1',

  sceneSequence: [
    { id: 'wakeup', component: 'WakeUpScene', environment: 'space' },
    { id: 'animalSort', component: 'AnimalSortScene', environment: 'space', category: 'logic' },
    { id: 'breakfast', component: 'BreakfastScene', environment: 'space', category: 'math' },
    { id: 'garden-science', component: 'GardenScienceScene', environment: 'space', category: 'science' },
    { id: 'garden-english', component: 'GardenEnglishScene', environment: 'space', category: 'english' },
    { id: 'garden-evidence', component: 'GardenEvidenceScene', environment: 'space', category: 'logic' },
    { id: 'final', component: 'FinalScene', environment: 'reward' },
  ],

  wakeUp: {
    intro: [
      'Wake up, Yousef! Look out the window. 🌌',
      'It is Captain Shareef. Today we fly to space in a rocket!',
      'But there is a problem — 3 space things are missing from the sky!',
      'Put on your space helmet. Are you ready to fly?',
    ],
    choices: [
      { id: 'yes', label: 'Yes, blast off! ✓', correct: true },
      { id: 'wait', label: 'I need a minute', correct: false },
    ],
    waitReply: 'Take your time, astronaut. 😊 Tap "Yes" when you are ready to fly.',
    startReply: '3… 2… 1… Blast off! Let us go to space! 🚀',
  },

  animalSort: {
    intro: 'First, show me you know space. Every space thing has its own group. Put each one in the right group. 🪐',
    habitats: [
      { id: 'planets', label: 'Planets', emoji: '🪐', color: '#8E24AA' },
      { id: 'sky', label: 'Sky lights', emoji: '✨', color: '#FBC02D' },
      { id: 'machines', label: 'Space machines', emoji: '🚀', color: '#5C6BC0' },
    ],
    animals: [
      { id: 'earth', label: 'Earth', emoji: '🌍', habitat: 'planets' },
      { id: 'saturn', label: 'Saturn', emoji: '🪐', habitat: 'planets' },
      { id: 'star', label: 'Star', emoji: '⭐', habitat: 'sky' },
      { id: 'moon', label: 'Moon', emoji: '🌙', habitat: 'sky' },
      { id: 'rocket', label: 'Rocket', emoji: '🚀', habitat: 'machines' },
      { id: 'satellite', label: 'Satellite', emoji: '🛰️', habitat: 'machines' },
    ],
    wrongHints: {
      planets: 'This one is a big round planet! 🪐 Try again.',
      sky: 'This one is a light we see in the sky! ✨ Try again.',
      machines: 'This one is a machine that people built! 🚀 Try again.',
    },
    successReply: 'Well done, Yousef! 🎉 Every space thing is in the right group.',
    followUp: {
      question: 'The things in the "Sky lights" group — what is the same about them?',
      choices: [
        { id: 'shine', label: 'They shine and give light ✨', correct: true },
        { id: 'metal', label: 'They are made of metal 🔩', correct: false },
        { id: 'cold', label: 'They are cold ❄️', correct: false },
      ],
      correctReply: "That's right! The star and the moon shine in the sky. Smart astronaut! 🌟",
      wrongReply: 'Nice try! But think — what do the star and the moon do at night?',
    },
  },

  breakfast: {
    intro: 'Good morning, my little astronaut. ❤️ Mom packed space snacks. Help me with a little math too.',
    challenges: [
      {
        id: 'subtraction',
        speaker: 'mom',
        prompt: 'We see 9 bright stars on the screen. 2 of them fall down. How many stars are left?',
        visual: { type: 'items', emoji: '⭐', total: 9, removed: 2 },
        inputMode: 'both',
        choices: [
          { id: '5', label: '5', correct: false },
          { id: '7', label: '7', correct: true },
          { id: '8', label: '8', correct: false },
        ],
        answer: '7',
        correctReply: 'Yes! 9 minus 2 is 7 stars. ⭐',
        wrongReply: 'Try again, astronaut — take 2 away from 9 and count what is left. 😊',
      },
      {
        id: 'multiplication',
        speaker: 'mom',
        prompt: 'We have 3 rockets. Each rocket has 2 astronauts. How many astronauts in all?',
        visual: { type: 'groups', groupEmoji: '🚀', itemEmoji: '👨‍🚀', count: 3, perItem: 2 },
        inputMode: 'choices',
        choices: [
          { id: '5', label: '5', correct: false },
          { id: '6', label: '6', correct: true },
          { id: '8', label: '8', correct: false },
        ],
        answer: '6',
        correctReply: 'Great! 3 times 2 is 6 astronauts. 🚀',
        wrongReply: 'Count with me — 2 astronauts in each rocket, and we have 3 rockets. 😊',
      },
      {
        id: 'fraction',
        speaker: 'mom',
        prompt: 'The rocket needs half a tank of fuel. If we want double — how much do we need?',
        visual: { type: 'cup' },
        inputMode: 'choices',
        choices: [
          { id: 'half', label: 'Half a tank ⛽', correct: false },
          { id: 'full', label: 'A full tank ⛽', correct: true },
          { id: 'two', label: 'Two tanks ⛽⛽', correct: false },
        ],
        answer: 'full',
        correctReply: 'Well done! Half + half = one full tank. That is double. 🌟',
        wrongReply: 'Almost! Half a tank two times is how much? 😊',
      },
    ],
  },

  floatingSink: {
    intro: 'A good astronaut tests everything first. Look at this water tank. We will do a test. 🔬',
    predictPrompt: 'Before we try — what do you think for each thing? Will it float or sink?',
    items: [
      { id: 'sponge', label: 'Sponge', emoji: '🧽', floats: true },
      { id: 'bolt', label: 'Metal bolt', emoji: '🔩', floats: false },
      { id: 'foamball', label: 'Foam ball', emoji: '⚽', floats: true },
      { id: 'battery', label: 'Battery', emoji: '🔋', floats: false },
      { id: 'cork', label: 'Cork', emoji: '🪵', floats: true },
    ],
    floatLabel: 'Float',
    sinkLabel: 'Sink',
    resultIntro: "Let's see! We put each thing in the water. 💦",
    conclusion: {
      question: 'What did you notice? The light things —',
      choices: [
        { id: 'float', label: 'They float', correct: true },
        { id: 'sink', label: 'They sink', correct: false },
        { id: 'fly', label: 'They fly away', correct: false },
      ],
      correctReply: 'Yes! Light things float on top of the water. 🌟',
      wrongReply: 'Look again at the sponge and the foam ball — they are light, what did they do?',
    },
    thinking: {
      question: 'Why did the cork float and the metal bolt sink?',
      choices: [
        { id: 'lighter', label: 'The cork is lighter than water', correct: true },
        { id: 'softer', label: 'The cork is brown', correct: false },
        { id: 'bigger', label: 'The bolt is shiny', correct: false },
      ],
      correctReply: 'Genius! 🧠 The cork is lighter than water, so it floats.',
      wrongReply: 'Think about weight — which is lighter, the cork or the metal bolt?',
    },
  },

  englishRiddles: {
    intro: 'I found 3 space papers floating in the rocket! Each one has a riddle. Can you solve them? 📜',
    riddles: [
      {
        id: 'sun',
        lines: ['I am a very big star.', 'I give light in the day.', 'I am very hot.', 'What am I?'],
        vocab: [{ word: 'hot', meaning: 'very warm, not cold' }],
        choices: [
          { id: 'sun', label: 'Sun', emoji: '☀️', correct: true },
          { id: 'moon', label: 'Moon', emoji: '🌙', correct: false },
          { id: 'cloud', label: 'Cloud', emoji: '☁️', correct: false },
        ],
        correctReply: 'Yes Yousef! It is the Sun. ☀️ Great reading!',
        wrongReply: 'Good try Yousef! A very big, hot star that shines in the day. Think again. 🌞',
      },
      {
        id: 'moon',
        lines: ['I shine at night.', 'I go around the Earth.', 'I am not hot like the Sun.', 'What am I?'],
        vocab: [{ word: 'around', meaning: 'in a circle, on every side' }],
        choices: [
          { id: 'star', label: 'Star', emoji: '⭐', correct: false },
          { id: 'moon', label: 'Moon', emoji: '🌙', correct: true },
          { id: 'sun', label: 'Sun', emoji: '☀️', correct: false },
        ],
        correctReply: 'Amazing Yousef! It is the Moon. 🌙 You are so smart!',
        wrongReply: 'Good try Yousef! It shines at night and goes around the Earth. Try again. 🌙',
      },
      {
        id: 'rocket',
        lines: ['I am very fast.', 'I have fire at my back.', 'I take people to space.', 'What am I?'],
        vocab: [{ word: 'fast', meaning: 'moving very quickly' }],
        choices: [
          { id: 'plane', label: 'Plane', emoji: '✈️', correct: false },
          { id: 'car', label: 'Car', emoji: '🚗', correct: false },
          { id: 'rocket', label: 'Rocket', emoji: '🚀', correct: true },
        ],
        correctReply: 'Wonderful Yousef! It is a Rocket. 🚀 Fast and full of fire!',
        wrongReply: 'Good try Yousef! Very fast, with fire, and it goes to space. Think again. 🚀',
      },
    ],
  },

  evidence: {
    intro: 'Now we have all the clues. We must find the 3 space things that are missing. 🔍',
    clues: [
      { id: 'fire', label: 'A fire trail in the sky', emoji: '🔥' },
      { id: 'glitter', label: 'Shiny glitter dust', emoji: '✨' },
      { id: 'crater', label: 'A round crater mark', emoji: '🕳️' },
      { id: 'cold', label: 'Very cold air', emoji: '❄️' },
    ],
    question: 'From these space things — pick the 3 that are missing',
    suspects: [
      { id: 'rocket', label: 'Rocket', emoji: '🚀', guilty: true },
      { id: 'star', label: 'Star', emoji: '⭐', guilty: true },
      { id: 'moon', label: 'Moon', emoji: '🌙', guilty: true },
      { id: 'sun', label: 'Sun', emoji: '☀️', guilty: false },
      { id: 'earth', label: 'Earth', emoji: '🌍', guilty: false },
    ],
    wrongReply: 'Look at the clues carefully, Yousef. The fire trail, the shiny glitter, and the round crater. 🔍',
    verification: [
      'Fire trail = the Rocket ✓ 🚀',
      'Shiny glitter dust = the Star ✓ ⭐',
      'Round crater mark = the Moon ✓ 🌙',
    ],
    successReply: 'You solved the space case, Yousef! 🎉 You are a real astronaut!',
    finalQuestion: {
      question: 'Why are the Sun and the Earth not the missing things?',
      choices: [
        { id: 'noevidence', label: 'There are no clues about them', correct: true },
        { id: 'toobig', label: 'They are too big to hide', correct: false },
        { id: 'sleeping', label: 'They are sleeping', correct: false },
      ],
      correctReply: 'Exactly! There is no clue about them. Great thinking! 🧠',
      wrongReply: 'Think again — did we find any clue about the Sun or the Earth?',
    },
  },

  final: {
    intro: [
      'Yousef — that was an amazing space trip! 🏆',
      'You sorted the space things, did science, solved the riddles, and cracked the space case.',
      'You are now a real astronaut! 🚀',
    ],
    badges: [
      { id: 'd3-sort', label: 'Space Sorter', emoji: '🪐' },
      { id: 'd3-float', label: 'Astronaut Scientist', emoji: '🧽' },
      { id: 'd3-riddles', label: 'Star Riddle Reader', emoji: '📜' },
      { id: 'd3-detective', label: 'Space Detective', emoji: '🛰️' },
    ],
    reflection: {
      question: 'What is the best thing you learned today?',
      choices: [
        { id: 'cork', label: 'That a cork floats because it is light', correct: false },
        { id: 'sun', label: 'That the Sun is a very big hot star', correct: false },
        { id: 'moon', label: 'That the Moon goes around the Earth', correct: false },
        { id: 'all', label: 'All of it', correct: true },
      ],
      correctReply: 'Exactly, Yousef! You learned so much in space today! 🌟',
      wrongReply: 'Yes! But not only that... you learned this and much more today! 😊',
    },
    finishLabel: 'I finished Day 3! 🎉',
  },
}

export default day3
