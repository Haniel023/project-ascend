import { pickDeterministicIndex } from "@/server/game/shared/seededRandom";

const DUNGEON_POOL: { title: string; story: string }[] = [
  { title: "The Iron Depths", story: "A cavern of cold steel waits below -- every rep echoes like a hammer strike." },
  { title: "Sunken Forge", story: "Heat rises from the forge floor. Only sustained effort keeps the flame lit." },
  { title: "The Ashen Coliseum", story: "Old champions watch from the stands. Today you fight for a new record." },
  { title: "Hollow Reach", story: "The path forward is narrow and unforgiving -- discipline is the only way through." },
  { title: "Vault of Sinew", story: "Locked behind this door: strength you haven't unlocked yet." },
  { title: "The Gravity Well", story: "Every set here pulls harder than the last. Push back." },
  { title: "Frostbound Arena", story: "The cold sharpens focus. Move deliberately, finish strong." },
  { title: "The Fractured Summit", story: "One more push separates you from the peak." },
  { title: "Ember Hollow", story: "A low, patient burn. Nothing here rewards rushing." },
  { title: "The Sundered Gate", story: "It only opens for those who show up and put in the work." },
];

// Deterministic per (user, day) so refreshing the page never rerolls the dungeon.
export function pickDungeonFlavor(userId: string, dateISO: string): { title: string; story: string } {
  const index = pickDeterministicIndex(`${userId}:${dateISO}:dungeonName`, DUNGEON_POOL.length);
  return DUNGEON_POOL[index];
}
