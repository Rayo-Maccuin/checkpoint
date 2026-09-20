export function calculateProgress(
  totalTasks: number,
  completedTasks: number,
): number {
  if (totalTasks <= 0) {
    return 0;
  }

  const safeCompletedTasks = Math.min(
    Math.max(completedTasks, 0),
    totalTasks,
  );

  return Math.round((safeCompletedTasks / totalTasks) * 100);
}