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
  level: 'Basic' | 'Intermediate' | 'Advanced';
  color: string;
}

export const grammarCourseData: GrammarChapter[] = [
  // --- BASIC LEVEL (Existing) ---
  {
    id: "1",
    title: "1. The Plural",
    description: "Rules for making nouns plural (s, es, ies, ves)",
    level: "Basic",
    color: "from-emerald-500 to-teal-500",
    rules: "**Core Concept**\n**Singular**: Represents **one** person, place, or thing (e.g., *a book, one cat*).\n**Plural**: Represents **more than one** (e.g., *two books, many cats*).\n\n**1. Standard Rules**\n- **Add -s**: Most nouns simply take an -s.\n  *(cat → cats, house → houses)*\n- **Add -es**: Words ending in **-s, -sh, -ch, -x, -o**.\n  *(bus → buses, box → boxes, potato → potatoes)*\n- **Change -y to -ies**: When a word ends in a **consonant + y**.\n  *(baby → babies, city → cities)*\n  *Note: If it ends in vowel + y, just add -s (boy → boys).*\n- **Change -f/-fe to -ves**: Words ending in f or fe.\n  *(knife → knives, life → lives, wolf → wolves)*\n\n**2. Irregular Plurals**\nThese words change form completely and must be memorized:\n- man → **men**\n- woman → **women**\n- child → **children**\n- mouse → **mice**\n- foot → **feet**\n- tooth → **teeth**\n- person → **people**\n\n**3. Special Cases**\n- **The Plural of 'One'**: We use **ones** as a pronoun to avoid repeating a noun.\n  *(e.g., 'I like the red apples, not the green **ones**.')*\n- **Numbers**: Numbers other than 1 (including 0, decimals, and negatives) usually take the plural noun form.\n  *(e.g., '0 degrees', '-1 points', '1.5 hours').*",
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
    level: "Basic",
    color: "from-blue-500 to-indigo-500",
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
    level: "Basic",
    color: "from-purple-500 to-fuchsia-500",
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
    level: "Basic",
    color: "from-pink-500 to-rose-500",
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
    level: "Basic",
    color: "from-orange-400 to-amber-500",
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
    level: "Basic",
    color: "from-teal-400 to-cyan-500",
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
    level: "Basic",
    color: "from-cyan-500 to-sky-500",
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
    level: "Basic",
    color: "from-indigo-500 to-violet-500",
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
    level: "Basic",
    color: "from-violet-500 to-purple-500",
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
    level: "Basic",
    color: "from-rose-500 to-red-500",
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
    level: "Basic",
    color: "from-amber-500 to-yellow-500",
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
    level: "Basic",
    color: "from-sky-500 to-blue-500",
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
    level: "Basic",
    color: "from-lime-500 to-green-500",
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
    level: "Basic",
    color: "from-fuchsia-500 to-pink-500",
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
    level: "Basic",
    color: "from-blue-600 to-cyan-600",
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
    level: "Basic",
    color: "from-red-500 to-orange-500",
    rules: "**Simple**: Habits, facts (every day, usually).\n**Progressive**: Now, at the moment.\n\nCompare:\nI usually **drink** tea (Habit).\nI **am drinking** coffee now (Now).",
    exercises: [
      { id: "sp1", question: "(go)", beforeInput: "He often", afterInput: " to the park.", correctAnswers: ["goes"], placeholder: "...", explanation: "'Often' implies a habit -> Simple Present (He goes)." },
      { id: "sp2", question: "(go)", beforeInput: "Look! He", afterInput: " to the park.", correctAnswers: ["is going"], placeholder: "...", explanation: "'Look!' implies happening now -> Present Continuous (He is going)." },
      { id: "sp3", question: "(drink)", beforeInput: "I never", afterInput: " beer.", correctAnswers: ["drink"], placeholder: "...", explanation: "'Never' implies a fact/habit -> Simple Present (I drink)." },
      { id: "sp4", question: "(cry)", beforeInput: "Listen! The baby", afterInput: ".", correctAnswers: ["is crying"], placeholder: "...", explanation: "'Listen!' implies happening now -> Present Continuous (is crying)." }
    ]
  },

  // --- INTERMEDIATE LEVEL (CEFR A2) - ENGLISH-4U.DE ---
  {
    id: "int-1",
    title: "17. Some or Any",
    description: "Positive vs. Negative statements, Questions, and Compounds",
    level: "Intermediate",
    color: "from-indigo-500 to-blue-500",
    rules: "**SOME**\n1. Positive sentences and demands.\n*I bought **some** milk. Give me **some** juice, please.*\n2. Polite questions expecting 'YES'.\n*Would you like **some** coffee?*\n\n**ANY**\n1. Questions.\n*Have you got **any** blue shoes?*\n2. Negations.\n*No, I haven't got **any**.*\n3. Conditional clauses.\n*If I had **any**, I would wear them.*\n\n**Compounds**: Something/Anything, Someone/Anyone, Somewhere/Anywhere follow the same rules.",
    exercises: [
      { id: "sa_1", question: "", beforeInput: "I'm going to buy", afterInput: "posters.", correctAnswers: ["some"], placeholder: "...", explanation: "Positive sentence -> some." },
      { id: "sa_2", question: "", beforeInput: "They didn't have", afterInput: "hair clasps.", correctAnswers: ["any"], placeholder: "...", explanation: "Negative sentence (didn't) -> any." },
      { id: "sa_3", question: "", beforeInput: "Have you got", afterInput: "brothers or sisters?", correctAnswers: ["any"], placeholder: "...", explanation: "Question -> any." },
      { id: "sa_4", question: "", beforeInput: "I haven't got", afterInput: "stamps.", correctAnswers: ["any"], placeholder: "...", explanation: "Negative sentence -> any." },
      { id: "sa_5", question: "", beforeInput: "Would you like", afterInput: "tea?", correctAnswers: ["some"], placeholder: "...", explanation: "Polite offer -> some." },
      { id: "sa_6", question: "", beforeInput: "Tell me", afterInput: "exciting.", correctAnswers: ["something"], placeholder: "...", explanation: "Positive sentence -> something." },
      { id: "sa_7", question: "", beforeInput: "I didn't say", afterInput: ".", correctAnswers: ["anything"], placeholder: "...", explanation: "Negative sentence -> anything." },
      { id: "sa_8", question: "", beforeInput: "Does", afterInput: "know the answer?", correctAnswers: ["anyone"], placeholder: "...", explanation: "Question -> anyone." }
    ]
  },
  {
    id: "int-2",
    title: "18. Past Simple",
    description: "Actions completed in the past.",
    level: "Intermediate",
    color: "from-blue-600 to-sky-600",
    rules: "**Regular Verbs**: Verb + **ed** (walk -> walked, cry -> cried, stop -> stopped).\n**Irregular Verbs**: Memorize the list (go -> went, see -> saw, buy -> bought).\n\n**Negation**: **didn't** + Infinitive (He didn't go).\n**Questions**: **Did** + Subject + Infinitive (Did he go?).\n\n*Keywords*: yesterday, last week, in 1999, ago.",
    exercises: [
      { id: "ps_1", question: "(win)", beforeInput: "She", afterInput: "the money.", correctAnswers: ["won"], placeholder: "...", explanation: "Irregular verb: win -> won." },
      { id: "ps_2", question: "(can)", beforeInput: "They", afterInput: "eat.", correctAnswers: ["could"], placeholder: "...", explanation: "Irregular verb: can -> could." },
      { id: "ps_3", question: "(go)", beforeInput: "She must", afterInput: ".", correctAnswers: ["go"], placeholder: "...", explanation: "After must -> infinitive. But in Past Simple context 'had to go'. Here implies 'went'. Let's stick to simple past forms: She went." },
      { id: "ps_4", question: "(buy)", beforeInput: "We", afterInput: "a new car.", correctAnswers: ["bought"], placeholder: "...", explanation: "Irregular verb: buy -> bought." },
      { id: "ps_5", question: "(study)", beforeInput: "She", afterInput: "for a test.", correctAnswers: ["studied"], placeholder: "...", explanation: "Regular verb ending in y -> ied." },
      { id: "ps_6", question: "(write)", beforeInput: "Paula", afterInput: "back.", correctAnswers: ["wrote"], placeholder: "...", explanation: "Irregular verb: write -> wrote." },
      { id: "ps_7", question: "Negation", beforeInput: "Paula", afterInput: "back.", correctAnswers: ["didn't write", "did not write"], placeholder: "...", explanation: "Negation: didn't + infinitive." },
      { id: "ps_8", question: "Question", beforeInput: "", afterInput: "he take a shower?", correctAnswers: ["Did"], placeholder: "...", explanation: "Question: Did + subject." }
    ]
  },
  {
    id: "int-3",
    title: "19. Future Tenses",
    description: "Simple Future (Will) vs. Going To Future",
    level: "Intermediate",
    color: "from-sky-500 to-cyan-500",
    rules: "**Simple Future (Will)**:\n- Predictions, spontaneous decisions, promises.\n- *I think I **will** go. I **will** help you.*\n\n**Going To Future**:\n- Plans, intentions, evidence.\n- *I **am going to** visit her. Look at the clouds, it **is going to** rain.*",
    exercises: [
      { id: "fut_1", question: "(meet)", beforeInput: "I think I", afterInput: "her tomorrow.", correctAnswers: ["will meet"], placeholder: "...", explanation: "Prediction/Opinion with 'think' -> will." },
      { id: "fut_2", question: "(play)", beforeInput: "I am going to", afterInput: "football.", correctAnswers: ["play"], placeholder: "...", explanation: "Going to + infinitive." },
      { id: "fut_3", question: "(rain)", beforeInput: "The sky is grey. It", afterInput: ".", correctAnswers: ["is going to rain"], placeholder: "...", explanation: "Evidence (clouds) -> going to." },
      { id: "fut_4", question: "(phone)", beforeInput: "I promise, I", afterInput: "you.", correctAnswers: ["will phone"], placeholder: "...", explanation: "Promise -> will." },
      { id: "fut_5", question: "(visit)", beforeInput: "She", afterInput: "her aunt.", correctAnswers: ["is going to visit"], placeholder: "...", explanation: "Plan/Intention -> going to." },
      { id: "fut_6", question: "(pass)", beforeInput: "I guess they", afterInput: "the exam.", correctAnswers: ["will pass"], placeholder: "...", explanation: "Guess/Prediction -> will." }
    ]
  },
  {
    id: "int-4",
    title: "20. Comparison of Adjectives",
    description: "Comparative (-er) and Superlative (-est)",
    level: "Intermediate",
    color: "from-cyan-600 to-teal-600",
    rules: "**Short Adjectives**: add **-er** / **-est** (old -> older -> oldest).\n**Ending in -y**: change to **-ier** / **-iest** (happy -> happier -> happiest).\n**Long Adjectives**: use **more** / **most** (beautiful -> more beautiful -> most beautiful).\n\n**Irregular**: good -> better -> best; bad -> worse -> worst.",
    exercises: [
      { id: "comp_1", question: "strong", beforeInput: "strong ->", afterInput: "-> strongest", correctAnswers: ["stronger"], placeholder: "...", explanation: "Comparative of strong." },
      { id: "comp_2", question: "happy", beforeInput: "happy ->", afterInput: "-> happiest", correctAnswers: ["happier"], placeholder: "...", explanation: "Y changes to I." },
      { id: "comp_3", question: "beautiful", beforeInput: "beautiful ->", afterInput: "", correctAnswers: ["more beautiful"], placeholder: "...", explanation: "Long adjective -> more." },
      { id: "comp_4", question: "good", beforeInput: "good ->", afterInput: "", correctAnswers: ["better"], placeholder: "...", explanation: "Irregular comparative." },
      { id: "comp_5", question: "big", beforeInput: "Sue's car isn't big. She wants a", afterInput: "car.", correctAnswers: ["bigger"], placeholder: "...", explanation: "Double consonant for short vowels." },
      { id: "comp_6", question: "expensive", beforeInput: "Which dress is the", afterInput: "?", correctAnswers: ["most expensive"], placeholder: "...", explanation: "Superlative of long adjective." }
    ]
  },
  {
    id: "int-5",
    title: "21. Prepositions of Place",
    description: "AT, ON, IN, TO, INTO, BY",
    level: "Intermediate",
    color: "from-teal-500 to-emerald-500",
    rules: "**AT**: Specific point/event (at the door, at school, at a party).\n**ON**: Surface/line (on the wall, on the floor, on a river).\n**IN**: Enclosed space/towns (in the garden, in London, in a book).\n**TO**: Movement (go to work).\n**BY**: Travel method (by car, by bus).",
    exercises: [
      { id: "prep_p1", question: "", beforeInput: "Bill is waiting", afterInput: "the bus stop.", correctAnswers: ["at"], placeholder: "...", explanation: "Specific point." },
      { id: "prep_p2", question: "", beforeInput: "The picture is", afterInput: "the wall.", correctAnswers: ["on"], placeholder: "...", explanation: "Surface." },
      { id: "prep_p3", question: "", beforeInput: "She lives", afterInput: "a small village.", correctAnswers: ["in"], placeholder: "...", explanation: "Enclosed area/Town." },
      { id: "prep_p4", question: "", beforeInput: "We went", afterInput: "Paris by plane.", correctAnswers: ["to"], placeholder: "...", explanation: "Movement towards." },
      { id: "prep_p5", question: "", beforeInput: "He opened the door and went", afterInput: "the room.", correctAnswers: ["into"], placeholder: "...", explanation: "Movement entering." },
      { id: "prep_p6", question: "", beforeInput: "I usually go to work", afterInput: "car.", correctAnswers: ["by"], placeholder: "...", explanation: "Method of travel." }
    ]
  },
  {
    id: "int-6",
    title: "22. Prepositions of Time",
    description: "AT, ON, IN, DURING, UNTIL",
    level: "Intermediate",
    color: "from-emerald-600 to-green-600",
    rules: "**AT**: Clock time, holidays (at 5 o'clock, at Christmas, at night).\n**ON**: Days, dates (on Monday, on May 16th).\n**IN**: Months, years, seasons, periods (in April, in 1999, in winter, in the morning).\n**DURING**: When something happens (during the film).\n**UNTIL**: How long something continues (until 9 o'clock).",
    exercises: [
      { id: "prep_t1", question: "", beforeInput: "Tom gets up", afterInput: "7 o'clock.", correctAnswers: ["at"], placeholder: "...", explanation: "Specific time." },
      { id: "prep_t2", question: "", beforeInput: "Her birthday is", afterInput: "May 16th.", correctAnswers: ["on"], placeholder: "...", explanation: "Specific date." },
      { id: "prep_t3", question: "", beforeInput: "We go on holiday", afterInput: "August.", correctAnswers: ["in"], placeholder: "...", explanation: "Month." },
      { id: "prep_t4", question: "", beforeInput: "I fell asleep", afterInput: "the film.", correctAnswers: ["during"], placeholder: "...", explanation: "During an event." },
      { id: "prep_t5", question: "", beforeInput: "I stayed in bed", afterInput: "half past nine.", correctAnswers: ["until", "till"], placeholder: "...", explanation: "Up to a certain time." },
      { id: "prep_t6", question: "", beforeInput: "Are you doing anything", afterInput: "the weekend?", correctAnswers: ["at"], placeholder: "...", explanation: "at the weekend." }
    ]
  },
  {
    id: "int-7",
    title: "23. Adjective or Adverb",
    description: "Describing Nouns vs. Verbs",
    level: "Intermediate",
    color: "from-green-500 to-lime-500",
    rules: "**Adjective**: Describes a noun (a **clever** boy).\n**Adverb**: Describes a verb, usually adds **-ly** (he writes **badly**).\n\n**Exceptions**: good -> well, fast -> fast, hard -> hard.",
    exercises: [
      { id: "adv_1", question: "(clever)", beforeInput: "He is a", afterInput: "boy.", correctAnswers: ["clever"], placeholder: "...", explanation: "Describes the noun 'boy'." },
      { id: "adv_2", question: "(quiet)", beforeInput: "She went to bed", afterInput: ".", correctAnswers: ["quietly"], placeholder: "...", explanation: "Describes the verb 'went'." },
      { id: "adv_3", question: "(good)", beforeInput: "He writes", afterInput: ".", correctAnswers: ["well"], placeholder: "...", explanation: "Irregular adverb of good." },
      { id: "adv_4", question: "(careful)", beforeInput: "You should speak more", afterInput: ".", correctAnswers: ["carefully"], placeholder: "...", explanation: "Adverb describing 'speak'." },
      { id: "adv_5", question: "(fast)", beforeInput: "He drives very", afterInput: ".", correctAnswers: ["fast"], placeholder: "...", explanation: "Fast is both adj and adv." },
      { id: "adv_6", question: "(hard)", beforeInput: "He works", afterInput: ".", correctAnswers: ["hard"], placeholder: "...", explanation: "Hard is both adj and adv (hardly means 'barely')." }
    ]
  },
  {
    id: "int-8",
    title: "24. Possessive Pronouns",
    description: "Mine, Yours, His, Hers, Ours, Theirs",
    level: "Intermediate",
    color: "from-lime-600 to-yellow-500",
    rules: "Replaces possessive adjective + noun.\n*This is my book -> This is **mine**.*\n*Is this your car? -> Is this **yours**?*\n\nForms: mine, yours, his, hers, ours, yours, theirs.",
    exercises: [
      { id: "poss_1", question: "(my)", beforeInput: "Is this book", afterInput: "?", correctAnswers: ["mine"], placeholder: "...", explanation: "I -> mine." },
      { id: "poss_2", question: "(your)", beforeInput: "No, it is", afterInput: ".", correctAnswers: ["yours"], placeholder: "...", explanation: "You -> yours." },
      { id: "poss_3", question: "(our)", beforeInput: "This house is", afterInput: ".", correctAnswers: ["ours"], placeholder: "...", explanation: "We -> ours." },
      { id: "poss_4", question: "(her)", beforeInput: "The coat is", afterInput: ".", correctAnswers: ["hers"], placeholder: "...", explanation: "She -> hers." },
      { id: "poss_5", question: "(their)", beforeInput: "The car is", afterInput: ".", correctAnswers: ["theirs"], placeholder: "...", explanation: "They -> theirs." }
    ]
  },
  {
    id: "int-9",
    title: "25. Present Perfect Simple",
    description: "Have/Has + Past Participle",
    level: "Intermediate",
    color: "from-yellow-500 to-orange-500",
    rules: "Action happened in the past but has connection to present/result is important.\n**Form**: have/has + V3 (past participle).\n*I **have lost** my key (I don't have it now).*\n\n**Keywords**: just, already, yet, ever, never.",
    exercises: [
      { id: "pps_1", question: "(make)", beforeInput: "My sister", afterInput: "a cake.", correctAnswers: ["has made"], placeholder: "...", explanation: "She + has + V3." },
      { id: "pps_2", question: "(cook)", beforeInput: "What have you", afterInput: "?", correctAnswers: ["cooked"], placeholder: "...", explanation: "V3 of cook." },
      { id: "pps_3", question: "(not/feed)", beforeInput: "I", afterInput: "the dog yet.", correctAnswers: ["have not fed", "haven't fed"], placeholder: "...", explanation: "I + have not + V3." },
      { id: "pps_4", question: "(get)", beforeInput: "They", afterInput: "a new player.", correctAnswers: ["have got"], placeholder: "...", explanation: "They + have + V3." },
      { id: "pps_5", question: "(wash)", beforeInput: "He", afterInput: "the car.", correctAnswers: ["has washed"], placeholder: "...", explanation: "He + has + V3." }
    ]
  },
  {
    id: "int-10",
    title: "26. For or Since",
    description: "Duration vs. Starting Point",
    level: "Intermediate",
    color: "from-orange-500 to-red-500",
    rules: "**FOR**: A period of time (for 2 hours, for a long time, for 5 years).\n**SINCE**: A point in time (since 8 o'clock, since Monday, since 1994).",
    exercises: [
      { id: "fs_1", question: "", beforeInput: "I haven't been there", afterInput: "July 2005.", correctAnswers: ["since"], placeholder: "...", explanation: "Specific date." },
      { id: "fs_2", question: "", beforeInput: "Jim has studied", afterInput: "three hours.", correctAnswers: ["for"], placeholder: "...", explanation: "Period of time." },
      { id: "fs_3", question: "", beforeInput: "It has been raining", afterInput: "more than four days.", correctAnswers: ["for"], placeholder: "...", explanation: "Period of time." },
      { id: "fs_4", question: "", beforeInput: "I haven't seen him", afterInput: "Easter.", correctAnswers: ["since"], placeholder: "...", explanation: "Point in time." },
      { id: "fs_5", question: "", beforeInput: "We have lived here", afterInput: "1998.", correctAnswers: ["since"], placeholder: "...", explanation: "Specific year." }
    ]
  },
  {
    id: "int-11",
    title: "27. Present Perfect vs Past Simple",
    description: "Connection to Present vs Finished Past",
    level: "Intermediate",
    color: "from-red-500 to-rose-600",
    rules: "**Present Perfect**: Result is important now, time is not specific (I have bought a car).\n**Past Simple**: Specific time in the past, finished action (I bought a car **yesterday**).",
    exercises: [
      { id: "pp_ps_1", question: "(watch)", beforeInput: "I", afterInput: "a film yesterday.", correctAnswers: ["watched"], placeholder: "...", explanation: "Yesterday = Past Simple." },
      { id: "pp_ps_2", question: "(buy)", beforeInput: "Have you ever", afterInput: "a car?", correctAnswers: ["bought"], placeholder: "...", explanation: "Ever = Present Perfect." },
      { id: "pp_ps_3", question: "(have)", beforeInput: "Sue", afterInput: "the flu last winter.", correctAnswers: ["had"], placeholder: "...", explanation: "Last winter = Past Simple." },
      { id: "pp_ps_4", question: "(take)", beforeInput: "He has already", afterInput: "the bus.", correctAnswers: ["taken"], placeholder: "...", explanation: "Already = Present Perfect." },
      { id: "pp_ps_5", question: "(run)", beforeInput: "Last week my rabbit", afterInput: "away.", correctAnswers: ["ran"], placeholder: "...", explanation: "Last week = Past Simple." }
    ]
  },
  {
    id: "int-12",
    title: "28. Past Progressive",
    description: "Was/Were + Ing",
    level: "Intermediate",
    color: "from-rose-600 to-pink-600",
    rules: "**Form**: was/were + ing.\n**Use**: Actions in progress at a specific time in the past.\n*I **was watching** TV when she called.*\n*They **were playing** football at 5pm.*",
    exercises: [
      { id: "ppro_1", question: "(play)", beforeInput: "The girls", afterInput: "cards.", correctAnswers: ["were playing"], placeholder: "...", explanation: "Plural subject -> were playing." },
      { id: "ppro_2", question: "(look)", beforeInput: "Greg", afterInput: "for his wallet.", correctAnswers: ["was looking"], placeholder: "...", explanation: "Singular subject -> was looking." },
      { id: "ppro_3", question: "(not/wash)", beforeInput: "He", afterInput: "his car.", correctAnswers: ["was not washing", "wasn't washing"], placeholder: "...", explanation: "Negative." },
      { id: "ppro_4", question: "(do)", beforeInput: "Susan", afterInput: "her homework.", correctAnswers: ["was doing"], placeholder: "...", explanation: "Singular subject -> was doing." },
      { id: "ppro_5", question: "(wait)", beforeInput: "I", afterInput: "for her.", correctAnswers: ["was waiting"], placeholder: "...", explanation: "I -> was waiting." }
    ]
  },
  {
    id: "int-13",
    title: "29. Relative Clauses",
    description: "Who, Which, Whose",
    level: "Intermediate",
    color: "from-pink-600 to-fuchsia-600",
    rules: "**Who**: for people (*The man **who** called*).\n**Which**: for things/animals (*The car **which** I bought*).\n**Whose**: for possession (*The man **whose** car is red*).\n**That**: can replace who/which in defining clauses.",
    exercises: [
      { id: "rel_1", question: "", beforeInput: "The man", afterInput: "spoke is my father.", correctAnswers: ["who", "that"], placeholder: "...", explanation: "Person -> who." },
      { id: "rel_2", question: "", beforeInput: "The car", afterInput: "he bought was cheap.", correctAnswers: ["which", "that"], placeholder: "...", explanation: "Thing -> which." },
      { id: "rel_3", question: "", beforeInput: "Tom,", afterInput: "is my brother, won.", correctAnswers: ["who"], placeholder: "...", explanation: "Person -> who." },
      { id: "rel_4", question: "", beforeInput: "That is the man", afterInput: "house was destroyed.", correctAnswers: ["whose"], placeholder: "...", explanation: "Possession (his house) -> whose." },
      { id: "rel_5", question: "", beforeInput: "The chair on", afterInput: "I sat broke.", correctAnswers: ["which"], placeholder: "...", explanation: "Preposition + which." }
    ]
  },
  {
    id: "int-14",
    title: "30. Modal Verbs",
    description: "Can, Must, Should, May, Need",
    level: "Intermediate",
    color: "from-fuchsia-600 to-purple-600",
    rules: "**Can**: ability/permission.\n**Must**: necessity/obligation.\n**Should**: advice.\n**May/Might**: possibility.\n**Needn't**: not necessary.\n\n*Replacements*: can -> be able to; must -> have to.",
    exercises: [
      { id: "mod_1", question: "Ability", beforeInput: "I", afterInput: "speak English.", correctAnswers: ["can"], placeholder: "...", explanation: "Ability." },
      { id: "mod_2", question: "Obligation", beforeInput: "He", afterInput: "study for the test.", correctAnswers: ["must", "has to"], placeholder: "...", explanation: "Necessity." },
      { id: "mod_3", question: "Possibility", beforeInput: "I", afterInput: "go to the party.", correctAnswers: ["may", "might"], placeholder: "...", explanation: "Possibility." },
      { id: "mod_4", question: "Advice", beforeInput: "You", afterInput: "stop smoking.", correctAnswers: ["should"], placeholder: "...", explanation: "Advice." },
      { id: "mod_5", question: "No obligation", beforeInput: "You", afterInput: "hurry.", correctAnswers: ["need not", "needn't", "don't have to"], placeholder: "...", explanation: "Not necessary." }
    ]
  },
  {
    id: "int-15",
    title: "31. Conjunctions",
    description: "Because, But, And, When, Where",
    level: "Intermediate",
    color: "from-purple-600 to-indigo-600",
    rules: "**Because**: reason.\n**But**: contrast.\n**And**: addition.\n**When**: time.\n**Where**: place.",
    exercises: [
      { id: "conj_1", question: "", beforeInput: "They stayed home", afterInput: "it rained.", correctAnswers: ["because"], placeholder: "...", explanation: "Reason." },
      { id: "conj_2", question: "", beforeInput: "I wanted to help,", afterInput: "he refused.", correctAnswers: ["but"], placeholder: "...", explanation: "Contrast." },
      { id: "conj_3", question: "", beforeInput: "She had breakfast", afterInput: "left.", correctAnswers: ["and", "then"], placeholder: "...", explanation: "Sequence." },
      { id: "conj_4", question: "", beforeInput: "He came in", afterInput: "sat down.", correctAnswers: ["and"], placeholder: "...", explanation: "Addition." },
      { id: "conj_5", question: "", beforeInput: "I don't know", afterInput: "he lives.", correctAnswers: ["where"], placeholder: "...", explanation: "Place." }
    ]
  },
  {
    id: "int-16",
    title: "32. Reflexive Pronouns",
    description: "Myself, Yourself, Himself...",
    level: "Intermediate",
    color: "from-indigo-600 to-blue-600",
    rules: "Action reflects back to the subject.\nI -> **myself**\nYou -> **yourself**\nHe -> **himself**\nShe -> **herself**\nIt -> **itself**\nWe -> **ourselves**\nThey -> **themselves**",
    exercises: [
      { id: "ref_1", question: "(I)", beforeInput: "I cut", afterInput: ".", correctAnswers: ["myself"], placeholder: "...", explanation: "I -> myself." },
      { id: "ref_2", question: "(we)", beforeInput: "We enjoyed", afterInput: ".", correctAnswers: ["ourselves"], placeholder: "...", explanation: "We -> ourselves." },
      { id: "ref_3", question: "(he)", beforeInput: "He repaired the bike", afterInput: ".", correctAnswers: ["himself"], placeholder: "...", explanation: "He -> himself." },
      { id: "ref_4", question: "(she)", beforeInput: "She looked at", afterInput: "in the mirror.", correctAnswers: ["herself"], placeholder: "...", explanation: "She -> herself." },
      { id: "ref_5", question: "(you)", beforeInput: "Did you write it", afterInput: "?", correctAnswers: ["yourself"], placeholder: "...", explanation: "You -> yourself." }
    ]
  },
  {
    id: "int-17",
    title: "33. Irregular Verbs & Non-Progressive",
    description: "Verbs forms and State verbs",
    level: "Intermediate",
    color: "from-slate-500 to-slate-700",
    rules: "**Irregular**: be-was-been, go-went-gone, see-saw-seen.\n**Non-Progressive**: Verbs not usually used in -ing form (love, like, know, understand, believe, want).",
    exercises: [
      { id: "irr_1", question: "go (Past)", beforeInput: "He", afterInput: "home.", correctAnswers: ["went"], placeholder: "...", explanation: "Past of go." },
      { id: "irr_2", question: "see (Perfect)", beforeInput: "I have", afterInput: "him.", correctAnswers: ["seen"], placeholder: "...", explanation: "Past participle of see." },
      { id: "irr_3", question: "know (Progressive?)", beforeInput: "I", afterInput: "him. (am knowing / know)", correctAnswers: ["know"], placeholder: "...", explanation: "Know is non-progressive." },
      { id: "irr_4", question: "buy (Past)", beforeInput: "She", afterInput: "a hat.", correctAnswers: ["bought"], placeholder: "...", explanation: "Past of buy." },
      { id: "irr_5", question: "understand (Progressive?)", beforeInput: "I", afterInput: "you. (am understanding / understand)", correctAnswers: ["understand"], placeholder: "...", explanation: "Understand is non-progressive." }
    ]
  },
  
  // --- ADVANCED LEVEL (CEFR A2/B1) - ENGLISH-4U.DE ---
  {
    id: "adv-1",
    title: "34. Asking Questions",
    description: "Who, What, Where, When, Why, How",
    level: "Advanced",
    color: "from-rose-500 to-red-600",
    rules: "**Subject Questions** (Who/What): No auxiliary verb.\n*Who opened the door?*\n\n**Object Questions**: Use do/does/did.\n*Who did they greet?*\n\n**Question Words**:\n- **Whose**: Possession (*Whose pen is this?*)\n- **How long**: Duration\n- **How often**: Frequency\n- **How much/many**: Quantity",
    exercises: [
      { id: "aq_1", question: "", beforeInput: "The children go to the mall.", afterInput: "goes to the mall?", correctAnswers: ["Who"], placeholder: "...", explanation: "Subject question (people) -> Who." },
      { id: "aq_2", question: "", beforeInput: "They sell 20 kilos.", afterInput: "kilos do they sell?", correctAnswers: ["How many"], placeholder: "...", explanation: "Quantity (countable) -> How many." },
      { id: "aq_3", question: "", beforeInput: "He flew to Manchester.", afterInput: "did he fly?", correctAnswers: ["Where"], placeholder: "...", explanation: "Place -> Where." },
      { id: "aq_4", question: "", beforeInput: "I saw her yesterday.", afterInput: "did you see her?", correctAnswers: ["When"], placeholder: "...", explanation: "Time -> When." },
      { id: "aq_5", question: "", beforeInput: "This is Peter's pencil.", afterInput: "pencil is this?", correctAnswers: ["Whose"], placeholder: "...", explanation: "Possession -> Whose." },
      { id: "aq_6", question: "", beforeInput: "He stayed home because he was ill.", afterInput: "did he stay home?", correctAnswers: ["Why"], placeholder: "...", explanation: "Reason -> Why." }
    ]
  },
  {
    id: "adv-2",
    title: "35. Adjectives with Prepositions",
    description: "Nice of, Angry about, Good at...",
    level: "Advanced",
    color: "from-red-600 to-orange-600",
    rules: "Certain adjectives are followed by specific prepositions:\n- **OF**: nice, kind, stupid, proud, afraid, fond\n- **TO**: married, rude, similar\n- **AT**: good, bad, surprised\n- **ABOUT**: angry, excited, sorry\n- **WITH**: bored, fed up, pleased",
    exercises: [
      { id: "adj_prep_1", question: "", beforeInput: "She is brilliant", afterInput: "repairing things.", correctAnswers: ["at"], placeholder: "...", explanation: "Brilliant/Good at doing something." },
      { id: "adj_prep_2", question: "", beforeInput: "He is married", afterInput: "his friend's sister.", correctAnswers: ["to"], placeholder: "...", explanation: "Married to someone." },
      { id: "adj_prep_3", question: "", beforeInput: "She is afraid", afterInput: "spiders.", correctAnswers: ["of"], placeholder: "...", explanation: "Afraid of something." },
      { id: "adj_prep_4", question: "", beforeInput: "I am interested", afterInput: "football.", correctAnswers: ["in"], placeholder: "...", explanation: "Interested in something." },
      { id: "adj_prep_5", question: "", beforeInput: "Are you excited", afterInput: "the holiday?", correctAnswers: ["about"], placeholder: "...", explanation: "Excited about something." },
      { id: "adj_prep_6", question: "", beforeInput: "It was nice", afterInput: "you to help me.", correctAnswers: ["of"], placeholder: "...", explanation: "Nice of someone." }
    ]
  },
  {
    id: "adv-3",
    title: "36. Conditional Clauses",
    description: "Zero, First, Second, and Third Conditionals",
    level: "Advanced",
    color: "from-orange-600 to-amber-600",
    rules: "**Zero**: General truths (If + Present, Present).\n**First**: Real possibility (If + Present, Will).\n**Second**: Unreal present (If + Past, Would).\n**Third**: Unreal past (If + Past Perfect, Would have V3).",
    exercises: [
      { id: "cond_1", question: "(rain/get)", beforeInput: "If it rains, you", afterInput: "wet.", correctAnswers: ["will get"], placeholder: "...", explanation: "First Conditional: Real possibility." },
      { id: "cond_2", question: "(have/buy)", beforeInput: "If I", afterInput: "enough money, I would buy a car.", correctAnswers: ["had"], placeholder: "...", explanation: "Second Conditional: Unreal/Hypothetical." },
      { id: "cond_3", question: "(study/pass)", beforeInput: "If he had studied, he", afterInput: "the exam.", correctAnswers: ["would have passed"], placeholder: "...", explanation: "Third Conditional: Past unreal." },
      { id: "cond_4", question: "(heat/boil)", beforeInput: "If you heat water to 100°C, it", afterInput: ".", correctAnswers: ["boils"], placeholder: "...", explanation: "Zero Conditional: Scientific fact." },
      { id: "cond_5", question: "(be/go)", beforeInput: "If I", afterInput: "you, I wouldn't do that.", correctAnswers: ["were", "was"], placeholder: "...", explanation: "Second Conditional: Advice (If I were you)." },
      { id: "cond_6", question: "(not/tell)", beforeInput: "She will be angry if you", afterInput: "the truth.", correctAnswers: ["do not tell", "don't tell"], placeholder: "...", explanation: "First Conditional (Negative)." }
    ]
  },
  {
    id: "adv-4",
    title: "37. Advanced Future Tenses",
    description: "Will, Going to, Present Progressive, Present Simple",
    level: "Advanced",
    color: "from-amber-600 to-yellow-600",
    rules: "**Will**: Predictions, promises, spontaneous decisions.\n**Going to**: Plans, intentions, evidence.\n**Present Progressive**: Fixed arrangements (*I'm meeting him tonight*).\n**Present Simple**: Timetables (*The train leaves at 5*).",
    exercises: [
      { id: "afut_1", question: "(meet)", beforeInput: "I", afterInput: "them tomorrow evening. (Plan)", correctAnswers: ["am going to meet", "am meeting"], placeholder: "...", explanation: "Plan/Arrangement." },
      { id: "afut_2", question: "(help)", beforeInput: "I think he", afterInput: "you.", correctAnswers: ["will help"], placeholder: "...", explanation: "Prediction/Opinion." },
      { id: "afut_3", question: "(leave)", beforeInput: "The train", afterInput: "at 10:20.", correctAnswers: ["leaves"], placeholder: "...", explanation: "Timetable -> Present Simple." },
      { id: "afut_4", question: "(rain)", beforeInput: "Look at the clouds! It", afterInput: ".", correctAnswers: ["is going to rain"], placeholder: "...", explanation: "Evidence -> Going to." },
      { id: "afut_5", question: "(phone)", beforeInput: "I promise I", afterInput: "you.", correctAnswers: ["will phone"], placeholder: "...", explanation: "Promise -> Will." }
    ]
  },
  {
    id: "adv-5",
    title: "38. Passive Voice",
    description: "Form of 'to be' + Past Participle",
    level: "Advanced",
    color: "from-yellow-600 to-lime-600",
    rules: "Active: Subject + Verb + Object.\nPassive: Object + be + V3 + (by Agent).\n\n*Simple Present*: is/are cleaned\n*Simple Past*: was/were cleaned\n*Future*: will be cleaned\n*Perfect*: has/have been cleaned",
    exercises: [
      { id: "pass_1", question: "Present", beforeInput: "The room", afterInput: "every day. (clean)", correctAnswers: ["is cleaned"], placeholder: "...", explanation: "Present Passive." },
      { id: "pass_2", question: "Past", beforeInput: "This house", afterInput: "in 1900. (build)", correctAnswers: ["was built"], placeholder: "...", explanation: "Past Passive." },
      { id: "pass_3", question: "Future", beforeInput: "The letter", afterInput: "tomorrow. (send)", correctAnswers: ["will be sent"], placeholder: "...", explanation: "Future Passive." },
      { id: "pass_4", question: "Present Perfect", beforeInput: "The car", afterInput: ". (steal)", correctAnswers: ["has been stolen"], placeholder: "...", explanation: "Perfect Passive." },
      { id: "pass_5", question: "Active->Passive", beforeInput: "Someone stole my bike. -> My bike", afterInput: ".", correctAnswers: ["was stolen"], placeholder: "...", explanation: "Transform to passive." }
    ]
  },
  {
    id: "adv-6",
    title: "39. Reported Speech",
    description: "Backshifting Tenses",
    level: "Advanced",
    color: "from-lime-600 to-green-600",
    rules: "When reporting statements from the past, tenses usually shift back:\n- Present -> Past\n- Past -> Past Perfect\n- Will -> Would\n- Can -> Could\n\n*He said, 'I am happy'* -> *He said that he was happy.*",
    exercises: [
      { id: "rep_1", question: "'I am tired.'", beforeInput: "He said that he", afterInput: "tired.", correctAnswers: ["was"], placeholder: "...", explanation: "am -> was." },
      { id: "rep_2", question: "'I like coffee.'", beforeInput: "She said that she", afterInput: "coffee.", correctAnswers: ["liked"], placeholder: "...", explanation: "like -> liked." },
      { id: "rep_3", question: "'I went to the cinema.'", beforeInput: "She said she", afterInput: "to the cinema.", correctAnswers: ["had gone"], placeholder: "...", explanation: "went -> had gone." },
      { id: "rep_4", question: "'I will help you.'", beforeInput: "He said he", afterInput: "help me.", correctAnswers: ["would"], placeholder: "...", explanation: "will -> would." },
      { id: "rep_5", question: "'Where do you live?'", beforeInput: "He asked me where I", afterInput: ".", correctAnswers: ["lived"], placeholder: "...", explanation: "Question backshift." }
    ]
  },
  {
    id: "adv-7",
    title: "40. Present Perfect Progressive",
    description: "Have/Has been + ing",
    level: "Advanced",
    color: "from-green-600 to-emerald-600",
    rules: "Action started in the past and is still continuing, or has just finished with a result in the present.\n**Structure**: have/has + been + verb-ing\n*It has been raining for hours.*",
    exercises: [
      { id: "ppp_1", question: "(rain)", beforeInput: "It", afterInput: "for hours.", correctAnswers: ["has been raining"], placeholder: "...", explanation: "Continuous action." },
      { id: "ppp_2", question: "(wait)", beforeInput: "I", afterInput: "for the bus for 20 mins.", correctAnswers: ["have been waiting"], placeholder: "...", explanation: "Duration (for)." },
      { id: "ppp_3", question: "(play)", beforeInput: "He is tired. He", afterInput: "football.", correctAnswers: ["has been playing"], placeholder: "...", explanation: "Result in present." },
      { id: "ppp_4", question: "(watch)", beforeInput: "She", afterInput: "TV all day.", correctAnswers: ["has been watching"], placeholder: "...", explanation: "Duration (all day)." },
      { id: "ppp_5", question: "(work)", beforeInput: "How long", afterInput: "here? (you)", correctAnswers: ["have you been working"], placeholder: "...", explanation: "Question form." }
    ]
  },
  {
    id: "adv-8",
    title: "41. Past Perfect Simple",
    description: "Had + Past Participle",
    level: "Advanced",
    color: "from-emerald-600 to-teal-600",
    rules: "An action that happened **before** another action in the past.\n**Structure**: had + V3\n*When I arrived, the train **had left**.*",
    exercises: [
      { id: "ppast_1", question: "(leave)", beforeInput: "When I arrived, the train", afterInput: ".", correctAnswers: ["had left"], placeholder: "...", explanation: "Happened before arrival." },
      { id: "ppast_2", question: "(eat)", beforeInput: "After they", afterInput: "dinner, they went out.", correctAnswers: ["had eaten", "had had"], placeholder: "...", explanation: "First action." },
      { id: "ppast_3", question: "(finish)", beforeInput: "She went home because she", afterInput: "her work.", correctAnswers: ["had finished"], placeholder: "...", explanation: "Reason in the past." },
      { id: "ppast_4", question: "(not/see)", beforeInput: "I didn't know him because I", afterInput: "him before.", correctAnswers: ["had not seen", "hadn't seen"], placeholder: "...", explanation: "Negative." },
      { id: "ppast_5", question: "(forget)", beforeInput: "He told me that he", afterInput: "the keys.", correctAnswers: ["had forgotten"], placeholder: "...", explanation: "Reported past action." }
    ]
  },
  {
    id: "adv-9",
    title: "42. Mixed Tenses",
    description: "Choosing the correct tense in context",
    level: "Advanced",
    color: "from-teal-600 to-cyan-600",
    rules: "Combine your knowledge of Present, Past, Future, and Perfect tenses to select the correct form based on the time markers (yesterday, now, since, for, tomorrow, etc.).",
    exercises: [
      { id: "mix_1", question: "(snow)", beforeInput: "Look! It", afterInput: "now.", correctAnswers: ["is snowing"], placeholder: "...", explanation: "Now -> Present Continuous." },
      { id: "mix_2", question: "(go)", beforeInput: "I", afterInput: "to the cinema yesterday.", correctAnswers: ["went"], placeholder: "...", explanation: "Yesterday -> Past Simple." },
      { id: "mix_3", question: "(live)", beforeInput: "She", afterInput: "in London for 5 years.", correctAnswers: ["has lived", "has been living"], placeholder: "...", explanation: "For -> Present Perfect." },
      { id: "mix_4", question: "(wait)", beforeInput: "When I arrived, he", afterInput: "for me.", correctAnswers: ["was waiting"], placeholder: "...", explanation: "Interrupted action -> Past Continuous." },
      { id: "mix_5", question: "(visit)", beforeInput: "I", afterInput: "my grandma next week.", correctAnswers: ["am going to visit", "will visit"], placeholder: "...", explanation: "Next week -> Future." }
    ]
  },
  {
    id: "adv-10",
    title: "43. Word Order",
    description: "Subject, Verb, Object, Place, Time",
    level: "Advanced",
    color: "from-cyan-600 to-sky-600",
    rules: "Standard English Order: **Subject + Verb + Object**.\nAdverbs: **Manner** -> **Place** -> **Time**.\n*He played football (O) in the park (P) yesterday (T).*\nFrequency adverbs go before the main verb.",
    exercises: [
      { id: "wo_1", question: "always / car / he / his / washes", beforeInput: "", afterInput: ".", correctAnswers: ["He always washes his car"], placeholder: "Reorder...", explanation: "Subject + Freq + Verb + Object." },
      { id: "wo_2", question: "yesterday / bought / I / book / a", beforeInput: "", afterInput: ".", correctAnswers: ["I bought a book yesterday"], placeholder: "Reorder...", explanation: "Subject + Verb + Object + Time." },
      { id: "wo_3", question: "London / to / we / went / last year", beforeInput: "", afterInput: ".", correctAnswers: ["We went to London last year"], placeholder: "Reorder...", explanation: "Subject + Verb + Place + Time." },
      { id: "wo_4", question: "slowly / walked / the / old / man", beforeInput: "", afterInput: ".", correctAnswers: ["The old man walked slowly"], placeholder: "Reorder...", explanation: "Subject + Verb + Manner." },
      { id: "wo_5", question: "football / play / don't / often / they", beforeInput: "", afterInput: ".", correctAnswers: ["They don't often play football", "They do not often play football"], placeholder: "Reorder...", explanation: "Negative Sentence." }
    ]
  },
  {
    id: "adv-11",
    title: "44. Gerund or Infinitive",
    description: "Verbs followed by -ing or to...",
    level: "Advanced",
    color: "from-sky-600 to-blue-600",
    rules: "**Gerund (-ing)**: enjoy, mind, avoid, finish, suggest.\n**Infinitive (to ...)**: want, decide, hope, promise, offer.\n**Both**: like, love, hate, start (often with little difference).",
    exercises: [
      { id: "gi_1", question: "(go)", beforeInput: "I enjoy", afterInput: "to the cinema.", correctAnswers: ["going"], placeholder: "...", explanation: "Enjoy + Gerund." },
      { id: "gi_2", question: "(help)", beforeInput: "She offered", afterInput: "me.", correctAnswers: ["to help"], placeholder: "...", explanation: "Offer + Infinitive." },
      { id: "gi_3", question: "(smoke)", beforeInput: "He stopped", afterInput: ".", correctAnswers: ["smoking"], placeholder: "...", explanation: "Stop + Gerund (cease action)." },
      { id: "gi_4", question: "(buy)", beforeInput: "I decided", afterInput: "a new car.", correctAnswers: ["to buy"], placeholder: "...", explanation: "Decide + Infinitive." },
      { id: "gi_5", question: "(open)", beforeInput: "Would you mind", afterInput: "the window?", correctAnswers: ["opening"], placeholder: "...", explanation: "Mind + Gerund." }
    ]
  },
  {
    id: "adv-12",
    title: "45. Irregular Verbs List",
    description: "Forms: Base, Past, Participle",
    level: "Advanced",
    color: "from-blue-600 to-indigo-600",
    rules: "Review of common irregular verbs.\nExamples:\n- go / went / gone\n- see / saw / seen\n- buy / bought / bought",
    exercises: [
      { id: "irr_adv_1", question: "fly (Past Participle)", beforeInput: "He has", afterInput: "to New York.", correctAnswers: ["flown"], placeholder: "...", explanation: "fly - flew - flown." },
      { id: "irr_adv_2", question: "forget (Past)", beforeInput: "I", afterInput: "my keys yesterday.", correctAnswers: ["forgot"], placeholder: "...", explanation: "forget - forgot - forgotten." },
      { id: "irr_adv_3", question: "wear (Past Participle)", beforeInput: "She has never", afterInput: "this dress.", correctAnswers: ["worn"], placeholder: "...", explanation: "wear - wore - worn." },
      { id: "irr_adv_4", question: "hide (Past)", beforeInput: "The cat", afterInput: "under the bed.", correctAnswers: ["hid"], placeholder: "...", explanation: "hide - hid - hidden." },
      { id: "irr_adv_5", question: "sing (Past)", beforeInput: "They", afterInput: "a song.", correctAnswers: ["sang"], placeholder: "...", explanation: "sing - sang - sung." }
    ]
  }
];
