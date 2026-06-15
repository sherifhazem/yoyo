// ============================================================
// يوسف المستكشف — اليوم الأول
// مصدر واحد لكل النصوص والتحديات والإجابات الصح.
// ============================================================

export const PLAYER_NAME = 'يوسف'

// ترتيب المشاهد. كل عنصر بيحدد المكوّن + البيئة + فئة النقاط.
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
// مشهد 1 — الاستيقاظ
// ------------------------------------------------------------
export const wakeUp = {
  intro: [
    'يوسف! أخيراً صحيت. 🌞',
    'أنا كابتن شريف — مستكشف محترف.',
    'عندنا مشكلة كبيرة. 3 حيوانات اختفوا من حديقة المدينة الليلة!',
    'محتاج مستكشف ذكي يساعدني. إنت جاهز؟',
  ],
  choices: [
    { id: 'yes', label: 'نعم، أنا جاهز! ✓', correct: true },
    { id: 'wait', label: 'محتاج دقيقة', correct: false },
  ],
  waitReply: 'خد وقتك يا يوسف 😊 لما تكون جاهز، اضغط "نعم".',
  startReply: 'عظيم يا بطل! يلا نبدأ المغامرة. 🧭',
}

// ------------------------------------------------------------
// مشهد 2 — التصنيف (سحب وإفلات)
// ------------------------------------------------------------
export const animalSort = {
  intro: 'قبل ما نبدأ، لازم تثبتلي إنك تعرف الحيوانات. كل حيوان بيعيش في بيئة معينة. رتب الحيوانات في بيئتها الصح. 🐾',
  habitats: [
    { id: 'forest', label: 'غابة', emoji: '🌳', color: '#4CAF50' },
    { id: 'water', label: 'ماء', emoji: '💧', color: '#4FC3F7' },
    { id: 'desert', label: 'صحراء', emoji: '🏜️', color: '#E3C575' },
  ],
  animals: [
    { id: 'croc', label: 'تمساح', emoji: '🐊', habitat: 'water' },
    { id: 'fox', label: 'ثعلب', emoji: '🦊', habitat: 'forest' },
    { id: 'camel', label: 'جمل', emoji: '🐪', habitat: 'desert' },
    { id: 'duck', label: 'بطة', emoji: '🦆', habitat: 'water' },
    { id: 'wolf', label: 'ذئب', emoji: '🐺', habitat: 'forest' },
    { id: 'lizard', label: 'سحلية', emoji: '🦎', habitat: 'desert' },
  ],
  wrongHints: {
    water: 'الحيوان ده بيحب الميه! 💧 جرب تاني.',
    forest: 'ده مكانه بين الشجر في الغابة! 🌳 جرب تاني.',
    desert: 'ده بيعيش في الرمل الحامي في الصحرا! 🏜️ جرب تاني.',
  },
  successReply: 'برافو يا يوسف! 🎉 صنّفت كل الحيوانات صح.',
  followUp: {
    question: 'الحيوانات اللي في الماء — إيه اللي بيجمعهم؟',
    choices: [
      { id: 'swim', label: 'بيسبحوا 🏊', correct: true },
      { id: 'fish', label: 'بياكلوا سمك 🐟', correct: false },
      { id: 'feathers', label: 'عندهم ريش 🪶', correct: false },
    ],
    correctReply: 'بالظبط! كلهم بيسبحوا في الميه. مستكشف شاطر! 🌟',
    wrongReply: 'تفكير حلو! بس فكّر تاني — إيه اللي بيعملوه كلهم في الميه؟',
  },
}

