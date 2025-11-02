


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BarChart3, Users, LineChart, Shield } from "lucide-react";
import axios from "axios";
import { apiClient } from "../config/api";
import { useTrackedUsers } from "../context/UserContext";

const HomePage = () => {
  const { trackedUsers } = useTrackedUsers();
  const trackedUserCount = trackedUsers.length;
  const trackedUserCountDisplay = trackedUserCount.toLocaleString("en-IN");
  const [totalProblems, setTotalProblems] = useState<number | null>(null);
  const [loadingTotals, setLoadingTotals] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTotalProblems = async () => {
      if (trackedUsers.length === 0) {
        if (isMounted) {
          setTotalProblems(0);
        }
        return;
      }

      setLoadingTotals(true);

      try {
        const totals = await Promise.all(
          trackedUsers.map(async (user) => {
            try {
              const response = await axios.get(apiClient.getUser(user.username), { timeout: 10000 });
              const userTotal = response.data?.problems?.total;
              return typeof userTotal === "number" && !Number.isNaN(userTotal) ? userTotal : 0;
            } catch (error) {
              console.error(`❌ Failed to fetch problems for ${user.username}:`, (error as Error)?.message ?? error);
              return 0;
            }
          })
        );

        if (isMounted) {
          const combinedTotal = totals.reduce((sum, current) => sum + current, 0);
          setTotalProblems(combinedTotal);
        }
      } finally {
        if (isMounted) {
          setLoadingTotals(false);
        }
      }
    };

    fetchTotalProblems();

    return () => {
      isMounted = false;
    };
  }, [trackedUsers]);

  const totalProblemsDisplay =
    totalProblems !== null && !loadingTotals
      ? totalProblems.toLocaleString("en-IN")
      : loadingTotals
        ? "Loading..."
        : "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-200px] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-200 via-amber-100 to-orange-50 blur-3xl opacity-60" />
          <div className="absolute right-[10%] top-[320px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-3xl opacity-50" />
        </div>

        <header className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-28">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Real-time LeetCode insights
            </span>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">
              Stay ahead with live LeetCode tracking
            </h1>
            <p className="text-base text-slate-500 sm:text-lg">
              Monitor contests, solved problems, and activity streaks across all the profiles you care about. Built for coaches, communities, and teams who want clarity and momentum.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/dashboard" className="btn-leetcode gap-2 text-base">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/users" className="btn-outline text-base">
                Explore tracked users
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                4K+ submissions monitored
              </span>
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Built for coaches & study groups
              </span>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Tracked users</p>
                  <p className="text-3xl font-semibold text-slate-900">{trackedUserCountDisplay}</p>
                </div>
                <div className="rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-600">+3 new this week</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Total problems</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{totalProblemsDisplay}</p>
                  <p className="text-xs text-slate-500">combined solved this quarter</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Daily streak insights</p>
                    <p className="text-xs text-slate-500">See who is keeping their momentum alive.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Live performance analytics</h3>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Compare solved counts, contest ratings, and submission velocity at a glance with thoughtfully crafted visual summaries.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Team-ready monitoring</h3>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Track mentees or teammates together, with fast access to submissions, streaks, and key milestones in one place.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Shield className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Reliable data sourcing</h3>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Our ingestion pipeline keeps snapshots fresh and trustworthy so you can make decisions with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center shadow-xl">
          <h2 className="text-3xl font-semibold text-slate-900">Ready to build your LeetCode leaderboard?</h2>
          <p className="mt-3 text-sm text-slate-500">
            Start by exploring the dashboard, add your first set of profiles, and watch the insights roll in.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn-leetcode gap-2 text-base">
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/users" className="btn-outline text-base">
              View tracked profiles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
