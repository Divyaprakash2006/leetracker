import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTrackedUsers } from "../context/UserContext";
import axios from "axios";
import { apiClient } from "../config/api";

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
    const fetchStats = async () => {
      if (trackedUsers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stats = await Promise.all(
          trackedUsers.map(async (user) => {
            try {
              const response = await axios.get(apiClient.getUser(user.username));
              const data = response.data;
              
              const problems = data?.problems || { total: 0, easy: 0, medium: 0, hard: 0 };
              const ranking = data?.ranking || 999999;
              
              const totalSolved = problems.total || 0;
              const easySolved = problems.easy || 0;
              const mediumSolved = problems.medium || 0;
              const hardSolved = problems.hard || 0;
              
              return {
                username: user.username,
                problemsSolved: totalSolved,
                totalSolved,
                easySolved,
                mediumSolved,
                hardSolved,
                ranking,
                addedAt: user.addedAt
              };
            } catch (err) {
              console.error(`Failed to fetch stats for ${'$'}{user.username}:`, err);
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
          })
        );
        
        const sorted = stats.sort((a, b) => {
          if (b.totalSolved !== a.totalSolved) {
            return b.totalSolved - a.totalSolved;
          }
          return a.ranking - b.ranking;
        });
        
        setUserStats(sorted);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trackedUsers]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated Background - Modern Gradient Mesh */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-gray-900 to-black"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Mesh grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-12">
        <div className="space-y-8">
        {/* Hero Section */}
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700/50">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10"></div>
          
          <div className="relative z-10 px-8 py-16">
            <div className="mx-auto max-w-4xl">
              {/* Icon & Title */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl shadow-2xl flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30 rounded-3xl"></div>
                  </div>
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity -z-10"></div>
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3">
                    LeetCode Stats
                  </h1>
                  <p className="text-xl text-gray-300 font-medium">
                    Track your competitive programming progress
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Link
                  to="/search"
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  {/* Shine Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="relative z-10">Track Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Users Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Active Users</h3>
              </div>
              <p className="text-5xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                {trackedUsers.length}
              </p>
              <p className="text-gray-400 text-sm">{trackedUsers.length} users being tracked</p>
            </div>
          </div>

          {/* Total Problems Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Problems</h3>
              </div>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                {userStats.reduce((acc, user) => acc + user.totalSolved, 0)}
              </p>
              <p className="text-gray-400 text-sm">Combined problems solved</p>
            </div>
          </div>

          {/* Last Update Card */}
          {lastUpdate && (
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Last Update</h3>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {lastUpdate.toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-gray-400 text-sm">Auto-updates every 5 minutes</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Leaderboard */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Trophy Icon */}
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-2xl shadow-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {/* Trophy SVG */}
                  <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M7 7.5C7 7.5 7 10.5 10 10.5V15.5C10 15.5 7 15.5 7 12.5C7 9.5 7 7.5 7 7.5M17 7.5C17 7.5 17 10.5 14 10.5V15.5C14 15.5 17 15.5 17 12.5C17 9.5 17 7.5 17 7.5M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z"/>
                  </svg>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 rounded-2xl"></div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-leetcode-orange rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-leetcode-text-primary">Top Performers</h2>
                <p className="text-leetcode-text mt-1">Leading coders on the platform</p>
              </div>
            </div>
            {userStats.length > 3 && (
              <Link
                to="/users"
                className="px-4 py-2 bg-leetcode-orange text-white rounded-lg hover:bg-leetcode-orange-dark transition-all transform hover:scale-105 font-medium"
              >
                View All Users
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
              </div>
            ) : userStats.length > 0 ? (
              userStats.slice(0, 3).map((user, index) => {
                // Rank badge colors - iOS style
                const rankData = [
                  {
                    position: 1,
                    medal: '🥇',
                    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
                    glow: 'shadow-yellow-500/50',
                    border: 'border-yellow-400/30'
                  },
                  {
                    position: 2,
                    medal: '🥈',
                    gradient: 'from-gray-300 via-gray-400 to-gray-500',
                    glow: 'shadow-gray-400/50',
                    border: 'border-gray-400/30'
                  },
                  {
                    position: 3,
                    medal: '🥉',
                    gradient: 'from-orange-400 via-amber-600 to-orange-700',
                    glow: 'shadow-orange-500/50',
                    border: 'border-orange-400/30'
                  }
                ];
                const rank = rankData[index];

                return (
                  <div
                    key={user.username}
                    className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]"
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${rank.gradient} opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 -z-10`}></div>
                    
                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-3xl overflow-hidden backdrop-blur-xl">
                      {/* Header Section with Rank Badge */}
                      <div className="relative h-24 bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 overflow-visible">
                        {/* Animated pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
                        </div>
                        
                        {/* Rank Badge - Top Right */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${rank.gradient} shadow-2xl ${rank.glow} transform rotate-3 group-hover:rotate-6 transition-transform duration-300`}>
                            <span className="text-2xl">{rank.medal}</span>
                            <div className="absolute -inset-1 bg-gradient-to-br ${rank.gradient} opacity-20 blur-md -z-10"></div>
                          </div>
                        </div>

                        {/* Avatar - Fully visible */}
                        <div className="absolute -bottom-16 left-6 z-20">
                          <div className="relative group/avatar">
                            {/* Avatar glow ring */}
                            <div className={`absolute -inset-1 bg-gradient-to-br ${rank.gradient} rounded-full opacity-75 blur-md group-hover/avatar:opacity-100 transition-all duration-300`}></div>
                            {/* Avatar */}
                            <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${rank.gradient} text-4xl font-black text-white shadow-2xl border-4 border-gray-900 transform group-hover/avatar:scale-110 transition-transform duration-300`}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Info Section */}
                      <div className="px-6 pt-20 pb-5">
                        <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text truncate mb-1">
                          {user.username}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>India</span>
                          <span className="mx-1.5">•</span>
                          <span className="text-gray-500">Rank #{user.ranking.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Stats Cards - iOS Style */}
                      <div className="px-6 pb-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative group/stat overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-4 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent"></div>
                            <div className="relative">
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Solved</div>
                              <div className="text-3xl font-black text-transparent bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text">
                                {user.totalSolved}
                              </div>
                            </div>
                          </div>

                          <div className="relative group/stat overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>
                            <div className="relative">
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating</div>
                              <div className="text-3xl font-black text-transparent bg-gradient-to-br from-yellow-400 to-yellow-600 bg-clip-text">
                                {user.ranking > 0 ? Math.floor(1500 + (user.totalSolved * 2)) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Difficulty Breakdown - Compact */}
                      <div className="px-6 pb-5">
                        <div className="rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-4 border border-gray-700/40 backdrop-blur-sm">
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between group/diff hover:translate-x-1 transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50"></div>
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Easy</span>
                              </div>
                              <span className="text-lg font-black text-green-400">{user.easySolved}</span>
                            </div>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent"></div>
                            
                            <div className="flex items-center justify-between group/diff hover:translate-x-1 transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50"></div>
                                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Medium</span>
                              </div>
                              <span className="text-lg font-black text-yellow-400">{user.mediumSolved}</span>
                            </div>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent"></div>
                            
                            <div className="flex items-center justify-between group/diff hover:translate-x-1 transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50"></div>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Hard</span>
                              </div>
                              <span className="text-lg font-black text-red-400">{user.hardSolved}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Compact iOS Style */}
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-2 gap-2.5">
                          <Link
                            to={`/user/${user.username}`}
                            className="group/btn relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="text-xs font-bold text-white">Progress</span>
                            </div>
                          </Link>

                          <Link
                            to={`/user/${user.username}/submissions`}
                            className="group/btn relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs font-bold text-white">Submissions</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-lg leetcode-card shadow-lg border-2 border-leetcode-border p-8 text-center">
                <h3 className="mb-4 text-xl font-medium text-leetcode-text-primary">No Users Tracked</h3>
                <p className="mb-6 text-leetcode-text">Start tracking LeetCode users to see their progress here.</p>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-lg bg-leetcode-orange px-6 py-3 font-medium text-white hover:bg-leetcode-orange-dark transition-all transform hover:scale-105 shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Your First User
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
