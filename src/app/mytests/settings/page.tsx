
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAtom } from 'jotai'
import { testNameAtom } from '../../store/myTestAtom'

const settingsSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  category: z.string(),
  description: z.string(),
  language: z.string()
})

export default function Settings() {
  const [testName, setTestName] = useAtom(testNameAtom)

  const [formData, setFormData] = useState({
    testName: testName,
    category: 'Uncategorized',
    description: '',
    language: 'English'
  })

  const categories = [
    'Uncategorized',
    'Technical',
    'Academic',
    'Professional',
    'Certification'
  ]

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      settingsSchema.parse(formData)
      toast.success('Settings saved successfully')
      // Handle successful save
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message)
        })
      }
    }
  }

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Test Name</label>
          <input
            type="text"
            value={formData.testName}
            onChange={(e) => {
              setFormData({ ...formData, testName: e.target.value })
              setTestName(e.target.value)
            } }
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter test name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter test description"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Test Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
