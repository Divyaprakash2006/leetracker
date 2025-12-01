import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTrackedUsers } from "../context/UserContext";
import axios from "axios";
import { apiClient, getAuthHeaders } from "../config/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Users, CheckCircle2, Clock, Plus } from "lucide-react";
import { Loader } from "../components/Loader";
import "../components/AnimatedButton.css";

interface UserStats {
  username: string;
  problemsSolved: number;
  addedAt: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

export const DashboardPage: React.FC = () => {
  const { trackedUsers } = useTrackedUsers();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    console.log('📊 DashboardPage: Tracked users updated', trackedUsers.length);
  }, [trackedUsers]);

  useEffect(() => {
    const fetchStats = async () => {
      if (trackedUsers.length === 0) {
        setLoading(false);
        setUserStats([]);
        return;
      }

      try {
        setLoading(true);
        console.log(`📊 Fetching stats for ${trackedUsers.length} tracked user(s)...`);
        const headers = getAuthHeaders();
        
        // Optimized: Parallel fetch with timeout and error handling
        const statsPromises = trackedUsers.map(async (user) => {
          try {
            const response = await axios.get(apiClient.getUser(user.username), {
              timeout: 8000,
              headers
            });
            const data = response.data;
            
            const problems = data?.problems || { total: 0, easy: 0, medium: 0, hard: 0 };
            const ranking = data?.ranking || 999999;
            
            return {
              username: user.username,
              problemsSolved: problems.total || 0,
              totalSolved: problems.total || 0,
              easySolved: problems.easy || 0,
              mediumSolved: problems.medium || 0,
              hardSolved: problems.hard || 0,
              ranking,
              addedAt: user.addedAt
            };
          } catch (err) {
            const status = (err as any)?.response?.status;
            if (status === 401 || status === 403) {
              throw err;
            }
            console.error(`Failed to fetch stats for ${user.username}:`, err);
            return {
              username: user.username,
              problemsSolved: 0,
              totalSolved: 0,
              easySolved: 0,
              mediumSolved: 0,
              hardSolved: 0,
              ranking: 999999,
              addedAt: user.addedAt
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        
        const sorted = stats.sort((a, b) => {
          if (b.totalSolved !== a.totalSolved) {
            return b.totalSolved - a.totalSolved;
          }
          return a.ranking - b.ranking;
        });
        
        console.log('✅ Stats fetched successfully');
        setUserStats(sorted);
        setLastUpdate(new Date());
      } catch (err) {
        const status = (err as any)?.response?.status;
        if (status === 401 || status === 403) {
          console.warn('Authentication required to load dashboard stats.');
          setUserStats([]);
          setLastUpdate(null);
        } else {
          console.error("Failed to fetch user stats:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trackedUsers]);

  const totalProblems = userStats.reduce((acc, user) => acc + user.totalSolved, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#fde3b0] bg-gradient-to-br from-[#fff9ec] via-[#fff4de] to-[#ffe7c7] p-10 shadow-[0_25px_60px_-22px_rgba(255,161,22,0.35)]">
          <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[#ffd18b] opacity-50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-[#ffc56a] opacity-40 blur-3xl" />
          <div className="pointer-events-none absolute top-10 right-1/4 h-32 w-32 rounded-full bg-[#ff9f70] opacity-30 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 text-center text-[#2b2b2b]">
            <span className="text-xs uppercase tracking-[0.55em] text-[#f59f0b]">LeetTracker</span>
            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase sm:text-5xl text-[#121212]">
                {trackedUsers.length === 0 ? 'Start Tracking' : 'LeetCode Stats'}
              </h1>
            </div>
            <Link to="/search" className="animated-button">
              <span className="fold"></span>
              <div className="points_wrapper">
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
                <i className="point"></i>
              </div>
              <span className="inner">
                <svg
                  className="icon"
                  fill="white"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  height="18px"
                  width="18px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"></path>
                </svg>
                Track now
              </span>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Tracked profiles</p>
                  <p className="text-4xl font-semibold text-slate-900">{trackedUsers.length}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">Profiles monitored across your workspace</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Problems solved</p>
                  <p className="text-4xl font-semibold text-slate-900">{totalProblems}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">Cumulative accepted submissions</p>
            </CardContent>
          </Card>

          {lastUpdate && (
            <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Last update</p>
                  <p className="text-sm text-slate-500">Dashboard refreshes automatically every 5 minutes</p>
                </div>
                <p className="text-2xl font-semibold text-slate-900">
                  {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      <section className="mt-12 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900">Top performers</h2>
            <p className="text-sm text-slate-500">Highlights from the most active tracked coders.</p>
          </div>
          {userStats.length > 3 && (
            <Button asChild variant="outline" size="lg" className="btn-outline">
              <Link to="/users">See all users</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-12 shadow-sm">
            <Loader size={48} />
          </div>
        ) : userStats.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userStats.slice(0, 3).map((user, index) => {
              const trackedUser = trackedUsers.find(u => u.username === user.username);
              const displayName = trackedUser?.realName || user.username;
              
              return (
              <Card key={user.username} className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">{displayName}</p>
                      {trackedUser?.realName && (
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      )}
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rank #{user.ranking.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                    {['Gold', 'Silver', 'Bronze'][index]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Solved</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{user.totalSolved}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Rating</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-500">{Math.floor(1500 + user.totalSolved * 2)}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span>Easy</span>
                    <span className="font-semibold">{user.easySolved}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-500">
                    <span>Medium</span>
                    <span className="font-semibold">{user.mediumSolved}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-600">
                    <span>Hard</span>
                    <span className="font-semibold">{user.hardSolved}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="btn-outline">
                    <Link to={`/user/${user.username}`}>Progress</Link>
                  </Button>
                  <Button asChild className="btn-leetcode">
                    <Link to={`/user/${user.username}/submissions`}>Submissions</Link>
                  </Button>
                </div>
              </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center text-slate-900 shadow-sm">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
                <Users className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Welcome to Your Personal Dashboard! 🎉</h3>
              <p className="max-w-md text-sm text-slate-500">
                Start tracking LeetCode profiles to monitor progress, compare stats, and view submissions. 
                Your dashboard is private - only you can see the users you track.
              </p>
            </div>
            <div className="space-y-2 text-xs text-slate-400 max-w-sm">
              <p>✅ Your account is ready</p>
              <p>✅ All data is private to you</p>
              <p>✅ Track unlimited LeetCode users</p>
            </div>
            <Button asChild className="btn-leetcode gap-2">
              <Link to="/search">
                <Plus className="h-4 w-4" />
                Track Your First User
              </Link>
            </Button>
          </Card>
        )}
      </section>
    </div>
  </div>
  );
};
