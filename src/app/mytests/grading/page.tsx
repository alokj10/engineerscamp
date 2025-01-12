
'use client'
import { useState } from 'react'
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'
import { motion } from 'framer-motion'

interface GradingConfig {
  endMessage: EditorState
  passMark: number
  shareResult: boolean
  resultOptions: {
    showPassFailMessage: boolean
    showPercentage: boolean
    showCorrectAnswers: boolean
  }
  passMessage: string
  failMessage: string
  notificationEmail: string
}

export default function GradingPage() {
  const [config, setConfig] = useState<GradingConfig>({
    endMessage: EditorState.createEmpty(),
    passMark: 60,
    shareResult: false,
    resultOptions: {
      showPassFailMessage: false,
      showPercentage: false,
      showCorrectAnswers: false
    },
    passMessage: '',
    failMessage: '',
    notificationEmail: ''
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Completion Settings</h1>

        <div className="space-y-8">
          {/* End Message Editor */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-gray-50 rounded-lg"
          >
            <label className="block text-lg font-semibold mb-3">Test Completion Message</label>
            <div className="border rounded-lg p-4 bg-white">
              <Editor
                editorState={config.endMessage}
                onChange={(state) => setConfig({...config, endMessage: state})}
              />
            </div>
          </motion.div>

          {/* Pass Mark */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-gray-50 rounded-lg"
          >
            <label className="block text-lg font-semibold mb-3">Pass Mark (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.passMark}
              onChange={(e) => setConfig({...config, passMark: parseInt(e.target.value)})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </motion.div>

          {/* Share Results */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-gray-50 rounded-lg"
          >
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={config.shareResult}
                onChange={(e) => setConfig({...config, shareResult: e.target.checked})}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-lg font-semibold">Share Results with Respondent</span>
            </label>

            {config.shareResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-8 space-y-4"
              >
                <div className="space-y-2">
                  <label className="block font-medium">Result Display Options</label>
                  <div className="space-y-2">
                    {Object.entries(config.resultOptions).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setConfig({
                            ...config,
                            resultOptions: {
                              ...config.resultOptions,
                              [key]: e.target.checked
                            }
                          })}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {config.resultOptions.showPassFailMessage && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">Pass Message</label>
                      <input
                        type="text"
                        value={config.passMessage}
                        onChange={(e) => setConfig({...config, passMessage: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Congratulations! You passed!"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Fail Message</label>
                      <input
                        type="text"
                        value={config.failMessage}
                        onChange={(e) => setConfig({...config, failMessage: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Unfortunately, you did not pass."
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Notification Email */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-gray-50 rounded-lg"
          >
            <label className="block text-lg font-semibold mb-3">Result Notification Email</label>
            <input
              type="email"
              value={config.notificationEmail}
              onChange={(e) => setConfig({...config, notificationEmail: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="email@example.com"
            />
          </motion.div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
