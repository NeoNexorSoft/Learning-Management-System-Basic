import { WeaknessLevel } from '@prisma/client';
import { WeaknessCalculationInput, WeaknessCalculationResult } from '../types/routineTracker.types';

const clamp = (value: number, min = 0, max = 100): number => Math.min(Math.max(value, min), max);

export const routineTrackerEngine = {
  calculateWeaknessLevel(score: number): WeaknessLevel {
    const normalizedScore = clamp(Math.round(score));

    if (normalizedScore < 50) return WeaknessLevel.HIGH;
    if (normalizedScore < 70) return WeaknessLevel.MEDIUM;
    return WeaknessLevel.LOW;
  },

  calculatePerformanceScore(completedTasks: number, totalTasks: number): number {
    if (!totalTasks || totalTasks <= 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  },

  calculateWeakness(input: WeaknessCalculationInput): WeaknessCalculationResult {
    const normalizedScore = clamp(Math.round(input.score));
    const totalTasks = input.totalTasks ?? 0;
    const completedTasks = input.completedTasks ?? 0;
    const missedTasks = input.missedTasks ?? 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const missedRate = totalTasks > 0 ? Math.round((missedTasks / totalTasks) * 100) : 0;

    let adjustedScore = normalizedScore;
    if (totalTasks > 0) {
      adjustedScore = clamp(Math.round(normalizedScore * 0.75 + completionRate * 0.2 - missedRate * 0.05));
    }

    return {
      normalizedScore: adjustedScore,
      level: this.calculateWeaknessLevel(adjustedScore),
      completionRate,
      missedRate,
    };
  },
};
