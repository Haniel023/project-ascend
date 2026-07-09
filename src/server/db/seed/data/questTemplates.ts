import type { QuestCategory } from "../../schema/enums";

export type QuestTemplateSeed = {
  slug: string;
  title: string;
  description: string;
  category: QuestCategory;
  bonusXp?: number;
};

export const questTemplateSeed: QuestTemplateSeed[] = [
  { slug: "hamstring-stretch", title: "Hamstring Stretch", description: "Hold a standing or seated hamstring stretch for 30 seconds per side.", category: "stretch" },
  { slug: "hip-flexor-stretch", title: "Hip Flexor Stretch", description: "Hold a kneeling hip flexor stretch for 30 seconds per side.", category: "stretch" },
  { slug: "shoulder-cross-stretch", title: "Shoulder Cross-Body Stretch", description: "Stretch each shoulder across your body for 30 seconds.", category: "stretch" },
  { slug: "quad-stretch", title: "Standing Quad Stretch", description: "Hold a standing quad stretch for 30 seconds per side.", category: "stretch" },
  { slug: "chest-doorway-stretch", title: "Doorway Chest Stretch", description: "Open up the chest and front shoulders in a doorway for 30 seconds per side.", category: "stretch" },
  { slug: "cat-cow", title: "Cat-Cow Flow", description: "Move through 10 slow cat-cow reps to mobilize the spine.", category: "mobility" },
  { slug: "hip-circles", title: "Hip Circles", description: "10 controlled hip circles each direction to open the hips.", category: "mobility" },
  { slug: "thoracic-rotation", title: "Thoracic Spine Rotation", description: "10 slow rotations per side in a quadruped position.", category: "mobility" },
  { slug: "ankle-mobility", title: "Ankle Mobility Drill", description: "10 controlled ankle rocks per side against a wall.", category: "mobility" },
  { slug: "arm-circles", title: "Arm Circles", description: "20 forward and 20 backward arm circles to warm up the shoulders.", category: "mobility" },
  { slug: "foam-roll-legs", title: "Foam Roll Legs", description: "Spend 3 minutes foam rolling quads, hamstrings, and calves.", category: "cooldown" },
  { slug: "foam-roll-back", title: "Foam Roll Upper Back", description: "Spend 2 minutes foam rolling the upper back and lats.", category: "cooldown" },
  { slug: "post-workout-walk", title: "Post-Workout Walk", description: "Take a 5-10 minute easy walk to bring your heart rate down gradually.", category: "cooldown" },
  { slug: "static-full-body-stretch", title: "Full-Body Static Stretch", description: "Run through a 5-minute full-body static stretch routine.", category: "cooldown" },
  { slug: "box-breathing", title: "Box Breathing", description: "4 rounds of inhale-hold-exhale-hold for 4 seconds each.", category: "breathing" },
  { slug: "diaphragmatic-breathing", title: "Diaphragmatic Breathing", description: "2 minutes of slow belly breathing to downregulate the nervous system.", category: "breathing" },
  { slug: "drink-water", title: "Hydration Check-In", description: "Drink a full glass of water and log how hydrated you're feeling.", category: "hydration" },
  { slug: "electrolyte-refill", title: "Electrolyte Refill", description: "Add electrolytes to your water on a heavy training day.", category: "hydration" },
  { slug: "wind-down-routine", title: "Wind-Down Routine", description: "Start a screen-free wind-down routine 30 minutes before bed.", category: "sleep" },
  { slug: "consistent-bedtime", title: "Consistent Bedtime", description: "Go to bed within 30 minutes of your target bedtime tonight.", category: "sleep" },
];
