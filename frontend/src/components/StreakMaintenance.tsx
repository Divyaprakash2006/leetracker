import { useState, useEffect } from 'react';
import { getStreakStatus, getStreakMaintenance } from '../utils/streakTracker';

interface StreakMaintenanceProps {
  currentStreak: number;
  lastSolvedDate: string;
}

export const StreakMaintenance = ({ currentStreak, lastSolvedDate }: StreakMaintenanceProps) => {
  const [streakInfo, setStreakInfo] = useState(getStreakStatus());
  const maintenance = getStreakMaintenance(lastSolvedDate);

  // Update streak info every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setStreakInfo(getStreakStatus());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Don't show anything if there's no active streak
  if (currentStreak === 0) {
    return null;
  }

  // If we haven't solved today and it's the warning period
  if (maintenance.needsSolving && streakInfo.isWarningPeriod) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span role="img" aria-label="warning" className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-bold">Streak at Risk!</h3>
            <p className="text-red-700 mt-1">
              Your {currentStreak} day streak will break if you don't solve a problem in the next {streakInfo.timeUntilReset}!
            </p>
            <p className="text-red-600 mt-2 text-sm">
              LeetCode day ends at {streakInfo.dayEndingUTC}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we haven't solved today but it's not warning period yet
  if (maintenance.needsSolving) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span role="img" aria-label="reminder" className="text-2xl">⏰</span>
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-bold">Maintain Your Streak</h3>
            <p className="text-yellow-700 mt-1">
              Keep your {currentStreak} day streak alive! You have {streakInfo.timeUntilReset} left to solve today's problem.
            </p>
            <p className="text-yellow-600 mt-2 text-sm">
              LeetCode day ends at {streakInfo.dayEndingUTC}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we've already solved today
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span role="img" aria-label="success" className="text-2xl">✅</span>
        </div>
        <div className="ml-3">
          <h3 className="text-green-800 font-bold">Streak Maintained!</h3>
          <p className="text-green-700 mt-1">
            Great job! You've maintained your {currentStreak} day streak for today.
          </p>
          <p className="text-green-600 mt-2 text-sm">
            Next day starts in {streakInfo.timeUntilReset}
          </p>
        </div>
      </div>
    </div>
  );
};