// ------------------------------------------------------------
// مشهد 3 — الإفطار والرياضيات
// ------------------------------------------------------------
export const breakfast = {
  intro: 'صباح الخير يا حبيبي يوسف ❤️ تعالى ساعدني في الفطار، وفي شوية حسابات لطيفة.',
  challenges: [
    {
      id: 'subtraction',
      speaker: 'mom',
      prompt: 'يوسف، عندنا 12 بيضة، هنستخدم 4. كام بيضة هتفضل؟',
      visual: { type: 'eggs', total: 12, removed: 4 },
      inputMode: 'both', // يقدر يكتب أو يختار
      choices: [
        { id: '6', label: '6', correct: false },
        { id: '8', label: '8', correct: true },
        { id: '10', label: '10', correct: false },
      ],
      answer: '8',
      correctReply: 'صح! 12 ناقص 4 يساوي 8 بيضات. 🥚',
      wrongReply: 'جرب تاني يا بطل — لو شلنا 4 من 12، نعدّ الباقي. 😊',
    },
    {
      id: 'multiplication',
      speaker: 'mom',
      prompt: 'هنعمل pancakes. كل pancake محتاج 2 ملعقة دقيق. عايزين 6 pancakes — كام ملعقة هنحتاج؟',
      visual: { type: 'pancakes', count: 6, perItem: 2 },
      inputMode: 'choices',
      choices: [
        { id: '8', label: '8', correct: false },
        { id: '10', label: '10', correct: false },
        { id: '12', label: '12', correct: true },
      ],
      answer: '12',
      correctReply: 'ممتاز! 6 في 2 يساوي 12 ملعقة. 🥞',
      wrongReply: 'فكّر معايا — 2 ملعقة لكل واحدة، و عندنا 6. اعدّهم! 😊',
    },
    {
      id: 'fraction',
      speaker: 'mom',
      prompt: 'الوصفة محتاجة نص كوب حليب. لو عايزين ضعف الكمية — كام هنحتاج؟',
      visual: { type: 'cup' },
      inputMode: 'choices',
      choices: [
        { id: 'half', label: 'نص كوب 🥛', correct: false },
        { id: 'full', label: 'كوب كامل 🥛', correct: true },
        { id: 'two', label: 'كوبين 🥛🥛', correct: false },
      ],
      answer: 'full',
      correctReply: 'برافو! نص + نص = كوب كامل. ده ضعف الكمية. 🌟',
      wrongReply: 'قريّب! نص الكوب مرتين بيساوي كام؟ 😊',
    },
  ],
}

// ------------------------------------------------------------
// مشهد 4 — العلوم (الطفو والغرق)
// ------------------------------------------------------------
export const floatingSink = {
  intro: 'مستكشف جيد لازم يعرف العلوم. شايف البركة دي؟ هنعمل تجربة مهمة. 🔬',
  predictPrompt: 'قبل ما نجرب — إيه رأيك في كل حاجة؟ هتطفى ولا هتغرق؟',
  items: [
    { id: 'leaf', label: 'ورقة شجر', emoji: '🍃', floats: true },
    { id: 'stone', label: 'حجر صغير', emoji: '🪨', floats: false },
    { id: 'stick', label: 'عصاية خشب', emoji: '🪵', floats: true },
    { id: 'coin', label: 'عملة معدنية', emoji: '🪙', floats: false },
    { id: 'feather', label: 'ريشة', emoji: '🪶', floats: true },
  ],
  floatLabel: 'هتطفى',
  sinkLabel: 'هتغرق',
  resultIntro: 'يلا نشوف! بنحط كل حاجة في الميه. 💦',
  conclusion: {
    question: 'لاحظت إيه؟ الحاجات الخفيفة —',
    choices: [
      { id: 'float', label: 'بتطفى', correct: true },
      { id: 'sink', label: 'بتغرق', correct: false },
      { id: 'move', label: 'بتتحرك', correct: false },
    ],
    correctReply: 'صح! الحاجات الخفيفة بتطفى فوق الميه. 🌟',
    wrongReply: 'بُص تاني للريشة والورقة — هما خفاف، عملوا إيه؟',
  },
  thinking: {
    question: 'ليه الخشبة طافت والحجر غرق؟',
    choices: [
      { id: 'lighter', label: 'الخشبة أخف من المية', correct: true },
      { id: 'bigger', label: 'الخشبة أكبر من الحجر', correct: false },
      { id: 'black', label: 'الحجر أسود', correct: false },
    ],
    correctReply: 'عبقري! 🧠 الخشبة أخف من الميه، عشان كده بتطفى.',
    wrongReply: 'فكّر في الوزن — أنهي أخف، الخشبة ولا الحجر؟',
  },
}

