// Maps a target training frequency to a set of day slots, each covering a distinct,
// non-overlapping subset of muscle groups so the auto-generated starter plan never
// repeats the exact same exercise across two days (our exercise picker is
// deterministic -- one pick per muscle group -- so overlapping slots would just
// duplicate the same movement under two day names).
export type SplitDay = { name: string; muscleGroupSlugs: string[] };

// Empty array signals "no split" -- a single flat, full-body plan (current Phase 1
// behavior), used for very low training frequencies where a split adds no value.
export function getSplitTemplate(daysPerWeekTarget: number): SplitDay[] {
  if (daysPerWeekTarget <= 2) return [];

  if (daysPerWeekTarget === 3) {
    return [
      { name: "Push", muscleGroupSlugs: ["chest", "shoulders"] },
      { name: "Pull", muscleGroupSlugs: ["back", "arms"] },
      { name: "Legs", muscleGroupSlugs: ["legs", "glutes", "calves", "core"] },
    ];
  }

  if (daysPerWeekTarget === 4) {
    return [
      { name: "Upper A", muscleGroupSlugs: ["chest", "shoulders"] },
      { name: "Lower A", muscleGroupSlugs: ["legs", "glutes"] },
      { name: "Upper B", muscleGroupSlugs: ["back", "arms"] },
      { name: "Lower B", muscleGroupSlugs: ["calves", "core"] },
    ];
  }

  if (daysPerWeekTarget === 5) {
    return [
      { name: "Chest", muscleGroupSlugs: ["chest"] },
      { name: "Back", muscleGroupSlugs: ["back"] },
      { name: "Legs", muscleGroupSlugs: ["legs", "glutes", "calves"] },
      { name: "Shoulders", muscleGroupSlugs: ["shoulders"] },
      { name: "Arms & Core", muscleGroupSlugs: ["arms", "core"] },
    ];
  }

  // 6+
  return [
    { name: "Chest", muscleGroupSlugs: ["chest"] },
    { name: "Back", muscleGroupSlugs: ["back"] },
    { name: "Legs", muscleGroupSlugs: ["legs", "glutes"] },
    { name: "Shoulders", muscleGroupSlugs: ["shoulders"] },
    { name: "Arms", muscleGroupSlugs: ["arms"] },
    { name: "Core & Calves", muscleGroupSlugs: ["core", "calves"] },
  ];
}
