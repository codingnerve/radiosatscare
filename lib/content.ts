/**
 * All public-facing copy that is reused across pages. Claims are deliberately limited to things
 * the site itself demonstrates: no ratings, no testimonials, no "24/7", no guaranteed outcomes.
 */

export type IconName = "key" | "signal" | "grid" | "receipt" | "chat";

export type Faq = { q: string; a: string };

export type ServiceContent = {
  slug: string;
  href: string;
  icon: IconName;
  category: "activation" | "signal" | "channels" | "subscription";
  title: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  helpWith: string[];
  beforeYouContact: { title: string; text: string }[];
  nextSteps: string[];
  limits: string[];
  faqs: Faq[];
};

export const services: ServiceContent[] = [
  {
    slug: "radio-activation",
    href: "/radio-activation",
    icon: "key",
    category: "activation",
    title: "Radio activation",
    short:
      "A new vehicle, a used one or a lapsed trial: we help you find the right details and take the right steps to get a receiver activated.",
    metaTitle: "Satellite radio activation & reactivation help",
    metaDescription:
      "Independent guidance for activating or reactivating a car satellite radio: finding your radio ID, preparing for the provider's process and checking what to expect.",
    h1: "Help activating or reactivating your car satellite radio",
    intro:
      "Activation is handled by your satellite radio provider, but getting there is where most people get stuck. We help you identify the receiver, gather the right details and understand each step before you start.",
    helpWith: [
      "Finding the radio ID or serial number your provider will ask for",
      "Working out whether a receiver is factory-fitted, aftermarket or a portable unit",
      "Preparing for a first activation on a new or used vehicle",
      "Understanding why a radio that used to work now shows a subscription message",
      "Getting a radio back on air after a trial has ended or a plan has lapsed",
    ],
    beforeYouContact: [
      {
        title: "Note the radio ID",
        text: "Most receivers show their ID when tuned to a dedicated ID channel (often channel 0) or on a label. Write it down exactly: some characters are never used, so a letter that looks like a digit usually is one.",
      },
      {
        title: "Park with a clear view of the sky",
        text: "Activation signals come from satellites, so activate outdoors and away from tall buildings, garages and heavy tree cover.",
      },
      {
        title: "Leave the radio switched on",
        text: "After a provider sends the activation signal, the radio can take several minutes to receive it. Keep the ignition on or accessory mode active while you wait.",
      },
    ],
    nextSteps: [
      "Send an enquiry or call us with your vehicle and the message the radio shows.",
      "We review it and get back to you by your preferred method.",
      "We walk you through the details your provider will need and what to expect from their process.",
    ],
    limits: [
      "We can't activate a radio ourselves. Activation is done by your provider.",
      "We can't promise how quickly a provider will process a request.",
      "We never need your card details or your online account password.",
    ],
    faqs: [
      {
        q: "Can RadioSatCare activate my radio for me?",
        a: "No. Only your satellite radio provider can activate a receiver. We help you prepare, find the right information and understand the process so you can complete it with fewer false starts.",
      },
      {
        q: "Why does my used car's radio not play?",
        a: "A previous owner's plan normally does not carry over. The receiver usually needs a new plan or trial through the provider. A radio ID and a clear view of the sky are the two most useful starting points.",
      },
      {
        q: "How long does activation usually take?",
        a: "That depends on the provider. Many receivers update within minutes of the signal being sent, but some take longer. We don't control timing, and we won't quote a guaranteed time.",
      },
    ],
  },
  {
    slug: "signal-support",
    href: "/signal-support",
    icon: "signal",
    category: "signal",
    title: "Signal & reception",
    short:
      "Cutting out, stuck on “acquiring signal” or silent under cover? We help you separate everyday signal limits from a possible equipment fault.",
    metaTitle: "Car satellite radio signal & reception troubleshooting",
    metaDescription:
      "Practical guidance for satellite radio that drops out or shows an acquiring-signal message: simple checks, when it's normal, and when to involve an installer.",
    h1: "Signal and reception troubleshooting for car satellite radio",
    intro:
      "Satellite signals need a line of sight to the sky, so some dropouts are normal. The harder question is whether what you're seeing is normal, a settings issue or a hardware fault. We help you narrow it down.",
    helpWith: [
      "Radios that show “acquiring signal”, “no signal” or similar messages",
      "Audio that cuts out under bridges, in garages, in tunnels or between tall buildings",
      "Reception that has changed after a windscreen replacement, roof work or new accessories",
      "Deciding whether an antenna or installation fault is likely",
      "Preparing a clear description for an installer or dealer",
    ],
    beforeYouContact: [
      {
        title: "Test in the open",
        text: "Drive to an open area with a wide sky view and leave the radio on for a few minutes. If it plays there, the issue is likely the location, not the equipment.",
      },
      {
        title: "Check what has changed",
        text: "Glass tinting, roof racks, aftermarket antennas or recent repairs can all affect reception. Tell us anything that changed around the time the problem began.",
      },
      {
        title: "Power-cycle the radio",
        text: "Turn the vehicle off, open and close the driver's door, wait a minute and start again. This is a safe first step for many temporary glitches.",
      },
    ],
    nextSteps: [
      "Tell us the vehicle, the message or symptom and where it happens.",
      "We reply with focused checks to run and what each result would mean.",
      "If a hardware fault looks likely, we explain what to ask a dealer or installer to inspect.",
    ],
    limits: [
      "We can't repair an antenna or receiver remotely.",
      "We can't see your vehicle, so we can point to likely causes but not diagnose a fault with certainty.",
      "Dealers and installers carry out any physical repair.",
    ],
    faqs: [
      {
        q: "Is it normal for satellite radio to cut out sometimes?",
        a: "Yes. Tunnels, covered car parks, dense tree cover and tall buildings can all block the signal. Many providers supplement satellites with ground repeaters in some areas, but coverage still varies.",
      },
      {
        q: "My radio says “acquiring signal” everywhere. What now?",
        a: "Test in an open area first. If it still won't connect, power-cycle the radio and check whether anything about the antenna or installation has changed. If nothing helps, an installer should inspect the antenna and cabling.",
      },
      {
        q: "Can you fix my antenna?",
        a: "No. We provide guidance only. If the checks point to a hardware issue, we explain what to ask a dealer or installer to look at.",
      },
    ],
  },
  {
    slug: "channel-assistance",
    href: "/channel-assistance",
    icon: "grid",
    category: "channels",
    title: "Missing channels",
    short:
      "Channels gone after a trial ended, or a lineup that looks wrong? We help you check the plan, the refresh and what to ask your provider.",
    metaTitle: "Missing satellite radio channels: checks & next steps",
    metaDescription:
      "Why some channels disappear from a car satellite radio, how a radio refresh works, and how to tell a plan change from a receiver issue.",
    h1: "Missing channels and radio refresh help",
    intro:
      "A channel lineup is controlled by the plan attached to your radio. When channels vanish, the cause is usually the plan or a pending refresh rather than the radio itself. We help you tell which.",
    helpWith: [
      "Channels that disappeared when a trial or plan changed",
      "A lineup that doesn't match the plan you thought you had",
      "Understanding what a radio refresh does and when it is worth trying",
      "Preparing the right questions for your provider about a plan's channel lineup",
    ],
    beforeYouContact: [
      {
        title: "Compare with your plan",
        text: "Check which plan is attached to the radio and what channels that plan includes. A downgrade or an expired trial will remove channels without any fault.",
      },
      {
        title: "Try a refresh",
        text: "Most providers offer a way to request a fresh signal to the radio, usually online or by phone. Leave the radio on, outdoors, while it updates.",
      },
      {
        title: "Check you are on the right radio",
        text: "If you have more than one vehicle or receiver, confirm the radio ID on the account matches the one in the car with the problem.",
      },
    ],
    nextSteps: [
      "Describe which channels are missing and when you noticed.",
      "We help you work out whether it points to the plan, a refresh or the receiver.",
      "We explain exactly what to ask your provider, so you only need to explain it once.",
    ],
    limits: [
      "We can't add or unlock channels. Your provider controls the lineup.",
      "We can't send a refresh signal to your radio.",
      "We can't promise a refresh will restore a channel.",
    ],
    faqs: [
      {
        q: "What is a radio refresh?",
        a: "It is a request your provider sends to your receiver to reload its authorisation and lineup. It can resolve temporary mismatches, but it can't add channels your plan doesn't include.",
      },
      {
        q: "Why did my channels disappear overnight?",
        a: "The most common cause is a change to the plan on your radio, such as a trial ending. A pending refresh or a mismatched radio ID can also be responsible.",
      },
      {
        q: "Can you unlock premium channels?",
        a: "No. Which channels you receive is set by your provider and your plan. We can help you understand what a plan includes and what to ask.",
      },
    ],
  },
  {
    slug: "subscription-support",
    href: "/subscription-support",
    icon: "receipt",
    category: "subscription",
    title: "Subscription enquiries",
    short:
      "Unsure what a plan includes, or how to move a radio between vehicles? We help you understand your options and prepare to speak to the provider.",
    metaTitle: "Satellite radio subscription questions explained",
    metaDescription:
      "Independent help understanding satellite radio plans, trials, renewals, transfers and cancellations, and preparing for the conversation with your provider.",
    h1: "Subscription enquiries for car satellite radio",
    intro:
      "Plans, trials, renewals and transfers can be confusing, and the details live with your provider. We help you understand the terms and be ready for the conversation, without pushing you towards any particular plan.",
    helpWith: [
      "Understanding the difference between plan types and what a trial covers",
      "Preparing to transfer a radio's service to a different vehicle",
      "Working out what to ask before renewing or changing a plan",
      "Understanding how to request a cancellation and what to have ready",
      "Reviewing a bill or renewal notice so you know what to query",
    ],
    beforeYouContact: [
      {
        title: "Have your account details ready",
        text: "Your provider will want the radio ID and the account name or email. Only share these with the provider. We never need your password or card details.",
      },
      {
        title: "Read your renewal notice",
        text: "Check the renewal date, the price after any introductory period and how to cancel. Note any parts that are unclear.",
      },
      {
        title: "Decide what you want",
        text: "Be clear whether you want to keep, change, transfer or stop the plan. It makes the provider conversation shorter.",
      },
    ],
    nextSteps: [
      "Tell us what you're trying to do and any renewal or billing detail you have.",
      "We reply with a plain-language summary of your options and the questions to ask.",
      "You contact your provider with the details in hand and make the decision yourself.",
    ],
    limits: [
      "We can't change, cancel or refund a subscription. Only your provider can.",
      "We don't sell subscriptions through this website and never collect payment details.",
      "We don't give financial or legal advice.",
    ],
    faqs: [
      {
        q: "Can you cancel my subscription?",
        a: "No. Cancellations are handled by your provider. We can help you understand how cancellation works and what to have ready so the request goes smoothly.",
      },
      {
        q: "Do you sell satellite radio subscriptions?",
        a: "Not through this website. We provide independent guidance only, and we never take payments or card details through the enquiry form.",
      },
      {
        q: "Can I move my radio's service to a new car?",
        a: "Providers generally support transfers, but the process and any fees are theirs. We help you gather the radio IDs and know what to ask.",
      },
    ],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

export const steps = [
  {
    n: "01",
    title: "Tell us what you're seeing",
    text: "Send the short form or call. Include the vehicle, the message on the radio screen and what you've already tried.",
  },
  {
    n: "02",
    title: "We review and get back to you",
    text: "A member of the team reads your enquiry and replies by phone or email, whichever you chose on the form.",
  },
  {
    n: "03",
    title: "Work through the next step",
    text: "We explain the likely cause, the checks worth trying and exactly what to ask your provider or installer.",
  },
] as const;

export const commonIssues = [
  {
    symptom: "“Acquiring signal” stays on screen",
    detail: "Often a view-of-sky issue, sometimes an antenna fault.",
    href: "/signal-support",
  },
  {
    symptom: "Subscription message instead of music",
    detail: "Usually a plan or activation status that needs checking.",
    href: "/radio-activation",
  },
  {
    symptom: "Channels gone after a trial ended",
    detail: "Normally the plan changed. A refresh may help.",
    href: "/channel-assistance",
  },
  {
    symptom: "Audio drops under bridges and in garages",
    detail: "Expected in places the satellite signal can't reach.",
    href: "/signal-support",
  },
  {
    symptom: "Bought a used car with a silent radio",
    detail: "A previous owner's plan rarely carries over.",
    href: "/radio-activation",
  },
  {
    symptom: "Not sure what the renewal notice means",
    detail: "We help you understand it before you decide.",
    href: "/subscription-support",
  },
] as const;

export const vehicleInfo = {
  intro:
    "Whether satellite radio works in a vehicle depends on the receiver fitted, not just the make and model. Many vehicles have a factory-fitted receiver, some carry an aftermarket tuner and some have neither.",
  weNeed: [
    "Vehicle make, model and approximate year",
    "Whether the radio is factory-fitted or added later",
    "The radio ID, if you can find it",
    "The exact message or symptom on screen",
  ],
  honest:
    "We don't publish a list of supported vehicles, because we can't verify compatibility from a make and model alone. Send us the details and we'll tell you honestly whether it's something we can help with.",
} as const;

export const whyChoose = [
  {
    title: "Independent, and clear about it",
    text: "We are not your satellite radio provider and don't represent one. The disclaimer page explains exactly where our role starts and stops.",
  },
  {
    title: "No card numbers, no passwords",
    text: "The enquiry form has no fields for payment cards or account passwords, and our team will never ask for them.",
  },
  {
    title: "You choose how we reply",
    text: "Pick phone or email on the form and we use that method to respond.",
  },
  {
    title: "Plain-English next steps",
    text: "You get specific checks to try and the exact questions to ask your provider, not jargon or a sales pitch.",
  },
  {
    title: "Transparent data handling",
    text: "Your enquiry goes straight to our team's inbox and is used only to respond to you. The privacy policy explains how long we keep it and how to ask us to delete it.",
  },
] as const;

export const generalFaqs: Faq[] = [
  {
    q: "Is RadioSatCare a satellite radio provider?",
    a: "No. We are an independent assistance service. We are not affiliated with, endorsed by or authorised by any satellite radio provider or manufacturer. Subscriptions are managed by the provider.",
  },
  {
    q: "What can you actually do for me?",
    a: "We help you understand what's happening, run the right checks and prepare for the right conversation with your provider or installer. We can't activate radios, change subscriptions or repair hardware.",
  },
  {
    q: "What does it cost to send an enquiry?",
    a: "Sending an enquiry through this website is free. If we ever offer anything that carries a fee, we will tell you the price clearly before you agree to anything.",
  },
  {
    q: "What should I include in my enquiry?",
    a: "The vehicle make, model and year, any radio ID you can find, the message shown on the radio and what you've already tried. The more specific you are, the more useful our reply.",
  },
  {
    q: "Why does my radio say “acquiring signal”?",
    a: "The receiver can't lock onto the satellite signal. The usual reasons are a blocked view of the sky or an antenna or installation fault. Try an open area first.",
  },
  {
    q: "Why did my channels disappear?",
    a: "Usually the plan attached to the radio changed, for example a trial ended. A refresh requested through your provider sometimes fixes temporary mismatches.",
  },
  {
    q: "How do I find my radio ID?",
    a: "Many receivers display it on a dedicated ID channel (often channel 0) or on a label on the unit. Write it down carefully, as some characters are never used in IDs.",
  },
  {
    q: "Will the radio work in every vehicle?",
    a: "Not necessarily. It depends on the receiver in the vehicle. Tell us the details and we'll be honest about what we can help with.",
  },
  {
    q: "Do you ask for card numbers or passwords?",
    a: "Never. Please don't include them in an enquiry. If anyone asks you for them in our name, don't share them and contact us.",
  },
  {
    q: "How is my information used?",
    a: "Only to respond to your enquiry and to keep a record of it. See the privacy policy for what we keep, how long we keep it and how to request deletion.",
  },
];
