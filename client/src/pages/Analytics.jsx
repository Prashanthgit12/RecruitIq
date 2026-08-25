import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Award, CheckCircle, Clock, Database, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-white">
          <Loader size={36} className="animate-spin text-brand-500" />
          <span className="ml-3 font-semibold text-dark-300">Retrieving analytics dashboards...</span>
        </div>
      </div>
    );
  }

  const renderCandidateCharts = () => {
    if (!data) return null;
    return (
      <div className="flex flex-col gap-6">
        {/* Quick summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <CheckCircle size={22} />
            </div>
            <div>
              <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Completed Sessions</span>
              <h3 className="text-xl font-black text-white mt-0.5">{data.stats?.completedInterviews || 0}</h3>
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Overall Score Rating</span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {data.stats?.overallAverage ? `${parseFloat(data.stats.overallAverage).toFixed(1)} / 5` : 'N/A'}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar skill charts */}
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl flex flex-col shadow-sm">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Core Skill Profile</h3>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skillsRadar}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" fontSize={8} />
                  <Radar name="My Skills" dataKey="score" stroke="#4f70cc" fill="#4f70cc" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line history charts */}
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl flex flex-col shadow-sm">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Performance Progress</h3>
            <div className="w-full h-[280px]">
              {data.scoreProgress?.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-dark-500 italic">No score progress history.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.scoreProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={9} />
                    <YAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="#4f70cc" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInterviewerCharts = () => {
    if (!data) return null;
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selections pie charts */}
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Recruitment Decisions</h3>
            <div className="w-full h-[230px] relative">
              {data.selectionRatio?.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-dark-500 italic">No selection stats recorded yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.selectionRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.selectionRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Languages bar charts */}
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl shadow-sm flex flex-col lg:col-span-2">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Programming Language Distribution</h3>
            <div className="w-full h-[230px]">
              {data.languages?.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-dark-500 italic">No language logs.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.languages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                    <YAxis stroke="#a1a1aa" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#4f70cc" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Difficulties distribution & Month timeline curves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Interview Difficulties Shares</h3>
            <div className="w-full h-[230px]">
              {data.difficulties?.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-dark-500 italic">No difficulty data logs.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.difficulties}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                    <YAxis stroke="#a1a1aa" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#7996d8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider mb-4">Completed Interviews Curve</h3>
            <div className="w-full h-[230px]">
              {data.completedTimeline?.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-dark-500 italic">No monthly completions logs.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.completedTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                    <YAxis stroke="#a1a1aa" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      <Navbar />

      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-grow p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Performance Analytics</h1>
            <p className="text-dark-400 text-xs mt-1">Review statistical charts, score progression, and feedback highlights.</p>
          </div>

          {user.role === 'interviewer' ? renderInterviewerCharts() : renderCandidateCharts()}
        </main>
      </div>
    </div>
  );
};

export default Analytics;
