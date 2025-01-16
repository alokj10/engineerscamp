'use client'
import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { currentTestConfigurationAtom } from '@/app/store/myTestAtom'
import { toast } from 'react-hot-toast'

export default function GradingPage() {
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)

  useEffect(() => {
    if (currentTestConfiguration?.test) {
      setCurrentTestConfiguration({
        ...currentTestConfiguration,
        test: {
          ...currentTestConfiguration.test,
          completionMessage: currentTestConfiguration.test.completionMessage || '',
          passingScore: currentTestConfiguration.test.passingScore || 60,
          showResults: currentTestConfiguration.test.showResults || false,
          showPassFailMessage: currentTestConfiguration.test.showPassFailMessage || false,
          showScore: currentTestConfiguration.test.showScore || false,
          showCorrectAnswer: currentTestConfiguration.test.showCorrectAnswer || false,
          passMessage: currentTestConfiguration.test.passMessage || '',
          failMessage: currentTestConfiguration.test.failMessage || '',
          resultRecipients: currentTestConfiguration.test.resultRecipients || ''
        }
      })
    }
  }, [])

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/mytests/${currentTestConfiguration.test.testId}/grading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTestConfiguration)
      })

      if (!response.ok) {
        throw new Error('Failed to save grading settings')
      }

      toast.success('Grading settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save grading settings')
      console.error('Error saving grading settings:', error)
    }
  }

  const updateTestConfig = (updates: Partial<typeof currentTestConfiguration.test>) => {
    setCurrentTestConfiguration({
      ...currentTestConfiguration,
      test: {
        ...currentTestConfiguration.test,
        ...updates
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Completion Settings</h1>

        <div className="space-y-8">
          <div className="p-6 bg-gray-50 rounded-lg">
            <label className="block text-lg font-semibold mb-3">Test Completion Message</label>
            <textarea
              value={currentTestConfiguration.test.completionMessage || ''}
              onChange={(e) => updateTestConfig({ completionMessage: e.target.value })}
              className="w-full p-4 border rounded-lg"
              rows={4}
            />
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <label className="block text-lg font-semibold mb-3">Pass Mark (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={currentTestConfiguration.test.passingScore || 60}
              onChange={(e) => updateTestConfig({ passingScore: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={currentTestConfiguration.test.showResults || false}
                onChange={(e) => updateTestConfig({ showResults: e.target.checked })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-lg font-semibold">Share Results with Respondent</span>
            </label>

            {currentTestConfiguration.test.showResults && (
              <div className="ml-8 space-y-4">
                <div className="space-y-2">
                  <label className="block font-medium">Result Display Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentTestConfiguration.test.showPassFailMessage || false}
                        onChange={(e) => updateTestConfig({ showPassFailMessage: e.target.checked })}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>Show Pass/Fail Message</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentTestConfiguration.test.showScore || false}
                        onChange={(e) => updateTestConfig({ showScore: e.target.checked })}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>Show Score</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentTestConfiguration.test.showCorrectAnswer || false}
                        onChange={(e) => updateTestConfig({ showCorrectAnswer: e.target.checked })}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>Show Correct Answers</span>
                    </label>
                  </div>
                </div>

                {currentTestConfiguration.test.showPassFailMessage && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">Pass Message</label>
                      <input
                        type="text"
                        value={currentTestConfiguration.test.passMessage || ''}
                        onChange={(e) => updateTestConfig({ passMessage: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Congratulations! You passed!"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Fail Message</label>
                      <input
                        type="text"
                        value={currentTestConfiguration.test.failMessage || ''}
                        onChange={(e) => updateTestConfig({ failMessage: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Unfortunately, you did not pass."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <label className="block text-lg font-semibold mb-3">Result Recipients (comma-separated emails)</label>
            <input
              type="text"
              value={currentTestConfiguration.test.resultRecipients || ''}
              onChange={(e) => updateTestConfig({ resultRecipients: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="email@example.com, another@example.com"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
