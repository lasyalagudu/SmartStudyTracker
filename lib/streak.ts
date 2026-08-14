export function calculateNextStreak(
  currentStreak: number,
  lastStudyDate: Date | null
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastStudyDate) {
    return {
      streakCount: 1,
      lastStudyDate: today,
    };
  }

  const last = new Date(lastStudyDate);
  last.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return {
      streakCount: currentStreak,
      lastStudyDate: today,
    };
  }

  if (diffDays === 1) {
    return {
      streakCount: currentStreak + 1,
      lastStudyDate: today,
    };
  }

  return {
    streakCount: 1,
    lastStudyDate: today,
  };
}