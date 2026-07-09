import type { LucideIcon } from "lucide-react";
import { Flame, Footprints, Shield, Sparkles, Sword, Wind } from "lucide-react";
import type { Equipment, PrimaryGoal, StartingFitnessLevel } from "@/server/db/schema/enums";

// Purely cosmetic flavor -- avatarKey does not affect any game mechanics.
export const HERO_CLASSES: { key: string; label: string; blurb: string; icon: LucideIcon }[] = [
  { key: "warrior", label: "Warrior", blurb: "Raw strength, straightforward grind.", icon: Sword },
  { key: "guardian", label: "Guardian", blurb: "Steady, consistent, hard to knock down.", icon: Shield },
  { key: "berserker", label: "Berserker", blurb: "High intensity, all-out effort.", icon: Flame },
  { key: "ranger", label: "Ranger", blurb: "Endurance and distance are your terrain.", icon: Footprints },
  { key: "monk", label: "Monk", blurb: "Mobility, control, and discipline.", icon: Wind },
  { key: "mystic", label: "Mystic", blurb: "Balanced across every discipline.", icon: Sparkles },
];

export const FITNESS_LEVELS: { key: StartingFitnessLevel; label: string; blurb: string }[] = [
  {
    key: "beginner",
    label: "Beginner",
    blurb: "New to structured training, or returning after a long break.",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    blurb: "Training consistently for 6+ months, comfortable with the basics.",
  },
  {
    key: "advanced",
    label: "Advanced",
    blurb: "Years of consistent training, chasing more specific goals.",
  },
];

export const PRIMARY_GOAL_OPTIONS: { key: PrimaryGoal; label: string; blurb: string }[] = [
  { key: "strength", label: "Strength", blurb: "Lift heavier. Lower reps, longer rests." },
  { key: "hypertrophy", label: "Hypertrophy", blurb: "Build muscle. Moderate reps and volume." },
  { key: "endurance", label: "Endurance", blurb: "Go longer. Higher reps, shorter rests." },
  { key: "fat_loss", label: "Fat Loss", blurb: "Stay lean. Higher volume, tighter rest." },
  { key: "general_fitness", label: "General Fitness", blurb: "A balanced, well-rounded approach." },
];

export const EQUIPMENT_OPTIONS: { key: Equipment; label: string }[] = [
  { key: "bodyweight", label: "Bodyweight" },
  { key: "dumbbell", label: "Dumbbells" },
  { key: "barbell", label: "Barbell" },
  { key: "machine", label: "Machines" },
  { key: "cable", label: "Cable" },
  { key: "band", label: "Resistance Bands" },
  { key: "other", label: "Other / Misc" },
];
