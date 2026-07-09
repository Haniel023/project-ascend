import { db } from "../client";
import { exercises, exerciseMuscleGroups, muscleGroups } from "../schema/fitness.schema";
import { questTemplates } from "../schema/gamification.schema";
import { achievements } from "../schema/phase2.schema";
import { equipmentItems } from "../schema/equipment.schema";
import { muscleGroupSeed } from "./data/muscleGroups";
import { exerciseSeed } from "./data/exercises";
import { questTemplateSeed } from "./data/questTemplates";
import { achievementSeed } from "./data/achievements";
import { equipmentItemSeed } from "./data/equipmentItems";
import { eq } from "drizzle-orm";

async function seedMuscleGroups() {
  await db.insert(muscleGroups).values([...muscleGroupSeed]).onConflictDoNothing({ target: muscleGroups.slug });
  console.log(`Seeded ${muscleGroupSeed.length} muscle groups.`);
}

async function seedExercises() {
  const allGroups = await db.query.muscleGroups.findMany();
  const groupIdBySlug = new Map(allGroups.map((g) => [g.slug, g.id]));

  for (const ex of exerciseSeed) {
    const [inserted] = await db
      .insert(exercises)
      .values({
        slug: ex.slug,
        name: ex.name,
        description: ex.description,
        equipment: ex.equipment,
        trackingType: ex.trackingType,
        isSeeded: true,
      })
      .onConflictDoNothing({ target: exercises.slug })
      .returning({ id: exercises.id });

    const exerciseId =
      inserted?.id ??
      (await db.query.exercises.findFirst({ where: eq(exercises.slug, ex.slug) }))?.id;

    if (!exerciseId) continue;

    for (const mg of ex.muscleGroups) {
      const muscleGroupId = groupIdBySlug.get(mg.slug);
      if (!muscleGroupId) continue;
      await db
        .insert(exerciseMuscleGroups)
        .values({ exerciseId, muscleGroupId, isPrimary: mg.isPrimary })
        .onConflictDoNothing({ target: [exerciseMuscleGroups.exerciseId, exerciseMuscleGroups.muscleGroupId] });
    }
  }
  console.log(`Seeded ${exerciseSeed.length} exercises.`);
}

async function seedQuestTemplates() {
  await db
    .insert(questTemplates)
    .values(questTemplateSeed.map((q) => ({ ...q, bonusXp: q.bonusXp ?? 15 })))
    .onConflictDoNothing({ target: questTemplates.slug });
  console.log(`Seeded ${questTemplateSeed.length} quest templates.`);
}

async function seedAchievements() {
  await db
    .insert(achievements)
    .values(
      achievementSeed.map((a) => ({
        slug: a.slug,
        title: a.title,
        description: a.description,
        iconKey: a.iconKey,
        category: a.category,
        criteriaJson: a.criteria,
      }))
    )
    .onConflictDoNothing({ target: achievements.slug });
  console.log(`Seeded ${achievementSeed.length} achievements.`);
}

async function seedEquipmentItems() {
  await db.insert(equipmentItems).values(equipmentItemSeed).onConflictDoNothing({ target: equipmentItems.slug });
  console.log(`Seeded ${equipmentItemSeed.length} equipment items.`);
}

async function main() {
  await seedMuscleGroups();
  await seedExercises();
  await seedQuestTemplates();
  await seedAchievements();
  await seedEquipmentItems();
  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
