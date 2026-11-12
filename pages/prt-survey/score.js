// Yes answers are the fit signal. N/A is an answer and is not a yes.
// The count never leaves the browser.
const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const QUESTIONS = [
  {
    id: "no-injury",
    text: "Did your symptoms begin without a preceding injury?",
  },
  {
    id: "past-healing",
    text: "If your symptoms started with an injury, has pain persisted after the injury's normal course of healing according to your doctor?",
    choices: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A" },
    ],
  },
  {
    id: "stressful-start",
    text: "Did your symptoms begin during a stressful time?",
  },
  {
    id: "inconsistent",
    text: "Are your symptoms inconsistent (move or spread around your body, vary in intensity or presentation)?",
  },
  {
    id: "after-activity",
    text: "Do your symptoms occur after, but not during, an activity or exercise?",
  },
  {
    id: "no-diagnosis",
    text: "Do you lack a solid physical diagnosis?",
  },
  {
    id: "multiple-sites",
    text: "Do you have pain in multiple different parts of your body now, or have you in the past?",
  },
  {
    id: "mirrored",
    text: "Do you have symptoms that mirror each other (pain in both shoulders, both wrists, both ankles)?",
  },
  {
    id: "stress-worse",
    text: "Does your pain get worse when you're feeling stressed?",
  },
  {
    id: "aware-when-engaged",
    text: "Are you as aware of your symptoms when you are engaged in something enjoyable?",
  },
  {
    id: "timed-triggers",
    text: "Does your pain tend to increase during a specific time of day, with a certain activity, or in certain weather?",
  },
  {
    id: "personality",
    text: "Would you describe yourself as anxious, perfectionistic, very conscientious, or a people pleaser?",
  },
  {
    id: "family-history",
    text: "Do you have a family history of chronic pain?",
  },
];

export function choicesFor(question) {
  return question.choices || YES_NO;
}

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
    title: "Not a good candidate",
    detail: "You are not a good candidate for this type of coaching.",
  };
}

export function resultForYesCount(yesCount) {
  if (!Number.isInteger(yesCount) || yesCount < 0 || yesCount > QUESTIONS.length) {
    return null;
  }
  const result = bandFor(yesCount);
  const care = result.band === "unlikely" ? "" : ` ${CARE}`;
  return {
    band: result.band,
    title: result.title,
    body: `You answered yes to ${yesCount} of ${QUESTIONS.length}. ${result.detail}${care}`,
  };
}
