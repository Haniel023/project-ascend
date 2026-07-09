import { z } from "zod";

const setSchema = z.object({
  reps: z.number().int().min(1).max(200).nullable(),
  weightKg: z.number().min(0).max(500).nullable(),
  durationSeconds: z.number().int().min(1).max(7200).nullable(),
  distanceMeters: z.number().min(1).max(200000).nullable(),
  rpe: z.number().int().min(1).max(10).nullable(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.number().int().positive(),
  planExerciseId: z.number().int().positive().nullable(),
  sets: z.array(setSchema).min(1, "Add at least one set."),
});

export const logWorkoutSchema = z.object({
  planId: z.number().int().positive().nullable(),
  dungeonRunId: z.number().int().positive().nullable().optional(),
  exercises: z.array(exerciseEntrySchema).min(1, "Log at least one exercise."),
});

export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;
