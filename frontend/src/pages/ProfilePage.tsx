import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTrackedUsers } from '../context/UserContext';
import { apiClient, getAuthHeaders } from '../config/api';
import { Loader } from '../components/Loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

type TrackedUserSummary = ReturnType<typeof useTrackedUsers>['trackedUsers'][number];

interface DailyActivityEntry {
  date?: string;
  count?: number;
}

interface ApiUserPayload {
  username?: string;
  avatar?: string;
  problems?: {
    easy?: number;
    medium?: number;
    hard?: number;
    total?: number;
  };
  contestRating?: number | string;
  contestStats?: {
    attendedContests?: number;
    globalRanking?: number | string;
  };
  dailyActivity?: DailyActivityEntry[];
}

interface ProfileUserRecord {
  username: string;
  displayName: string;
  avatar?: string;
  problems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  contestRating?: number | string;
  contestsAttended: number;
  globalRanking?: number | string;
  dailyActivity: Array<{ date: string; count: number }>;
  lastUpdated?: number;
}

interface CalendarDay {
  date: string;
  count: number;
}

const formatRelativeTime = (timestamp?: number) => {
  if (!timestamp) {
    return 'Never';
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs <= 0) {
    return 'Just now';
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const sumRecentActivity = (entries: Array<{ date: string; count: number }>, days: number) => {
  if (!entries || entries.length === 0) {
    return 0;
  }

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  return entries.reduce((total, entry) => {
    const current = new Date(entry.date);
    if (Number.isNaN(current.getTime())) {
      return total;
    }

    if (current >= cutoff) {
      return total + entry.count;
    }
    return total;
  }, 0);
};

const findLastActiveDate = (entries: Array<{ date: string; count: number }>) => {
  const activeEntries = entries
    .filter((entry) => entry.count > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return activeEntries[0]?.date;
};

const buildCalendarGrid = (activityMap: Record<string, number>, weeks = 18): CalendarDay[][] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7 - 1));
  start.setHours(0, 0, 0, 0);

  const startDay = start.getDay();
  start.setDate(start.getDate() - startDay);

  const grid: CalendarDay[][] = [];
  const cursor = new Date(start);

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const week: CalendarDay[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const isoDate = cursor.toISOString().slice(0, 10);
      const count = activityMap[isoDate] ?? 0;

      week.push({ date: isoDate, count });
      cursor.setDate(cursor.getDate() + 1);
    }

    grid.push(week);
  }

  return grid;
};

const getCalendarCellClass = (count: number) => {
  if (count <= 0) {
    return 'bg-slate-200/70';
  }
  if (count <= 2) {
    return 'bg-emerald-100';
  }
  if (count <= 5) {
    return 'bg-emerald-300';
  }
  if (count <= 10) {
    return 'bg-emerald-500';
  }
  return 'bg-emerald-700';
};

