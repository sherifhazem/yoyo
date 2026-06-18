// ============================================================
// اليوم 4 — يوم في المزرعة: حيوانات المزرعة المختفية.
// نفس بنية اليوم الأول (7 مشاهد) بمحتوى جديد عن المزرعة.
// ============================================================

const day4 = {
  id: 4,
  title: 'يوم في المزرعة',
  subtitle: 'Farm Day',
  emoji: '🌾',
  color: '#F9A825',

  sceneSequence: [
    { id: 'wakeup', component: 'WakeUpScene', environment: 'farm' },
    { id: 'animalSort', component: 'AnimalSortScene', environment: 'farm', category: 'logic' },
    { id: 'breakfast', component: 'BreakfastScene', environment: 'farm', category: 'math' },
    { id: 'garden-science', component: 'GardenScienceScene', environment: 'farm', category: 'science' },
    { id: 'garden-english', component: 'GardenEnglishScene', environment: 'farm', category: 'english' },
    { id: 'garden-evidence', component: 'GardenEvidenceScene', environment: 'farm', category: 'logic' },
    { id: 'final', component: 'FinalScene', environment: 'reward' },
  ],

  wakeUp: {
    intro: [
      'Good morning, Yousef! Listen — the rooster is calling. 🐓',
      'It is Captain Shareef. Today we visit the big farm!',
      'But the farmer is sad — 3 farm animals are missing!',
      'Put on your farm boots. Are you ready to help?',
    ],
    choices: [
      { id: 'yes', label: 'Yes, let us help! ✓', correct: true },
      { id: 'wait', label: 'I need a minute', correct: false },
    ],
    waitReply: 'Take your time, Yousef. 😊 Tap "Yes" when you are ready for the farm.',
    startReply: "Wonderful! Let's go to the farm, little farmer! 🚜",
  },

  animalSort: {
    intro: 'First, show me you know the farm. Every animal has its own place. Put each one in the right place. 🐾',
    habitats: [
      { id: 'land', label: 'On the grass', emoji: '🌾', color: '#8BC34A' },
      { id: 'pond', label: 'In the pond', emoji: '💧', color: '#4FC3F7' },
      { id: 'coop', label: 'In the house', emoji: '🏠', color: '#E3C575' },
    ],
    animals: [
      { id: 'cow', label: 'Cow', emoji: '🐄', habitat: 'land' },
      { id: 'sheep', label: 'Sheep', emoji: '🐑', habitat: 'land' },
      { id: 'duck', label: 'Duck', emoji: '🦆', habitat: 'pond' },
      { id: 'frog', label: 'Frog', emoji: '🐸', habitat: 'pond' },
      { id: 'chicken', label: 'Chicken', emoji: '🐔', habitat: 'coop' },
      { id: 'rabbit', label: 'Rabbit', emoji: '🐰', habitat: 'coop' },
    ],
    wrongHints: {
      land: 'This one eats grass out in the field! 🌾 Try again.',
      pond: 'This one loves the water in the pond! 💧 Try again.',
      coop: 'This one sleeps in a little house! 🏠 Try again.',
    },
    successReply: 'Well done, Yousef! 🎉 Every farm animal is in the right place.',
    followUp: {
      question: 'The animals in the pond — what is the same about them?',
      choices: [
        { id: 'water', label: 'They like the water 💧', correct: true },
        { id: 'fly', label: 'They give milk 🥛', correct: false },
        { id: 'wool', label: 'They have wool 🧶', correct: false },
      ],
      correctReply: "That's right! The duck and the frog both love the water. Smart farmer! 🌟",
      wrongReply: 'Nice try! But think — what do the duck and the frog love?',
    },
  },

  breakfast: {
    intro: 'Good morning, my little farmer. ❤️ Help me pick the food from the farm, and a little math too.',
    challenges: [
      {
        id: 'subtraction',
        speaker: 'mom',
        prompt: 'We picked 8 red apples. We eat 3 of them. How many apples are left?',
        visual: { type: 'items', emoji: '🍎', total: 8, removed: 3 },
        inputMode: 'both',
        choices: [
          { id: '4', label: '4', correct: false },
          { id: '5', label: '5', correct: true },
          { id: '6', label: '6', correct: false },
        ],
        answer: '5',
        correctReply: 'Yes! 8 minus 3 is 5 apples. 🍎',
        wrongReply: 'Try again, farmer — take 3 away from 8 and count what is left. 😊',
      },
      {
        id: 'multiplication',
        speaker: 'mom',
        prompt: 'We have 5 hens. Each hen lays 2 eggs. How many eggs in all?',
        visual: { type: 'groups', groupEmoji: '🐔', itemEmoji: '🥚', count: 5, perItem: 2 },
        inputMode: 'choices',
        choices: [
          { id: '7', label: '7', correct: false },
          { id: '10', label: '10', correct: true },
          { id: '12', label: '12', correct: false },
        ],
        answer: '10',
        correctReply: 'Great! 5 times 2 is 10 eggs. 🥚',
        wrongReply: 'Count with me — 2 eggs from each hen, and we have 5 hens. 😊',
      },
      {
        id: 'fraction',
        speaker: 'mom',
        prompt: 'We need half a bucket of milk. If we want double — how much do we need?',
        visual: { type: 'cup' },
        inputMode: 'choices',
        choices: [
          { id: 'half', label: 'Half a bucket 🪣', correct: false },
          { id: 'full', label: 'A full bucket 🪣', correct: true },
          { id: 'two', label: 'Two buckets 🪣🪣', correct: false },
        ],
        answer: 'full',
        correctReply: 'Well done! Half + half = one full bucket. That is double. 🌟',
        wrongReply: 'Almost! Half a bucket two times is how much? 😊',
      },
    ],
  },

  floatingSink: {
    intro: 'A good farmer knows science too. See the pond? We will do an important test. 🔬',
    predictPrompt: 'Before we try — what do you think for each thing? Will it float or sink?',
    items: [
      { id: 'feather', label: 'Feather', emoji: '🪶', floats: true },
      { id: 'stone', label: 'Stone', emoji: '🪨', floats: false },
      { id: 'hay', label: 'Dry hay', emoji: '🌾', floats: true },
      { id: 'nail', label: 'Metal nail', emoji: '🔩', floats: false },
      { id: 'apple', label: 'Apple', emoji: '🍎', floats: true },
    ],
    floatLabel: 'Float',
    sinkLabel: 'Sink',
    resultIntro: "Let's see! We put each thing in the water. 💦",
    conclusion: {
      question: 'What did you notice? The light things —',
      choices: [
        { id: 'float', label: 'They float', correct: true },
        { id: 'sink', label: 'They sink', correct: false },
        { id: 'grow', label: 'They grow', correct: false },
      ],
      correctReply: 'Yes! Light things float on top of the water. 🌟',
      wrongReply: 'Look again at the feather and the dry hay — they are light, what did they do?',
    },
    thinking: {
      question: 'Why did the hay float and the nail sink?',
      choices: [
        { id: 'lighter', label: 'The hay is lighter than water', correct: true },
        { id: 'dry', label: 'The hay is yellow', correct: false },
        { id: 'small', label: 'The nail is shiny', correct: false },
      ],
      correctReply: 'Genius! 🧠 The hay is lighter than water, so it floats.',
      wrongReply: 'Think about weight — which is lighter, the hay or the metal nail?',
    },
  },

  englishRiddles: {
    intro: 'I found 3 papers on the barn door! Each one has a riddle. Can you solve them? 📜',
    riddles: [
      {
        id: 'cow',
        lines: ['I give you milk.', "I say 'moo'.", 'I eat grass all day.', 'What am I?'],
        vocab: [{ word: 'grass', meaning: 'green plants that grow on the ground' }],
        choices: [
          { id: 'cow', label: 'Cow', emoji: '🐄', correct: true },
          { id: 'goat', label: 'Goat', emoji: '🐐', correct: false },
          { id: 'pig', label: 'Pig', emoji: '🐷', correct: false },
        ],
        correctReply: 'Yes Yousef! It is a Cow. 🐄 Great reading!',
        wrongReply: "Good try Yousef! It gives milk and says 'moo'. Think again. 🐄",
      },
      {
        id: 'hen',
        lines: ['I have feathers and two legs.', 'I lay eggs.', "I say 'cluck cluck'.", 'What am I?'],
        vocab: [{ word: 'lay', meaning: 'to make and put down eggs' }],
        choices: [
          { id: 'duck', label: 'Duck', emoji: '🦆', correct: false },
          { id: 'hen', label: 'Hen', emoji: '🐔', correct: true },
          { id: 'owl', label: 'Owl', emoji: '🦉', correct: false },
        ],
        correctReply: 'Amazing Yousef! It is a Hen. 🐔 You are so smart!',
        wrongReply: 'Good try Yousef! It lays eggs and says "cluck". Try again. 🐔',
      },
      {
        id: 'pig',
        lines: ['I am pink.', 'I like to roll in the mud.', "I say 'oink oink'.", 'What am I?'],
        vocab: [{ word: 'mud', meaning: 'wet, soft dirt' }],
        choices: [
          { id: 'sheep', label: 'Sheep', emoji: '🐑', correct: false },
          { id: 'cow', label: 'Cow', emoji: '🐄', correct: false },
          { id: 'pig', label: 'Pig', emoji: '🐷', correct: true },
        ],
        correctReply: 'Wonderful Yousef! It is a Pig. 🐷 It loves the mud!',
        wrongReply: 'Good try Yousef! Pink, loves the mud, and says "oink". Think again. 🐷',
      },
    ],
  },

  evidence: {
    intro: 'Now we have all the clues. We must find the 3 farm animals that are missing. 🔍',
    clues: [
      { id: 'milk', label: 'A spilled milk bucket', emoji: '🥛' },
      { id: 'wool', label: 'White wool on the fence', emoji: '🧶' },
      { id: 'eggs', label: 'Broken eggs near the coop', emoji: '🥚' },
      { id: 'mud', label: 'Muddy footprints', emoji: '🐾' },
    ],
    question: 'From these animals — pick the 3 that are missing',
    suspects: [
      { id: 'cow', label: 'Cow', emoji: '🐄', guilty: true },
      { id: 'sheep', label: 'Sheep', emoji: '🐑', guilty: true },
      { id: 'hen', label: 'Hen', emoji: '🐔', guilty: true },
      { id: 'horse', label: 'Horse', emoji: '🐴', guilty: false },
      { id: 'dog', label: 'Dog', emoji: '🐕', guilty: false },
    ],
    wrongReply: 'Look at the clues carefully, Yousef. The spilled milk, the white wool, and the broken eggs. 🔍',
    verification: [
      'Spilled milk = the Cow ✓ 🐄',
      'White wool = the Sheep ✓ 🐑',
      'Broken eggs = the Hen ✓ 🐔',
    ],
    successReply: 'You solved the farm case, Yousef! 🎉 You are a real farm helper!',
    finalQuestion: {
      question: 'Why are the Horse and the Dog not the missing animals?',
      choices: [
        { id: 'noevidence', label: 'There are no clues about them', correct: true },
        { id: 'nofarm', label: 'They do not live on the farm', correct: false },
        { id: 'sleeping', label: 'They are sleeping', correct: false },
      ],
      correctReply: 'Exactly! There is no clue about them. Great thinking! 🧠',
      wrongReply: 'Think again — did we find any clue about the Horse or the Dog?',
    },
  },

  final: {
    intro: [
      'Yousef — you helped the farmer so much! 🏆',
      'You sorted the animals, did science, solved the riddles, and found the missing animals.',
      'You are now a real farm explorer! 🚜',
    ],
    badges: [
      { id: 'd4-sort', label: 'Farm Sorter', emoji: '🌾' },
      { id: 'd4-float', label: 'Pond Scientist', emoji: '🪶' },
      { id: 'd4-riddles', label: 'Farm Riddle Reader', emoji: '📜' },
      { id: 'd4-detective', label: 'Farm Detective', emoji: '🔍' },
    ],
    reflection: {
      question: 'What is the best thing you learned today?',
      choices: [
        { id: 'hay', label: 'That dry hay floats on water', correct: false },
        { id: 'cow', label: 'That a cow gives us milk', correct: false },
        { id: 'pig', label: 'That a pig loves the mud', correct: false },
        { id: 'all', label: 'All of it', correct: true },
      ],
      correctReply: 'Exactly, Yousef! You learned so much on the farm today! 🌟',
      wrongReply: 'Yes! But not only that... you learned this and much more today! 😊',
    },
    finishLabel: 'I finished Day 4! 🎉',
  },
}

export default day4
