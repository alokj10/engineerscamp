'use client'

import { useEffect, useState } from 'react'
import { TestResponseAtom } from '@/app/store/myTestAtom'
import { format } from 'date-fns'
import { currentTestConfigurationAtom } from '@/app/store/myTestAtom'
import { useAtom } from 'jotai'

export default function TestResultsPage() {
  const [testResponses, setTestResponses] = useState<TestResponseAtom[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/results?testId=' + currentTestConfiguration.test.testId)
        
        if (!response.ok) {
          throw new Error('Failed to fetch test results')
        }
        
        const data = await response.json()
        setTestResponses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching results')
        console.error('Error fetching test results:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestResults()
  }, [])

  const calculatePassStatus = (response: TestResponseAtom): boolean => {
    // Assuming passing score is 60% - this should be adjusted based on your requirements
    return response.score >= 60
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (e) {
      return 'Invalid date'
    }
  }

  const calculateDuration = (startDate: string, endDate: string): string => {
    try {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      const durationMs = end - start
      
      // Convert to minutes and seconds
      const minutes = Math.floor(durationMs / 60000)
      const seconds = Math.floor((durationMs % 60000) / 1000)
      
      return `${minutes}m ${seconds}s`
    } catch (e) {
      return 'N/A'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">My Test Results</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : testResponses.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
          <p>No test results found. Take a test to see your results here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Taken
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testResponses &&
              testResponses.length > 0 &&
              testResponses.map((response, index) => {
                const isPassed = calculatePassStatus(response)
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {response.respondent.firstName} {response.respondent.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{response.respondent.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(response.startedOn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(response.submittedOn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateDuration(response.startedOn, response.submittedOn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{response.score}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isPassed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}