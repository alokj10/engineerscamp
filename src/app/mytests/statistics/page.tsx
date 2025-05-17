'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TestResultStatisticsAtom } from '@/app/store/myTestAtom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { isAuthenticated } from '@/app/uiUtils';
import { UserGroupIcon } from '@/app/components/Sidebar';
import { CheckCircleIcon, XCircleIcon } from '../results/answersreview/page';
import { ClockIcon } from '../layout';
import { currentTestConfigurationAtom } from '@/app/store/myTestAtom'
import { useAtom } from 'jotai'


export default function TestStatistics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  const [statistics, setStatistics] = useState<TestResultStatisticsAtom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)

  useEffect(() => {
    const checkUserAuth = async () => {
      const auth = await isAuthenticated();
      if (!auth) {
        router.push('/login');
        return;
      }
    };

    const fetchStatistics = async () => {
    //   if (!testId) {
    //     setError('Test ID is required');
    //     setLoading(false);
    //     return;
    //   }

      try {
        const response = await fetch('/api/results/statistics?testId=' + currentTestConfiguration.test.testId)
        // const response = await fetch(`/api/results/statistics?testId=${currentTestConfiguration.test.testId}`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error(`Error fetching statistics: ${err instanceof Error ? err.message : String(err)}`);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
    fetchStatistics();
  }, [testId, router]);

  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Data for pie chart
  const chartData = statistics ? [
    { name: 'Passed', value: statistics.passedCount },
    { name: 'Failed', value: statistics.failedCount },
  ] : [];

  const COLORS = ['#4ade80', '#f87171'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notice: </strong>
          <span className="block sm:inline">No statistics available for this test.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Performance Overview</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Respondents</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.respondentsCount}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Passed</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.passedCount}</p>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.failedCount}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.avgCompletionTime}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Pass/Fail Distribution</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="flex items-center mr-6">
              <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Passed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Failed</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => router.back()} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Back to Tests
        </button>
      </div>
    </div>
  );
}