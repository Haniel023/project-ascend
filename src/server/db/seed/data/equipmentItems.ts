import type { EquipmentBonusCategory, EquipmentRarity, EquipmentSlot } from "@/server/db/schema/enums";

export type EquipmentItemSeed = {
  slug: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  bonusCategory: EquipmentBonusCategory;
  bonusValue: number;
  loreText: string;
};

// 6 slots x 5 rarities = 30 items. One bonus category per slot (see the Phase 3 plan's
// "Equipment Slot Identity" mapping). Bonus magnitude scales by rarity -- Mythic is
// deliberately the only tier with a large bonus (0.01/0.015/0.02/0.03/0.07), and Mythic
// items never expire once equipped (see equipmentService.ts).
export const equipmentItemSeed: EquipmentItemSeed[] = [
  // Weapon (Training Tool) -- boss_damage
  { slug: "old-lifting-straps", name: "Old Lifting Straps", slot: "weapon", rarity: "common", bonusCategory: "boss_damage", bonusValue: 0.01, loreText: "They've slipped before. You held on anyway." },
  { slug: "reinforced-grip-wraps", name: "Reinforced Grip Wraps", slot: "weapon", rarity: "uncommon", bonusCategory: "boss_damage", bonusValue: 0.015, loreText: "Dust settles. Resolve doesn't." },
  { slug: "grip-of-iron-will", name: "Grip of Iron Will", slot: "weapon", rarity: "rare", bonusCategory: "boss_damage", bonusValue: 0.02, loreText: "Every rep leaves a mark on the bar. So does every rep leave one on you." },
  { slug: "the-unyielding-grip", name: "The Unyielding Grip", slot: "weapon", rarity: "epic", bonusCategory: "boss_damage", bonusValue: 0.03, loreText: "It has never once let go first." },
  { slug: "godhand", name: "Godhand", slot: "weapon", rarity: "mythic", bonusCategory: "boss_damage", bonusValue: 0.07, loreText: "Some say the bar bends first." },

  // Head (Mindset) -- recovery_score
  { slug: "worn-mindset", name: "Worn Mindset", slot: "head", rarity: "common", bonusCategory: "recovery_score", bonusValue: 1, loreText: "Keeps the sweat out of your eyes, not the doubt out of your head." },
  { slug: "circlet-of-clear-thought", name: "Circlet of Clear Thought", slot: "head", rarity: "uncommon", bonusCategory: "recovery_score", bonusValue: 1.5, loreText: "Noise fades. The set doesn't." },
  { slug: "crown-of-quiet-focus", name: "Crown of Quiet Focus", slot: "head", rarity: "rare", bonusCategory: "recovery_score", bonusValue: 2, loreText: "Everything else goes quiet once the set begins." },
  { slug: "helm-of-the-unshaken", name: "Helm of the Unshaken", slot: "head", rarity: "epic", bonusCategory: "recovery_score", bonusValue: 3, loreText: "Doubt knocks. It doesn't get an answer." },
  { slug: "third-eye-of-discipline", name: "Third Eye of Discipline", slot: "head", rarity: "mythic", bonusCategory: "recovery_score", bonusValue: 7, loreText: "It sees the rep you almost skipped." },

  // Chest (Core) -- workout_xp
  { slug: "simple-core-wrap", name: "Simple Core Wrap", slot: "chest", rarity: "common", bonusCategory: "workout_xp", bonusValue: 0.01, loreText: "Nothing fancy. It just holds you together." },
  { slug: "reinforced-lifting-belt", name: "Reinforced Lifting Belt", slot: "chest", rarity: "uncommon", bonusCategory: "workout_xp", bonusValue: 0.015, loreText: "A little support goes a long way when the bar gets heavy." },
  { slug: "plates-of-quiet-discipline", name: "Plates of Quiet Discipline", slot: "chest", rarity: "rare", bonusCategory: "workout_xp", bonusValue: 0.02, loreText: "No one sees the effort. The results speak instead." },
  { slug: "armor-of-the-unbroken", name: "Armor of the Unbroken", slot: "chest", rarity: "epic", bonusCategory: "workout_xp", bonusValue: 0.03, loreText: "Every setback left a scar. None deep enough to stop you." },
  { slug: "heartplate-of-the-relentless", name: "Heartplate of the Relentless", slot: "chest", rarity: "mythic", bonusCategory: "workout_xp", bonusValue: 0.07, loreText: "It doesn't beat faster. It just doesn't stop." },

  // Legs (Drive) -- workout_xp
  { slug: "cracked-knee-sleeves", name: "Cracked Knee Sleeves", slot: "legs", rarity: "common", bonusCategory: "workout_xp", bonusValue: 0.01, loreText: "They've seen better days. So have you. Both still show up." },
  { slug: "steadfast-leg-wraps", name: "Steadfast Leg Wraps", slot: "legs", rarity: "uncommon", bonusCategory: "workout_xp", bonusValue: 0.015, loreText: "Every squat starts and ends with a foundation." },
  { slug: "greaves-of-forward-motion", name: "Greaves of Forward Motion", slot: "legs", rarity: "rare", bonusCategory: "workout_xp", bonusValue: 0.02, loreText: "Retreat was never really an option." },
  { slug: "legguards-of-the-long-haul", name: "Legguards of the Long Haul", slot: "legs", rarity: "epic", bonusCategory: "workout_xp", bonusValue: 0.03, loreText: "Distance is just time you haven't spent yet." },
  { slug: "foundation-of-the-mountain", name: "Foundation of the Mountain", slot: "legs", rarity: "mythic", bonusCategory: "workout_xp", bonusValue: 0.07, loreText: "It has never once buckled." },

  // Feet (Momentum) -- quest_xp
  { slug: "worn-training-shoes", name: "Worn Training Shoes", slot: "feet", rarity: "common", bonusCategory: "quest_xp", bonusValue: 0.01, loreText: "Soles thinning. Pace hasn't." },
  { slug: "boots-of-sure-footing", name: "Boots of Sure Footing", slot: "feet", rarity: "uncommon", bonusCategory: "quest_xp", bonusValue: 0.015, loreText: "Every step lands exactly where it needs to." },
  { slug: "treads-of-momentum", name: "Treads of Momentum", slot: "feet", rarity: "rare", bonusCategory: "quest_xp", bonusValue: 0.02, loreText: "Once moving, stopping was never the plan." },
  { slug: "striders-of-the-relentless-pace", name: "Striders of the Relentless Pace", slot: "feet", rarity: "epic", bonusCategory: "quest_xp", bonusValue: 0.03, loreText: "It doesn't matter how slow. Just that it doesn't stop." },
  { slug: "the-first-step-eternal", name: "The First Step, Eternal", slot: "feet", rarity: "mythic", bonusCategory: "quest_xp", bonusValue: 0.07, loreText: "Every journey's hardest step, mastered." },

  // Trinket (Spirit) -- workout_xp
  { slug: "chipped-motivation-coin", name: "Chipped Motivation Coin", slot: "trinket", rarity: "common", bonusCategory: "workout_xp", bonusValue: 0.01, loreText: "Flip it before every set. Some habits just work." },
  { slug: "charm-of-early-mornings", name: "Charm of Early Mornings", slot: "trinket", rarity: "uncommon", bonusCategory: "workout_xp", bonusValue: 0.015, loreText: "For the days no one else was awake to see you show up." },
  { slug: "the-focused-mind", name: "The Focused Mind", slot: "trinket", rarity: "rare", bonusCategory: "workout_xp", bonusValue: 0.02, loreText: "One rep. One breath. Nothing else exists." },
  { slug: "the-unbroken-streak", name: "The Unbroken Streak", slot: "trinket", rarity: "epic", bonusCategory: "workout_xp", bonusValue: 0.03, loreText: "It doesn't remember why you started. It just knows you didn't stop." },
  { slug: "ember-of-the-first-rep", name: "Ember of the First Rep", slot: "trinket", rarity: "mythic", bonusCategory: "workout_xp", bonusValue: 0.07, loreText: "Still burning, exactly where it was lit." },
];
