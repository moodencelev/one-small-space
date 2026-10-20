import { RoomOption } from '../types';

export const ROOMS: RoomOption[] = [
  {
    id: 'nightstand',
    name: 'Nightstand / Bedside',
    description: 'A soothing, clear landing spot for peaceful sleep.',
    iconName: 'BedDouble',
    typicalMicroAreas: ['Top surface only', 'Top drawer', 'Floor beside the bed', 'Charging cord tangle'],
  },
  {
    id: 'kitchen_counter',
    name: 'Kitchen Counter',
    description: 'A small clear clearing for making tea or food calmly.',
    iconName: 'Utensils',
    typicalMicroAreas: ['The 12-inch tea/coffee area', 'The mail landing drop zone', 'Around the sink', 'Snack basket surface'],
  },
  {
    id: 'desk',
    name: 'Desk / Workspace',
    description: 'Room for your hands and keyboard without visual noise.',
    iconName: 'Laptop',
    typicalMicroAreas: ['Keyboard & mouse zone', 'Right-hand paper pile', 'Pen cup and stationery', 'Desk drawer tray'],
  },
  {
    id: 'entryway',
    name: 'Entryway / Hallway',
    description: 'A gentle welcoming spot when you come home.',
    iconName: 'DoorOpen',
    typicalMicroAreas: ['Shoe drop perimeter', 'Key & sunglasses dish', 'Coat rack overflow', 'Small console table'],
  },
  {
    id: 'living_room',
    name: 'Living Room / Couch',
    description: 'A restorative spot to sit back and breathe.',
    iconName: 'Sofa',
    typicalMicroAreas: ['Coffee table center', 'One couch cushion corner', 'TV media console shelf', 'Magazine or blanket basket'],
  },
  {
    id: 'bathroom',
    name: 'Bathroom Vanity',
    description: 'Clear counter space for your morning & evening routine.',
    iconName: 'Sparkles',
    typicalMicroAreas: ['Sink perimeter', 'Toothbrush cup area', 'Shower ledge essentials', 'One medicine cabinet shelf'],
  },
  {
    id: 'wardrobe',
    name: 'Closet Corner',
    description: 'A manageable cluster of clothes, shoes, or hangers.',
    iconName: 'Shirt',
    typicalMicroAreas: ['The "chair with clothes"', 'One hanging section (5 items)', 'Shoe floor cluster', 'Top shelf basket'],
  },
  {
    id: 'other',
    name: 'Any Small Corner',
    description: 'Whatever space is catching your eye today.',
    iconName: 'Box',
    typicalMicroAreas: ['A single horizontal surface', 'A 2-foot floor square', 'One tote bag or box', 'Window sill ledge'],
  },
];
