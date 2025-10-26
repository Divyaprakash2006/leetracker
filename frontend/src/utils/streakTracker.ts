// Streak maintenance times are in UTC
const LEETCODE_RESET_HOUR_UTC = 0; // LeetCode resets at midnight UTC

export const getStreakStatus = () => {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();

  // Calculate time until reset in minutes
  const minutesUntilReset = ((24 - utcHour - 1) * 60) + (60 - utcMinutes);

  // Check if we're in the warning period (last 3 hours before reset)
  const isWarningPeriod = minutesUntilReset <= 180; // 3 hours = 180 minutes

  // Format time remaining
  const hoursRemaining = Math.floor(minutesUntilReset / 60);
  const minutesRemaining = minutesUntilReset % 60;

  let timeDisplay = '';
  if (hoursRemaining > 0) {
    timeDisplay += `${hoursRemaining}h `;
  }
  timeDisplay += `${minutesRemaining}m`;

  return {
    isWarningPeriod,
    timeUntilReset: timeDisplay,
    minutesUntilReset,
    dayEndingUTC: `${String(LEETCODE_RESET_HOUR_UTC).padStart(2, '0')}:00 UTC`
  };
};

export const getStreakMaintenance = (lastSolved: string) => {
  const now = new Date();
  const lastSolvedDate = new Date(lastSolved);
  
  // Reset the hours to compare just the dates
  now.setHours(0, 0, 0, 0);
  lastSolvedDate.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(now.getTime() - lastSolvedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    needsSolving: diffDays > 1,
    daysSinceLastSolved: diffDays - 1 // -1 because same day counts as 0
  };
};