// ------------------------------------------------------------
// مشهد 5 — ألغاز الإنجليزي
// ------------------------------------------------------------
export const englishRiddles = {
  intro: 'لقيت 3 أوراق ملصوقة على الأشجار! كل ورقة فيها لغز بالإنجليزي. تقدر تحلهم؟ 📜',
  riddles: [
    {
      id: 'bat',
      lines: ['I sleep during the day.', 'I fly at night.', 'I use sound to find my way.', 'What am I?'],
      vocab: [{ word: 'sound', meaning: 'الصوت' }],
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
      vocab: [{ word: 'stripes', meaning: 'خطوط' }],
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
        { word: 'largest', meaning: 'الأكبر' },
        { word: 'forget', meaning: 'ينسى' },
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
// مشهد 6 — تحليل الأدلة
// ------------------------------------------------------------
export const evidence = {
  intro: 'دلوقتي عندنا كل الأدلة. لازم نعرف مين الحيوانات التلاتة اللي اختفت. 🔍',
  clues: [
    { id: 'tracks', label: 'آثار أقدام كبيرة جداً', emoji: '👣' },
    { id: 'hair', label: 'شعر أبيض وأسود على السياج', emoji: '🦓' },
    { id: 'feathers', label: 'ريش بني كبير على الأرض', emoji: '🪶' },
    { id: 'drag', label: 'أثر سحب ثقيل على الرمل', emoji: '〰️' },
  ],
  question: 'من الحيوانات دي — اختار الـ 3 اللي اختفوا',
  suspects: [
    { id: 'elephant', label: 'فيل', emoji: '🐘', guilty: true },
    { id: 'zebra', label: 'حمار وحشي', emoji: '🦓', guilty: true },
    { id: 'eagle', label: 'نسر', emoji: '🦅', guilty: true },
    { id: 'lion', label: 'أسد', emoji: '🦁', guilty: false },
    { id: 'bear', label: 'دب', emoji: '🐻', guilty: false },
  ],
  wrongReply: 'فكّر في الأدلة كويس يا يوسف. الآثار الكبيرة، الشعر الأبيض والأسود، والريش البني. 🔍',
  verification: [
    'الآثار الكبيرة = الفيل ✓ 🐘',
    'الشعر الأبيض والأسود = الحمار الوحشي ✓ 🦓',
    'الريش البني = النسر ✓ 🦅',
  ],
  successReply: 'حللت القضية يا يوسف! 🎉 إنت مستكشف حقيقي!',
  finalQuestion: {
    question: 'ليه الأسد والدب مش من الحيوانات اللي اختفت؟',
    choices: [
      { id: 'noevidence', label: 'معندهمش أدلة تخصهم', correct: true },
      { id: 'nogarden', label: 'مش بيعيشوا في الحديقة', correct: false },
      { id: 'sleeping', label: 'نايمين', correct: false },
    ],
    correctReply: 'بالظبط! مفيش أي دليل بيشاور عليهم. تفكير منطقي ممتاز! 🧠',
    wrongReply: 'فكّر تاني — هل لقينا أي دليل يخص الأسد أو الدب؟',
  },
}

// ------------------------------------------------------------
// مشهد 7 — المكافأة ودفتر المستكشف
// ------------------------------------------------------------
export const final = {
  intro: [
    'يوسف — عملت حاجة مش أي حد يعملها! 🏆',
    'صنفت الحيوانات، اتعلمت العلوم، حللت الأدلة، وقرأت الألغاز بنفسك.',
    'أنت دلوقتي مستكشف رسمي من الدرجة الأولى! 🧭',
  ],
  badges: [
    { id: 'animals', label: 'مستكشف الحيوانات — المستوى 1', emoji: '🐾' },
    { id: 'float', label: 'عالم الطفو', emoji: '💧' },
    { id: 'riddles', label: 'قارئ الألغاز', emoji: '📜' },
    { id: 'detective', label: 'محلل الأدلة', emoji: '🔍' },
  ],
  reflection: {
    question: 'إيه أكتر حاجة اكتشفتها النهارده؟',
    choices: [
      { id: 'wood', label: 'إن الخشب بيطفى', correct: false },
      { id: 'bat', label: 'إن الخفاش بيستخدم الصوت', correct: false },
      { id: 'elephant', label: 'إن الفيل أكبر حيوان على الأرض', correct: false },
      { id: 'all', label: 'كل ده', correct: true },
    ],
    correctReply: 'بالظبط يا يوسف! اتعلمت حاجات كتير النهارده. أنا فخور بيك جداً! 🌟',
    wrongReply: 'صح! بس مش ده بس... اتعلمت ده وأكتر كمان النهارده! 😊',
  },
  finishLabel: 'خلصت اليوم الأول! 🎉',
}
