import { EnergyLevel, MicroStep, SessionDuration } from '../types';

interface ChecklistTemplate {
  room: string;
  energy: EnergyLevel;
  microAreaTitle: string;
  warmInsight: string;
  steps: Array<{ title: string; instruction: string; seconds: number }>;
  suggestedNextStep: string;
}

export const MANUAL_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // Nightstand
  {
    room: 'nightstand',
    energy: 'low',
    microAreaTitle: 'Top Surface of Nightstand (18-inch circle)',
    warmInsight: 'You deserve to see calm when you open your eyes in the morning. Just one tiny surface.',
    steps: [
      {
        title: 'Clear obvious cups and glasses',
        instruction: 'Pick up any drinking glasses or mugs and set them outside the bedroom door or straight to the kitchen.',
        seconds: 45,
      },
      {
        title: 'Toss wrappers and tissues',
        instruction: 'Any tissue, empty packaging, or receipt goes straight into a waste basket. No thinking required.',
        seconds: 35,
      },
      {
        title: 'Give essentials a home',
        instruction: 'Place your lamp, phone charger, and current book neatly together. Breathe in the open wood or table surface.',
        seconds: 40,
      },
    ],
    suggestedNextStep: 'Leave a clean glass of water for tonight, then rest your hands.',
  },
  {
    room: 'nightstand',
    energy: 'medium',
    microAreaTitle: 'Nightstand Surface & Bedside Floor Pocket',
    warmInsight: 'We are creating a 2-foot perimeter of peace around your sleeping area.',
    steps: [
      {
        title: 'Clear dishes & cups',
        instruction: 'Take cups, mugs, and plates to the kitchen sink in one gentle trip.',
        seconds: 60,
      },
      {
        title: 'Quick trash sweep',
        instruction: 'Discard tissues, receipts, packaging, and anything expired or torn.',
        seconds: 60,
      },
      {
        title: 'Sort loose items into three spots',
        instruction: 'Medicine/lip balm in one small dish, books in one straight stack, cords tucked behind.',
        seconds: 120,
      },
      {
        title: 'Wipe the surface with a damp cloth',
        instruction: 'Give the open tabletop a 15-second wipe. Feel the fresh reset.',
        seconds: 60,
      },
    ],
    suggestedNextStep: 'Take a slow deep breath and notice how much lighter this corner feels.',
  },
  // Kitchen Counter
  {
    room: 'kitchen_counter',
    energy: 'low',
    microAreaTitle: 'The 12-inch Tea / Mug Zone',
    warmInsight: 'You don\'t need to tackle the whole kitchen. Just clear a 12-inch space for your hands.',
    steps: [
      {
        title: 'Move dishes into the sink basin',
        instruction: 'Pick up any cups, bowls, or cutlery in this specific spot and set them in the sink. Do not wash yet.',
        seconds: 60,
      },
      {
        title: 'Recycle loose packaging or mail',
        instruction: 'Place paper scraps, cardboard boxes, or junk circulars directly in the recycling.',
        seconds: 45,
      },
      {
        title: 'Gather stray spoons or ingredients',
        instruction: 'Put salt, tea boxes, or spices back onto their shelf or in a tidy cluster.',
        seconds: 45,
      },
    ],
    suggestedNextStep: 'Pour yourself a cold glass of water or hot tea to enjoy right here.',
  },
  {
    room: 'kitchen_counter',
    energy: 'medium',
    microAreaTitle: 'The Counter Island Drop Zone',
    warmInsight: 'Counters naturally gather the day\'s residue. We are reclaiming just one landing pad.',
    steps: [
      {
        title: 'Clear obvious trash & food wrappers',
        instruction: 'Grab a small bin bag and gather produce ties, packaging, and receipts.',
        seconds: 60,
      },
      {
        title: 'Relocate "not kitchen" items',
        instruction: 'Gather mail, keys, bags, or tools and put them in a temporary basket or near where they belong.',
        seconds: 90,
      },
      {
        title: 'Load or stage dishes into dishwasher/sink',
        instruction: 'Stack cups and plates so the counter flat area is freed up.',
        seconds: 90,
      },
      {
        title: 'Single damp towel wipe',
        instruction: 'Wipe down this section of the counter top. Enjoy the clean reflection.',
        seconds: 60,
      },
    ],
    suggestedNextStep: 'Put the kitchen towel to dry and celebrate this clean clearing.',
  },
  // Desk
  {
    room: 'desk',
    energy: 'low',
    microAreaTitle: 'Keyboard & Mouse Landing Strip',
    warmInsight: 'Your mind feels what your arms touch. Let\'s clear the immediate space in front of your chair.',
    steps: [
      {
        title: 'Move drink glasses and coffee cups',
        instruction: 'Carry drinks to the kitchen or set them safely away from the computer.',
        seconds: 45,
      },
      {
        title: 'Stack loose paper into one neat pile',
        instruction: 'Don\'t read or sort every paper right now. Just align the edges into one square stack.',
        seconds: 45,
      },
      {
        title: 'Corral pens and small tech',
        instruction: 'Drop stray pens in a mug/drawer and straighten the mouse pad.',
        seconds: 40,
      },
    ],
    suggestedNextStep: 'Roll your shoulders back, stretch your wrists, and enjoy the open space.',
  },
  {
    room: 'desk',
    energy: 'medium',
    microAreaTitle: 'Right-Side Surface & Pen Tray',
    warmInsight: 'Reducing visual clutter on your primary workspace reduces mental fatigue by half.',
    steps: [
      {
        title: 'Recycle obvious paper & junk notes',
        instruction: 'Outdated sticky notes, envelopes, and scratch paper go into the paper recycling bin.',
        seconds: 60,
      },
      {
        title: 'Return stray objects to their rooms',
        instruction: 'Take dishes to kitchen, cosmetics to bathroom, or clothes to laundry.',
        seconds: 90,
      },
      {
        title: 'Group books and notebooks',
        instruction: 'Stack current projects neatly against the back wall or monitor stand.',
        seconds: 90,
      },
      {
        title: 'Dust or wipe keyboard perimeter',
        instruction: 'A 30-second wipe clears crumbs and dust.',
        seconds: 60,
      },
    ],
    suggestedNextStep: 'Close browser tabs you don\'t need right now and enjoy the fresh headspace.',
  },
  // Entryway
  {
    room: 'entryway',
    energy: 'low',
    microAreaTitle: 'The 3-Foot Shoe Perimeter',
    warmInsight: 'Coming home should feel like a soft exhale, not an obstacle course.',
    steps: [
      {
        title: 'Line up current daily shoes',
        instruction: 'Pick the 2 pairs you wear every day and place them side by side against the wall.',
        seconds: 60,
      },
      {
        title: 'Slide secondary shoes into closet or rack',
        instruction: 'Boots or gym shoes you aren\'t wearing today can tuck away or line up behind.',
        seconds: 60,
      },
      {
        title: 'Clear floor debris or leaves',
        instruction: 'Shake the welcome mat or kick aside outdoor grit.',
        seconds: 30,
      },
    ],
    suggestedNextStep: 'Hang your keys in their dedicated dish or hook.',
  },
  // Living Room
  {
    room: 'living_room',
    energy: 'low',
    microAreaTitle: 'Coffee Table Center Clearing',
    warmInsight: 'A clear table surface acts like an oasis for the entire room.',
    steps: [
      {
        title: 'Carry dishes and cups to the kitchen',
        instruction: 'Take whatever was used during movie or relaxation time to the sink.',
        seconds: 60,
      },
      {
        title: 'Group remote controls and coasters',
        instruction: 'Place remotes neatly parallel on a tray or next to each other.',
        seconds: 30,
      },
      {
        title: 'Fold or square the throw blanket',
        instruction: 'Drape the blanket over the sofa arm or fold into a neat square.',
        seconds: 40,
      },
    ],
    suggestedNextStep: 'Sit back on the sofa and admire the open surface for 30 seconds.',
  },
  // Bathroom
  {
    room: 'bathroom',
    energy: 'low',
    microAreaTitle: 'Sink Perimeter & Toothbrush Deck',
    warmInsight: 'A fresh, wiped sink creates an instant sense of personal care and order.',
    steps: [
      {
        title: 'Cap bottles and tube tops',
        instruction: 'Put lids back on toothpaste, lotion, and creams.',
        seconds: 30,
      },
      {
        title: 'Toss empty bottles & cotton pads',
        instruction: 'Drop finished toiletries into the bathroom bin.',
        seconds: 30,
      },
      {
        title: 'Quick wipe with a hand towel',
        instruction: 'Wipe water drops and toothpaste splatters around the faucet.',
        seconds: 45,
      },
    ],
    suggestedNextStep: 'Wash your hands with warm water and enjoy the fresh scent.',
  },
  // Wardrobe / Closet
  {
    room: 'wardrobe',
    energy: 'low',
    microAreaTitle: 'The "Chair with Clothes"',
    warmInsight: 'Almost every human has a clothes chair. We are not judging it, just lightening it.',
    steps: [
      {
        title: 'Move dirty clothes to the laundry hamper',
        instruction: 'Anything that clearly needs washing goes straight to the hamper or basket.',
        seconds: 60,
      },
      {
        title: 'Hang or fold just 3 clean items',
        instruction: 'Pick the 3 easiest pieces (jackets, shirts) and put them on hangers.',
        seconds: 90,
      },
      {
        title: 'Notice the chair appearing again',
        instruction: 'Look at the freed-up seat. That took under 3 minutes.',
        seconds: 30,
      },
    ],
    suggestedNextStep: 'Sit in the chair for a moment to reclaim it.',
  },
  // Generic / Other
  {
    room: 'other',
    energy: 'low',
    microAreaTitle: 'Single 18-Inch Surface Clearing',
    warmInsight: 'Progress is made in square inches, not whole houses.',
    steps: [
      {
        title: 'Trash and recycling first',
        instruction: 'Remove anything that doesn\'t need to be kept or decided on.',
        seconds: 45,
      },
      {
        title: 'Group like items together',
        instruction: 'Paper with paper, objects with objects. No need to store yet, just group.',
        seconds: 60,
      },
      {
        title: 'Wipe or reset the center',
        instruction: 'Leave an intentional empty circle in the middle.',
        seconds: 30,
      },
    ],
    suggestedNextStep: 'Place your palm flat on the clean surface and feel the calm.',
  },
];

export function getManualChecklist(
  room: string,
  energy: EnergyLevel,
  durationMinutes: SessionDuration
): {
  microAreaTitle: string;
  warmInsight: string;
  steps: MicroStep[];
  suggestedNextStep: string;
} {
  const match =
    MANUAL_CHECKLIST_TEMPLATES.find(
      (t) => t.room === room && t.energy === energy
    ) ||
    MANUAL_CHECKLIST_TEMPLATES.find((t) => t.room === room) ||
    MANUAL_CHECKLIST_TEMPLATES.find((t) => t.room === 'other')!;

  // Scale or adjust steps based on duration
  const totalAllocatedSeconds = durationMinutes * 60;
  const rawSteps = match.steps;
  const scaledStepTime = Math.max(30, Math.floor(totalAllocatedSeconds / rawSteps.length));

  const steps: MicroStep[] = rawSteps.map((s, idx) => ({
    id: `manual_step_${idx + 1}`,
    title: s.title,
    instruction: s.instruction,
    suggestedSeconds: scaledStepTime,
    completed: false,
    skipped: false,
  }));

  return {
    microAreaTitle: match.microAreaTitle,
    warmInsight: match.warmInsight,
    steps,
    suggestedNextStep: match.suggestedNextStep,
  };
}
