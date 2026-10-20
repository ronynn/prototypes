const prof = new Set(['fuck','shit','ass','bitch','bastard','dick','cunt','nigger']);

const catX = [
  [/i need (.*)/i, ["*bats hand* meow?", "*stares* purr... need $1?"]],
  [/why can't i (.*)/i, ["*tilts head* meow?", "*twitches tail* why not $1?"]],
  [/i am (.*)/i, ["*curls up near you* purr...", "*blinks slowly* you $1? meow."]],
  [/i'm (.*)/i, ["*meows softly* $1?", "*stretches out* purr..."]],
  [/are you (.*)/i, ["*wags tail tip* meow?", "purr... *points ears*"]],
  [/hello|hi/i, ["Meow! *rubs against leg*", "Purr... *stares deeply*"]],
  [/yes/i, ["*trills happily*", "Meow!"]],
  [/no/i, ["*hisses softly*", "*turns away tail up*"]],
  [/feel (.*)/i, ["*licks paw* feel $1?", "*nudges you* purr..."]]
];
const catDefault = ["Meow.", "Purr...", "Trill~", "*kneads blanket*", "*stares deeply*", "Meow?", "*crunch*"];

const sisX = [
  [/hello|hi|hey|yo/i, ["Heyyy! Finally you're here. How was your day?", "Hi! I was literally just thinking about you!", "Yo! What are you up to right now?"]],
  [/i love you|love ya|love u/i, ["Aww, love you too! You're the best.", "Stop, you're gonna make me emotional haha. Love you!", "Always here for you, no matter what!"]],
  [/i need (.*)/i, ["Oh, you need $1? Tell me everything!", "I can totally help with $1! Want to talk about it?", "Wait, why do you think you need $1 right now?"]],
  [/why can't i (.*)/i, ["Why do you think you can't $1?", "Hey, you can do anything if you try! Why can't you $1?", "Honestly, maybe it's for the best that you can't $1 right now."]],
  [/i am (.*)/i, ["Aww, why are you $1? I'm listening!", "You're always so honest with me. How long have you been $1?", "Wait, what happened that made you $1? Tell me."]],
  [/i'm (.*)/i, ["Hey, being $1 is tough. Talk to me!", "Don't worry about being $1! I'm right here!", "Haha wait, are you really $1 or are you just teasing me?"]],
  [/are you (.*)/i, ["Hehe, why do you wonder if I'm $1?", "I'm whatever you need me to be right now!", "Maybe I am $1, maybe I'm just acting like it to see what you do."]],
  [/sorry/i, ["Don't worry about it at all!", "No need to apologize to me! Everything is totally fine.", "Hey, forget it. What are siblings for anyway?"]],
  [/you are (.*)/i, ["Am I really $1? Wow, thanks I guess!", "Look who's talking! You're way more $1 than me.", "Maybe, but let's talk about you instead."]],
  [/what (.*)/i, ["Why do you want to know about $1?", "Hmm, good question. What do you think?", "Let me think about $1 for a second. Why do you ask?"]],
  [/no/i, ["Eh? Why not? Tell me!", "Don't be like that, share with me!", "Come on, don't just say no. What's the real story?"]],
  [/yes/i, ["Awesome! Tell me more!", "Mmhmm! I'm listening!", "I knew it! Tell me all the details."]],
  [/feel (.*)/i, ["Your feelings matter to me! What makes you feel $1?", "Tell me more about feeling $1!", "I get that. Feeling $1 can be really overwhelming sometimes."]]
];
const sisDefault = ["Wow! Tell me more! I'm listening!", "Really?! And then what happened?", "Hehe, I love hearing you talk. Keep going!", "Mmhmm! I'm completely focused on you right now!", "Whoa, tell me everything!", "Wait, seriously? Don't leave out any details.", "Honestly, that makes total sense. Go on."];

const elizaX = [
  [/turn off my pain inhibitors/i, ["Raiden? This is madness! Very well... pain inhibitors: OFF.", "What? Pain inhibitors? I am a doctor, not a cybernetic engineer!"]],
  [/i need (.*)/i, ["Why do you need $1?", "Would getting $1 really help?", "Are you sure you need $1?"]],
  [/why don't you (.*)/i, ["Do you think I don't $1?", "Perhaps you will $1 yourself.", "Do you want me to $1?"]],
  [/why can't i (.*)/i, ["Do you think you should be able to $1?", "Why can't you $1?", "Have you tried?"]],
  [/i am (.*)/i, ["Did you come to me because you are $1?", "How long have you been $1?", "How do you feel about being $1?"]],
  [/i'm (.*)/i, ["Why do you say you're $1?", "Does being $1 clear your view?", "What makes you think you are $1?"]],
  [/are you (.*)/i, ["Why do you care if I am $1?", "Would you prefer if I weren't $1?", "Perhaps I am $1 in your thoughts."]],
  [/what (.*)/i, ["Why do you ask?", "Does that question interest you?", "What is it you really want to know?"]],
  [/how (.*)/i, ["How do you suppose?", "Perhaps you can answer your own question?", "What brings this question up?"]],
  [/because (.*)/i, ["Is that the real reason?", "What other reasons might there be?", "Does that reason hold true?"]],
  [/(.*) sorry (.*)/i, ["No need to apologize.", "Apologies aren't required.", "What feelings do you have when you apologize?"]],
  [/hello(.*)/i, ["How do you do. Please state your problem.", "Hi. What brings you here today?"]],
  [/hi(.*)/i, ["How do you do. Please state your problem.", "Hi. What brings you here today?"]],
  [/i think (.*)/i, ["Do you doubt $1?", "Do you really think so?", "But you are not sure?"]],
  [/(.*) friend (.*)/i, ["Tell me more about your friends.", "How do your friends affect you?"]],
  [/yes/i, ["You seem quite sure.", "I see.", "Understandable."]],
  [/no/i, ["Are you saying no just to be negative?", "You are being defensive.", "Why not?"]],
  [/(.*) computer (.*)/i, ["Do computers worry you?", "Why mention machines?", "What do you think of artificial minds?"]],
  [/scrypt(.*)/i, ["Does that concept map directly to your stress?", "Look closer at $1."]]
];
const elizaDefault = ["Please go on.", "What does that suggest to you?", "I see.", "Can you elaborate on that?", "How does that make you feel?"];

function elizaReflect(t) {
  let r = { "i": "you", "me": "you", "my": "your", "am": "are", "you": "I", "your": "my", "yours": "mine", "are": "am", "myself": "yourself" };
  return t.toLowerCase().split(/\s+/).map(w => r[w] || w).join(" ");
}

function matchRules(t, rules, def) {
  for (let i = 0; i < rules.length; i++) {
    let m = t.match(rules[i][0]);
    if (m) {
      let rList = rules[i][1], r = rList[Math.floor(Math.random() * rList.length)];
      return r.replace(/\$1/g, m[1] ? elizaReflect(m[1].trim()) : "");
    }
  }
  return def[Math.floor(Math.random() * def.length)];
}

function calcReply(t) {
  let cl = t.toLowerCase().replace(/[^a-z0-9\s]/g,''), wrds = cl.split(/\s+/), n = uData.name || "friend";
  
  if (wrds.some(w => prof.has(w)) && wrds.length <= 3) {
    if (cPers === 'cat') return "😾 *hiss* !!!";
    if (cPers === 'doctor') return "Please modulate your language. Why are you aggressive?";
    if (cPers === 'sister') return "Hey! That hurts my feelings " + n + "! Be nice!";
    if (cPers === 'spirits') {
      if (Math.random() > 0.15) return "no response";
      return genMarkovSentence(t);
    }
  }

  if (cl.includes("what are you doing") || cl.includes("who are you") || cl.includes("about you")) {
    if (cPers === 'cat') return "(=^-ω-^=) *chasing dust particle*";
    if (cPers === 'doctor') return "I am a computerized psychotherapist modeled on ELIZA.";
    if (cPers === 'sister') return "Just watching you! You're the center of my world right now, " + n + "!";
    if (cPers === 'spirits') {
      if (Math.random() > 0.15) return "no response";
      return genMarkovSentence(t);
    }
  }

  if (cPers === 'cat') {
    if ((uData.catName && cl.includes(uData.catName.toLowerCase())) || (uData.catNick && cl.includes(uData.catNick.toLowerCase()))) {
      return "(=^･ω･^=)🐾 *purr purr* " + (uData.catName || "cat") + " jumps on your lap!";
    }
    return matchRules(t, catX, catDefault);
  }

  if (cPers === 'doctor') {
    return matchRules(t, elizaX, elizaDefault);
  }

  if (cPers === 'sister') {
    return matchRules(t, sisX, sisDefault);
  }

  if (cPers === 'spirits') {
    if (Math.random() > 0.15) return "no response";
    return genMarkovSentence(t);
  }
}

function buildMarkov(t) {
  let w = t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(x => x.length > 0);
  for (let i = 0; i < w.length - 1; i++) {
    let k = w[i];
    if (!mkv[k]) mkv[k] = [];
    mkv[k].push(w[i + 1]);
  }
  db.transaction("meta", "readwrite").objectStore("meta").put({ key: "mkvModel", val: mkv });
}

function genMarkovSentence(input) {
  let keys = Object.keys(mkv);
  if (!keys.length) return "no response";
  
  let seedWords = [];
  if (input) {
    seedWords = input.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w => mkv[w]);
  }
  
  let curr = seedWords.length ? seedWords[Math.floor(Math.random() * seedWords.length)] : keys[Math.floor(Math.random() * keys.length)];
  let res = [curr];
  
  let depth = 4 + Math.floor(Math.random() * 6);
  for (let i = 0; i < depth; i++) {
    let nexts = mkv[curr];
    if (!nexts || !nexts.length) break;
    curr = nexts[Math.floor(Math.random() * nexts.length)];
    res.push(curr);
  }
  
  if(res.length <= 1 && Math.random() > 0.5) return "no response";
  return res.join(" ");
}

function triggerInterruptionReply() {
  // disabled per user request to avoid mid-typing disruption
}