const formatCalendarTooltip = (date: string, count: number) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return `${count} submissions`;
  }

  const formattedDate = parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `${count} submission${count === 1 ? '' : 's'} on ${formattedDate}`;
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const { trackedUsers } = useTrackedUsers();

  const [records, setRecords] = useState<ProfileUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTrackedData = useCallback(async () => {
    if (trackedUsers.length === 0) {
      setRecords([]);
      setErrorUsers([]);
      setErrorMessage(null);
      return;
    }

    const headers = getAuthHeaders();

    type FetchResult = { tracked: TrackedUserSummary; record: ProfileUserRecord | null };

    const results: FetchResult[] = await Promise.all(
      trackedUsers.map(async (tracked): Promise<FetchResult> => {
        try {
          const response = await axios.get<ApiUserPayload>(apiClient.getUser(tracked.username), {
            timeout: 9000,
            headers,
          });

          const payload = response.data ?? {};

          const activity = Array.isArray(payload.dailyActivity)
            ? payload.dailyActivity
                .filter((entry) => entry?.date)
                .map((entry) => ({
                  date: entry.date!,
                  count: Number.isFinite(Number(entry.count)) ? Number(entry.count) : 0,
                }))
            : [];

          return {
            tracked,
            record: {
              username: payload.username ?? tracked.username,
              displayName: tracked.realName || payload.username || tracked.username,
              avatar: payload.avatar,
              problems: {
                easy: Number(payload.problems?.easy ?? 0),
                medium: Number(payload.problems?.medium ?? 0),
                hard: Number(payload.problems?.hard ?? 0),
                total: Number(payload.problems?.total ?? 0),
              },
              contestRating: payload.contestRating,
              contestsAttended: Number(payload.contestStats?.attendedContests ?? 0),
              globalRanking: payload.contestStats?.globalRanking,
              dailyActivity: activity,
              lastUpdated: tracked.lastUpdated ?? tracked.addedAt,
            },
          };
        } catch (error) {
          console.warn(`Failed to fetch data for ${tracked.username}`, error);
          return { tracked, record: null };
        }
      })
    );

    const successful = results.filter(
      (item): item is { tracked: TrackedUserSummary; record: ProfileUserRecord } => item.record !== null
    );

    const failed = results
      .filter((item) => item.record === null)
      .map((item) => item.tracked.username);

    setRecords(successful.map((item) => item.record));
    setErrorUsers(failed);

    if (failed.length > 0 && successful.length === 0) {
      setErrorMessage('Unable to load insights for your tracked profiles. Please try again.');
    } else {
      setErrorMessage(null);
    }
  }, [trackedUsers]);

  const loadTrackedData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchTrackedData();
    } finally {
      setLoading(false);
    }
  }, [fetchTrackedData]);

  const refreshTrackedData = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTrackedData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchTrackedData]);

  useEffect(() => {
    loadTrackedData();
  }, [loadTrackedData]);

  const trackedCount = trackedUsers.length;

  const totalSolved = useMemo(
    () => records.reduce((sum, record) => sum + record.problems.total, 0),
    [records]
  );

  const activeThisWeek = useMemo(() => {
    if (records.length === 0) {
      return 0;
    }

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 6);

    return records.filter((record) =>
      record.dailyActivity.some((entry) => {
        if (entry.count <= 0) {
          return false;
        }

        const date = new Date(entry.date);
        if (Number.isNaN(date.getTime())) {
          return false;
        }

        return date >= cutoff;
      })
    ).length;
  }, [records]);

  const total30DaySolves = useMemo(
    () => records.reduce((sum, record) => sum + sumRecentActivity(record.dailyActivity, 30), 0),
    [records]
  );

  const averageDailySolves = useMemo(() => {
    if (records.length === 0) {
      return 0;
    }

    return Number((total30DaySolves / 30).toFixed(1));
  }, [records, total30DaySolves]);

  const latestSync = useMemo(() => {
    if (records.length === 0) {
      return 'Never';
    }

    const timestamp = records.reduce((latest, record) => {
      if (!record.lastUpdated) {
        return latest;
      }
      return Math.max(latest, record.lastUpdated);
    }, 0);

    return formatRelativeTime(timestamp);
  }, [records]);

  const aggregatedActivity = useMemo(() => {
    const map: Record<string, number> = {};

    records.forEach((record) => {
      record.dailyActivity.forEach((entry) => {
        const key = entry.date.slice(0, 10);
        if (!key) {
          return;
        }

        map[key] = (map[key] ?? 0) + entry.count;
      });
    });

    return map;
  }, [records]);

  const calendarGrid = useMemo(() => buildCalendarGrid(aggregatedActivity, 18), [aggregatedActivity]);

  const hasCalendarActivity = useMemo(
    () => calendarGrid.some((week) => week.some((day) => day.count > 0)),
    [calendarGrid]
  );

  const reportRows = useMemo(() => {
    return records
      .map((record) => {
        const lastActive = findLastActiveDate(record.dailyActivity);
        const thirtyDaySolves = sumRecentActivity(record.dailyActivity, 30);

        return {
          username: record.username,
          displayName: record.displayName,
          avatar: record.avatar,
          totalSolved: record.problems.total,
          easy: record.problems.easy,
          medium: record.problems.medium,
          hard: record.problems.hard,
          lastActive,
          thirtyDaySolves,
          contestRating: record.contestRating,
          contestsAttended: record.contestsAttended,
        };
      })
      .sort((a, b) => b.thirtyDaySolves - a.thirtyDaySolves);
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size={48} />
      </div>
    );
  }

  if (trackedCount === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5m3 0l2-2 2 2m-4-6l2-2 2 2" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-slate-900">No profiles tracked yet</h2>
          <p className="mt-3 text-sm text-slate-500">
            Add your first LeetCode profile to unlock activity calendars, monitoring reports, and personalized insights.
          </p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffa116] to-[#ff9502] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-[#ffa116] focus:ring-offset-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start tracking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Monitoring hub</p>
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">
                  Welcome back{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Keep tabs on your tracked LeetCode profiles with real-time activity calendars and health reports.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refreshTrackedData}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  className={`h-5 w-5 ${refreshing ? 'animate-spin text-orange-500' : 'text-slate-500'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M20 20v-5h-.581m-15.357-2a8.003 8.003 0 0015.357 2" />
                </svg>
                Refresh data
              </button>
              <Link
                to="/users"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffa116] to-[#ff8c00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40"
              >
                Manage tracking
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 px-6 py-2.5 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50"
              >
                Team analytics
              </Link>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {errorMessage}
          </div>
        )}

        {errorUsers.length > 0 && !errorMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            We could not refresh data for {errorUsers.join(', ')}. They will be retried on the next sync.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tracked profiles</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900">{trackedCount}</span>
              <span className="text-xs text-slate-500">active monitors</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Active this week</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-emerald-600">{activeThisWeek}</span>
              <span className="text-xs text-slate-500">showing recent activity</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total solved</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[#ffa116]">{totalSolved.toLocaleString()}</span>
              <span className="text-xs text-slate-500">lifetime problems</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Last sync</p>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{latestSync}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Activity calendar</h2>
                <p className="text-sm text-slate-500">Combined submissions from your tracked profiles over the last 18 weeks.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Less</span>
                {[0, 1, 4, 8, 12].map((threshold, index) => (
                  <div
                    key={threshold}
                    className={`h-3.5 w-3.5 rounded ${getCalendarCellClass(index === 0 ? 0 : threshold)}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {calendarGrid.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No activity recorded yet. Solve problems or sync tracked profiles to populate the calendar.
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex flex-col justify-between py-1 text-[11px] font-medium text-slate-400">
                    {['Mon', 'Wed', 'Fri'].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="flex gap-[3px]">
                    {calendarGrid.map((week, weekIndex) => (
                      <div key={`week-${weekIndex}`} className="flex flex-col gap-[3px]">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            className={`h-3.5 w-3.5 rounded ${getCalendarCellClass(day.count)}`}
                            title={formatCalendarTooltip(day.date, day.count)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hasCalendarActivity ? (
              <p className="mt-4 text-xs text-slate-500">
                Tracking {Object.values(aggregatedActivity).filter((value) => value > 0).length} active day(s) across all monitored profiles in the last quarter.
              </p>
            ) : (
              <p className="mt-4 text-xs text-slate-500">
                Recent activity data will appear here after your tracked profiles sync with new submissions.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">System vitals</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-4">
                <span>30-day solve volume</span>
                <span className="text-base font-semibold text-slate-900">{total30DaySolves}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span>Average solves per day</span>
                <span className="text-base font-semibold text-slate-900">{averageDailySolves}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span>Inactive monitors</span>
                <span className="text-base font-semibold text-slate-900">{Math.max(trackedCount - activeThisWeek, 0)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              These metrics aggregate activity across all tracked profiles, helping you keep the team on pace.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tracked user reports</h2>
              <p className="text-sm text-slate-500">
                Monitor performance, streaks, and contest readiness for each tracked profile.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                {activeThisWeek} active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-500">
                {Math.max(trackedCount - activeThisWeek, 0)} idle
              </span>
            </div>
          </div>

          <div className="mt-6">
            {reportRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                We could not load report details. Try refreshing the data above.
              </div>
            ) : (
              <Table className="overflow-hidden rounded-2xl border border-slate-200">
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="min-w-[180px]">User</TableHead>
                    <TableHead className="text-center">Total solved</TableHead>
                    <TableHead className="hidden text-center sm:table-cell">30d solves</TableHead>
                    <TableHead className="hidden text-center md:table-cell">Last active</TableHead>
                    <TableHead className="hidden text-center lg:table-cell">Contest rating</TableHead>
                    <TableHead className="w-[160px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRows.map((row) => (
                    <TableRow key={row.username} className="hover:bg-slate-50/70">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {row.avatar ? (
                            <img
                              src={row.avatar}
                              alt={row.displayName}
                              className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                              {row.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{row.displayName}</p>
                            <p className="truncate text-xs text-slate-500">@{row.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-slate-900">
                        {row.totalSolved.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden text-center text-sm font-medium text-slate-700 sm:table-cell">
                        {row.thirtyDaySolves}
                      </TableCell>
                      <TableCell className="hidden text-center text-sm text-slate-600 md:table-cell">
                        {row.lastActive ? (
                          <div className="flex flex-col gap-0.5">
                            <span>{formatRelativeTime(new Date(row.lastActive).getTime())}</span>
                            <span className="text-xs text-slate-400">{formatDate(row.lastActive)}</span>
                          </div>
                        ) : (
                          <span>Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-center text-sm text-slate-600 lg:table-cell">
                        {row.contestRating ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Link
                            to={`/user/${row.username}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                          >
                            Progress
                          </Link>
                          <Link
                            to={`/user/${row.username}/submissions`}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                          >
                            Submissions
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
