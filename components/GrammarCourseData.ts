import React from 'react';

export interface GrammarExercise {
  id: string;
  question: string;
  beforeInput?: string;
  afterInput?: string;
  correctAnswers: string[];
  hint?: string;
  placeholder?: string;
  explanation?: string;
}

export interface GrammarChapter {
  id: string;
  title: string;
  description: string;
  rules: React.ReactNode;
  exercises: GrammarExercise[];
}

export const grammarCourseData: GrammarChapter[] = [
  {
    id: "1",
    title: "1. The Plural",
    description: "Rules for making nouns plural (s, es, ies, ves)",
    rules: "1) **Singular + s**: parrot → parrots, apple → apples.\n\n2) **Ending in y** (consonant before y) → **ies**: lolly → lollies, story → stories. (BUT: boy → boys).\n\n3) **Ending in ch, x, s, sh, o** → **es**: class → classes, box → boxes, brush → brushes.\n\n4) **Ending in f, fe, lf** → **ves**: knife → knives, wolf → wolves, life → lives.\n\n5) **Irregular**: man → men, woman → women, child → children, foot → feet, tooth → teeth, mouse → mice, person → people.",
    exercises: [
      { id: "p1", question: "", beforeInput: "an apple → 5", correctAnswers: ["apples"], placeholder: "...", explanation: "Most nouns simply add -s." },
      { id: "p2", question: "", beforeInput: "a city → 3", correctAnswers: ["cities"], placeholder: "...", explanation: "Nouns ending in consonant + y change y to -ies." },
      { id: "p3", question: "", beforeInput: "a box → 10", correctAnswers: ["boxes"], placeholder: "...", explanation: "Nouns ending in -x add -es." },
      { id: "p4", question: "", beforeInput: "a baby → 3", correctAnswers: ["babies"], placeholder: "...", explanation: "Nouns ending in consonant + y change y to -ies." },
      { id: "p5", question: "", beforeInput: "a wolf → 8", correctAnswers: ["wolves"], placeholder: "...", explanation: "Nouns ending in -f often change f to -ves." },
      { id: "p6", question: "", beforeInput: "a child → 3", correctAnswers: ["children"], placeholder: "...", explanation: "Child is an irregular noun (plural: children)." },
      { id: "p7", question: "", beforeInput: "a man → 2", correctAnswers: ["men"], placeholder: "...", explanation: "Man is an irregular noun (plural: men)." },
      { id: "p8", question: "", beforeInput: "a foot → 2", correctAnswers: ["feet"], placeholder: "...", explanation: "Foot is an irregular noun (plural: feet)." },
      { id: "p9", question: "", beforeInput: "a watch → 2", correctAnswers: ["watches"], placeholder: "...", explanation: "Nouns ending in -ch add -es." },
      { id: "p10", question: "", beforeInput: "a tomato → 1 kg", correctAnswers: ["tomatoes"], placeholder: "...", explanation: "Nouns ending in -o often add -es." }
    ]
  },
  {
    id: "2",
    title: "2. Imperatives (Commands)",
    description: "Telling someone to do something.",
    rules: "**Positive**: Use the base verb. (e.g., 'Sit down.')\n\n**Negative**: Use **Don't** or **Do not** + verb. (e.g., 'Don't shout.')\n\n**Polite**: Add 'please'. (e.g., 'Help me, please.')",
    exercises: [
      { id: "imp1", question: "(clean)", beforeInput: "", afterInput: " your shoes.", correctAnswers: ["Clean"], placeholder: "...", explanation: "Use the base form of the verb for commands." },
      { id: "imp2", question: "(not/read)", beforeInput: "", afterInput: " your emails.", correctAnswers: ["Don't read", "Do not read"], placeholder: "...", explanation: "Use 'Don't' + verb for negative commands." },
      { id: "imp3", question: "(phone)", beforeInput: "", afterInput: " her, please.", correctAnswers: ["Phone"], placeholder: "...", explanation: "Use the base form of the verb." },
      { id: "imp4", question: "(not/eat)", beforeInput: "", afterInput: " ice cream in winter.", correctAnswers: ["Don't eat", "Do not eat"], placeholder: "...", explanation: "Use 'Don't' + verb for negative commands." },
      { id: "imp5", question: "(not/stay)", beforeInput: "", afterInput: " out too late.", correctAnswers: ["Don't stay", "Do not stay"], placeholder: "...", explanation: "Use 'Don't' + verb for negative commands." }
    ]
  },
  {
    id: "3",
    title: "3. Forms of 'to be'",
    description: "Am, Is, Are - Positive, Negative, Questions",
    rules: "**Positive**:\nI am (I'm)\nYou are (You're)\nHe/She/It is (He's/She's/It's)\nWe/You/They are (We're/You're/They're)\n\n**Negative**:\nI am not\nYou are not (aren't)\nHe is not (isn't)\n\n**Question**:\nAm I...?\nAre you...?\nIs he...?",
    exercises: [
      { id: "tb1", question: "", beforeInput: "She", afterInput: " in the house.", correctAnswers: ["is"], placeholder: "...", explanation: "She + is." },
      { id: "tb2", question: "", beforeInput: "The dog and the cat", afterInput: " in the garden.", correctAnswers: ["are"], placeholder: "...", explanation: "Plural subject (dog + cat) + are." },
      { id: "tb3", question: "", beforeInput: "I", afterInput: " Kevin.", correctAnswers: ["am"], placeholder: "...", explanation: "I + am." },
      { id: "tb4", question: "", beforeInput: "Carol and I", afterInput: " friends.", correctAnswers: ["are"], placeholder: "...", explanation: "Plural subject (We) + are." },
      { id: "tb5", question: "", beforeInput: "They", afterInput: "(not) tired.", correctAnswers: ["aren't", "are not"], placeholder: "...", explanation: "They + are not (aren't)." },
      { id: "tb6", question: "", beforeInput: "", afterInput: " she lazy?", correctAnswers: ["Is"], placeholder: "...", explanation: "Question form: Is + she...?" }
    ]
  },
  {
    id: "4",
    title: "4. Possessive Adjectives",
    description: "My, Your, His, Her, Its, Our, Their",
    rules: "**I** → **my**\n**you** → **your**\n**he** → **his**\n**she** → **her**\n**it** → **its**\n**we** → **our**\n**they** → **their**\n\nExample: This is **my** book.",
    exercises: [
      { id: "pa1", question: "(I)", beforeInput: "I can't find", afterInput: " watch.", correctAnswers: ["my"], placeholder: "...", explanation: "Possessive for 'I' is 'my'." },
      { id: "pa2", question: "", beforeInput: "What's the boy's name?", afterInput: " name is Ben.", correctAnswers: ["His"], placeholder: "...", explanation: "Possessive for 'he' (boy) is 'his'." },
      { id: "pa3", question: "", beforeInput: "Debbie has got a cat.", afterInput: " cat is lively.", correctAnswers: ["Her"], placeholder: "...", explanation: "Possessive for 'she' (Debbie) is 'her'." },
      { id: "pa4", question: "", beforeInput: "The dog is cute.", afterInput: " name is Ben.", correctAnswers: ["Its"], placeholder: "...", explanation: "Possessive for 'it' (dog) is 'its' (no apostrophe)." },
      { id: "pa5", question: "", beforeInput: "We are at school.", afterInput: " school is nice.", correctAnswers: ["Our"], placeholder: "...", explanation: "Possessive for 'we' is 'our'." }
    ]
  },
  {
    id: "5",
    title: "5. A or An",
    description: "Indefinite Articles",
    rules: "Use **a** before a consonant sound (a banana, a car).\nUse **an** before a vowel sound (an apple, an orange, an hour).\n\n*Note: 'an hour' because h is silent. 'a university' because u sounds like 'yu'.*",
    exercises: [
      { id: "aa1", question: "", beforeInput: "", afterInput: " apple", correctAnswers: ["an"], placeholder: "...", explanation: "Apple starts with a vowel sound." },
      { id: "aa2", question: "", beforeInput: "", afterInput: " ugly T-shirt", correctAnswers: ["an"], placeholder: "...", explanation: "Ugly starts with a vowel sound." },
      { id: "aa3", question: "", beforeInput: "", afterInput: " hamster", correctAnswers: ["a"], placeholder: "...", explanation: "Hamster starts with a consonant sound." },
      { id: "aa4", question: "", beforeInput: "", afterInput: " hour", correctAnswers: ["an"], placeholder: "...", explanation: "Hour starts with a vowel sound (silent h)." },
      { id: "aa5", question: "", beforeInput: "", afterInput: " university", correctAnswers: ["a"], placeholder: "...", explanation: "University starts with a 'yu' sound (consonant sound)." }
    ]
  },
  {
    id: "6",
    title: "6. A, An or Some",
    description: "Countable vs Uncountable",
    rules: "Singular countable: **a** / **an** (a banana).\nPlural or Uncountable: **some** (some bananas, some milk, some water).\n\nUncountable nouns: milk, tea, money, sugar, water, homework, music, furniture.",
    exercises: [
      { id: "as1", question: "", beforeInput: "There is", afterInput: " sand in my shoe.", correctAnswers: ["some"], placeholder: "...", explanation: "Sand is uncountable." },
      { id: "as2", question: "", beforeInput: "There is", afterInput: " five-pound note.", correctAnswers: ["a"], placeholder: "...", explanation: "Note is singular countable." },
      { id: "as3", question: "", beforeInput: "There is", afterInput: " wine in the cupboard.", correctAnswers: ["some"], placeholder: "...", explanation: "Wine is uncountable." },
      { id: "as4", question: "", beforeInput: "There is", afterInput: " apple in the fridge.", correctAnswers: ["an"], placeholder: "...", explanation: "Apple is singular countable (starts with vowel)." },
      { id: "as5", question: "", beforeInput: "We need", afterInput: " sugar.", correctAnswers: ["some"], placeholder: "...", explanation: "Sugar is uncountable." }
    ]
  },
  {
    id: "7",
    title: "7. Adverbs of Frequency",
    description: "Always, Usually, Often, Sometimes, Never",
    rules: "**100%**: always\n**90%**: usually\n**70%**: often\n**50%**: sometimes\n**0%**: never\n\n**Position**:\nBefore main verb: I **always** get up at 7.\nAfter 'to be': She **is always** busy.",
    exercises: [
      { id: "af1", question: "They / transport / public / use / usually", beforeInput: "They", afterInput: " public transport.", correctAnswers: ["usually use"], placeholder: "...", explanation: "Adverb 'usually' comes before the main verb 'use'." },
      { id: "af2", question: "He / fish / dinner / seldom / has / for", beforeInput: "He", afterInput: " fish for dinner.", correctAnswers: ["seldom has"], placeholder: "...", explanation: "Adverb 'seldom' comes before the main verb 'has'." },
      { id: "af3", question: "Mary / late / is / never / work / for", beforeInput: "Mary", afterInput: " late for work.", correctAnswers: ["is never"], placeholder: "...", explanation: "Adverb 'never' comes after the verb 'to be' (is)." },
      { id: "af4", question: "We / go / theatre / often / to / the", beforeInput: "We", afterInput: " to the theatre.", correctAnswers: ["often go"], placeholder: "...", explanation: "Adverb 'often' comes before the main verb 'go'." }
    ]
  },
  {
    id: "8",
    title: "8. Present Simple",
    description: "Habits, facts, and daily routines.",
    rules: "**I/You/We/They**: base form (e.g., I play).\n**He/She/It**: verb + **s** (e.g., He plays).\n\n**Negation**: don't / doesn't.\n**Questions**: Do / Does.\n\n*Keywords*: every day, often, usually.",
    exercises: [
      { id: "ps1", question: "(go)", beforeInput: "Sarah and Pam", afterInput: " to the party.", correctAnswers: ["go"], placeholder: "...", explanation: "Plural subject (Sarah and Pam) takes base verb 'go'." },
      { id: "ps2", question: "(meet)", beforeInput: "Jenny", afterInput: " Monica.", correctAnswers: ["meets"], placeholder: "...", explanation: "Singular subject (Jenny/She) takes verb+s." },
      { id: "ps3", question: "(play)", beforeInput: "The children", afterInput: " in the garden.", correctAnswers: ["play"], placeholder: "...", explanation: "Plural subject (The children) takes base verb." },
      { id: "ps4", question: "(clean)", beforeInput: "Sally", afterInput: " the board.", correctAnswers: ["cleans"], placeholder: "...", explanation: "Singular subject (Sally/She) takes verb+s." },
      { id: "ps5", question: "(be)", beforeInput: "He", afterInput: " a bad teacher.", correctAnswers: ["is"], placeholder: "...", explanation: "He + is." }
    ]
  },
  {
    id: "9",
    title: "9. Possessive Case",
    description: "'s or s' or of",
    rules: "**Persons/Animals**:\nSingular: 's (Tom's bike)\nPlural ending in s: ' (The boys' bike)\n\n**Things**:\nUse 'of' (The door of the room)",
    exercises: [
      { id: "pc1", question: "the camera / Tom", beforeInput: "This is", afterInput: "", correctAnswers: ["Tom's camera"], placeholder: "...", explanation: "Person (Tom) takes 's." },
      { id: "pc2", question: "the eyes / the cat", beforeInput: "I see", afterInput: "", correctAnswers: ["the cat's eyes"], placeholder: "...", explanation: "Animal (cat) takes 's." },
      { id: "pc3", question: "the top / the page", beforeInput: "Look at", afterInput: "", correctAnswers: ["the top of the page"], placeholder: "...", explanation: "Inanimate object (page) usually uses 'of'." },
      { id: "pc4", question: "the toys / the children", beforeInput: "These are", afterInput: "", correctAnswers: ["the children's toys"], placeholder: "...", explanation: "Plural not ending in s (children) takes 's." }
    ]
  },
  {
    id: "10",
    title: "10. Short Answers",
    description: "Yes, I do. / No, I don't.",
    rules: "Don't just say 'Yes' or 'No'. Repeat the auxiliary verb.\n\nAre you tired? -> Yes, I am.\nDo you like football? -> Yes, I do.\nCan he swim? -> No, he can't.",
    exercises: [
      { id: "sa1", question: "Are you tired? (+)", beforeInput: "Yes,", afterInput: "", correctAnswers: ["I am"], placeholder: "...", explanation: "Question 'Are you' -> Answer 'I am'." },
      { id: "sa2", question: "Is Carol your friend? (-)", beforeInput: "No,", afterInput: "", correctAnswers: ["she isn't", "she is not"], placeholder: "...", explanation: "Question 'Is Carol' -> Answer 'she isn't'." },
      { id: "sa3", question: "Do you speak English? (+)", beforeInput: "Yes,", afterInput: "", correctAnswers: ["I do"], placeholder: "...", explanation: "Question 'Do you' -> Answer 'I do'." },
      { id: "sa4", question: "Has Peter got a dog? (-)", beforeInput: "No,", afterInput: "", correctAnswers: ["he hasn't", "he has not"], placeholder: "...", explanation: "Question 'Has Peter' -> Answer 'he hasn't'." }
    ]
  },
  {
    id: "11",
    title: "11. Question Tags",
    description: "It's nice, isn't it?",
    rules: "Positive sentence -> Negative tag.\nNegative sentence -> Positive tag.\nUse the same auxiliary (is, have, can, do).\n\nShe is nice, **isn't she**?\nYou don't like it, **do you**?",
    exercises: [
      { id: "qt1", question: "", beforeInput: "You haven't got a car,", afterInput: "?", correctAnswers: ["have you"], placeholder: "...", explanation: "Negative statement 'haven't' -> Positive tag 'have you'." },
      { id: "qt2", question: "", beforeInput: "Carol will be here soon,", afterInput: "?", correctAnswers: ["won't she"], placeholder: "...", explanation: "Positive 'will' -> Negative tag 'won't she'." },
      { id: "qt3", question: "", beforeInput: "They weren't very relaxed,", afterInput: "?", correctAnswers: ["were they"], placeholder: "...", explanation: "Negative 'weren't' -> Positive tag 'were they'." },
      { id: "qt4", question: "", beforeInput: "He lives in London,", afterInput: "?", correctAnswers: ["doesn't he"], placeholder: "...", explanation: "Present simple 'lives' uses auxiliary 'does'. Positive -> Negative 'doesn't he'." }
    ]
  },
  {
    id: "12",
    title: "12. Question Words",
    description: "Who, What, Where, When, Why, How",
    rules: "**Who** (Person)\n**What** (Thing)\n**Where** (Place)\n**When** (Time)\n**Why** (Reason)\n**How** (Manner)\n**Whose** (Possession)",
    exercises: [
      { id: "qw1", question: "", beforeInput: "", afterInput: " is your name?", correctAnswers: ["What"], placeholder: "...", explanation: "Asking about a thing/information." },
      { id: "qw2", question: "", beforeInput: "", afterInput: " do you live?", correctAnswers: ["Where"], placeholder: "...", explanation: "Asking about a place." },
      { id: "qw3", question: "(It's Kate)", beforeInput: "", afterInput: " is that girl?", correctAnswers: ["Who"], placeholder: "...", explanation: "Asking about a person." },
      { id: "qw4", question: "(Because...)", beforeInput: "", afterInput: " are you late?", correctAnswers: ["Why"], placeholder: "...", explanation: "Asking for a reason." }
    ]
  },
  {
    id: "13",
    title: "13. Personal Pronouns (Object)",
    description: "Me, You, Him, Her, It, Us, Them",
    rules: "Subject -> Object\nI -> **me**\nYou -> **you**\nHe -> **him**\nShe -> **her**\nIt -> **it**\nWe -> **us**\nThey -> **them**\n\nExample: I know **him**.",
    exercises: [
      { id: "pp1", question: "(I)", beforeInput: "Give that book to", afterInput: ".", correctAnswers: ["me"], placeholder: "...", explanation: "Object pronoun for 'I' is 'me'." },
      { id: "pp2", question: "(you)", beforeInput: "Does your friend know", afterInput: "?", correctAnswers: ["you"], placeholder: "...", explanation: "Object pronoun for 'you' is 'you'." },
      { id: "pp3", question: "(he)", beforeInput: "Ask", afterInput: " for help.", correctAnswers: ["him"], placeholder: "...", explanation: "Object pronoun for 'he' is 'him'." },
      { id: "pp4", question: "(they)", beforeInput: "We don't know", afterInput: ".", correctAnswers: ["them"], placeholder: "...", explanation: "Object pronoun for 'they' is 'them'." }
    ]
  },
  {
    id: "14",
    title: "14. What's the time?",
    description: "Telling time in English",
    rules: "Use **past** for minutes 1-30.\nUse **to** for minutes 31-59.\n15 mins = **quarter**.\n30 mins = **half**.\n\n2:10 -> Ten past two.\n2:50 -> Ten to three.",
    exercises: [
      { id: "tm1", question: "04:45", beforeInput: "It's a", afterInput: " to five.", correctAnswers: ["quarter"], placeholder: "...", explanation: "45 minutes is a quarter to the next hour." },
      { id: "tm2", question: "10:30", beforeInput: "It's", afterInput: " past ten.", correctAnswers: ["half"], placeholder: "...", explanation: "30 minutes is half past." },
      { id: "tm3", question: "08:15", beforeInput: "It's a quarter", afterInput: " eight.", correctAnswers: ["past"], placeholder: "...", explanation: "15 minutes is a quarter past." },
      { id: "tm4", question: "06:00", beforeInput: "It's six", afterInput: ".", correctAnswers: ["o'clock", "o clock"], placeholder: "...", explanation: "Exact hour uses o'clock." }
    ]
  },
  {
    id: "15",
    title: "15. Present Progressive",
    description: "Actions happening NOW (am/is/are + ing)",
    rules: "**Form**: am/is/are + verb-ing\n**Use**: Actions happening *now*.\n\nI **am playing**.\nHe **is sleeping**.\nThey **are dancing**.\n\n*Keywords*: now, at the moment, look, listen.",
    exercises: [
      { id: "pprog1", question: "(run)", beforeInput: "Look! Ann", afterInput: ".", correctAnswers: ["is running"], placeholder: "...", explanation: "Ann + is + running (double n)." },
      { id: "pprog2", question: "(watch)", beforeInput: "I", afterInput: " TV now.", correctAnswers: ["am watching", "'m watching"], placeholder: "...", explanation: "I + am + watching." },
      { id: "pprog3", question: "(not/sleep)", beforeInput: "They", afterInput: ".", correctAnswers: ["aren't sleeping", "are not sleeping"], placeholder: "...", explanation: "They + are not + sleeping." },
      { id: "pprog4", question: "(clean)", beforeInput: "", afterInput: " you cleaning your room?", correctAnswers: ["Are"], placeholder: "...", explanation: "Question form: Are + you + cleaning...?" }
    ]
  },
  {
    id: "16",
    title: "16. Simple vs Progressive",
    description: "Habits vs. Actions Now",
    rules: "**Simple**: Habits, facts (every day, usually).\n**Progressive**: Now, at the moment.\n\nCompare:\nI usually **drink** tea (Habit).\nI **am drinking** coffee now (Now).",
    exercises: [
      { id: "sp1", question: "(go)", beforeInput: "He often", afterInput: " to the park.", correctAnswers: ["goes"], placeholder: "...", explanation: "'Often' implies a habit -> Simple Present (He goes)." },
      { id: "sp2", question: "(go)", beforeInput: "Look! He", afterInput: " to the park.", correctAnswers: ["is going"], placeholder: "...", explanation: "'Look!' implies happening now -> Present Continuous (He is going)." },
      { id: "sp3", question: "(drink)", beforeInput: "I never", afterInput: " beer.", correctAnswers: ["drink"], placeholder: "...", explanation: "'Never' implies a fact/habit -> Simple Present (I drink)." },
      { id: "sp4", question: "(cry)", beforeInput: "Listen! The baby", afterInput: ".", correctAnswers: ["is crying"], placeholder: "...", explanation: "'Listen!' implies happening now -> Present Continuous (is crying)." }
    ]
  }
];
