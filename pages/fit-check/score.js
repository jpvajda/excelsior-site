// Yes answers are the fit signal. The count never leaves the browser.
export const QUESTIONS = [
  {
    id: "ongoing-pain",
    text: "Do you live with ongoing pain, such as back, shoulder, neck, or joint pain, headaches, or fibromyalgia?",
  },
  {
    id: "other-symptoms",
    text: "Do you deal with other lasting symptoms like fatigue, poor sleep, IBS, dizziness, or tinnitus?",
  },
  {
    id: "calm-fear",
    text: "Do you want to calm the fear and stress that amplify your pain, alongside your medical care?",
  },
  {
    id: "fear-amplifies",
    text: "Do fear, anxiety, or hyper-vigilance amplify what you feel?",
  },
  {
    id: "lasted-or-stress",
    text: "Has pain continued after the body had time to heal, or shown up during a stressful period?",
  },
  {
    id: "symptoms-shift",
    text: "Do your symptoms shift with stress, mood, rest, or position?",
  },
  {
    id: "somatic-tracking",
    text: "Are you open to paying attention to a body sensation with calm curiosity instead of fear?",
  },
  {
    id: "emotions",
    text: "Are you willing to work through the stress, worry, and emotions that can keep the alarm switched on?",
  },
  {
    id: "video",
    text: "Can you join coaching by video?",
  },
  {
    id: "alongside-care",
    text: "Do you want coaching alongside your doctor, not as a replacement for medical care?",
  },
];

const CARE =
  "This is not a diagnosis and not a guarantee. Coaching is not medical care.";

function bandFor(yesCount) {
  if (yesCount >= 7) {
    return {
      band: "strong",
      title: "A strong candidate",
      detail: "You look like a strong candidate for Pain Reprocessing Therapy and somatic coaching.",
    };
  }
  if (yesCount >= 4) {
    return {
      band: "possible",
      title: "You could benefit",
      detail: "You could benefit, and you might not be the strongest candidate.",
    };
  }
  return {
    band: "unlikely",
    title: "Not the strongest candidate",
    detail: "You are not the strongest candidate for this coaching.",
  };
}

export function resultForYesCount(yesCount) {
  if (!Number.isInteger(yesCount) || yesCount < 0 || yesCount > QUESTIONS.length) {
    return null;
  }
  const result = bandFor(yesCount);
  return {
    band: result.band,
    title: result.title,
    body: `You answered yes to ${yesCount} of ${QUESTIONS.length}. ${result.detail} ${CARE}`,
  };
}
