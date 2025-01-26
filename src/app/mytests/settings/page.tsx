'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAtom } from 'jotai'
import { TestDefinitionAtom, testNameAtom } from '../../store/myTestAtom'
import { currentTestConfigurationAtom } from '@/app/store/myTestAtom'

import { TestQuestionMappingState } from '../../store/myTestAtom'
import { EditableDropdown } from '@/app/components/editableDropdown'
import { TestStatus } from '@/app/Constants'
import { checkAuth } from '@/app/uiUtils'
import { useRouter } from 'next/navigation';

const testSchema = z.object({
  name: z.string().min(5, 'Test name must be at least 5 characters'),
  category: z.string().min(1, 'At least one category is required'),
  language: z.string().min(1, 'Language is required'),
  description: z.string().optional(),
});

export default function Settings() {
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)
  const [testCategories, setTestCategories] = useState<string[]>([])
  const router = useRouter()
  useEffect(() => {
    checkAuth(router)
  }, [router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/mytests/categories')
      if (response.ok) {
        const categoriesList = await response.json() as any[]
        let categories: string[] = []
        categoriesList.map(c => {
          categories.push(c.name)
        })
        setTestCategories(categories)
      }
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const addNewCategory = async (newCategory: string) => {
    try {
      const response = await fetch('/api/mytests/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      })
      
      if (response.ok) {
        await fetchCategories()
        toast.success('Category added successfully')
      }
    } catch (error) {
      toast.error('Failed to add category')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  console.log('currentTestConfiguration-settings', currentTestConfiguration)

  const handleFieldChange = (field: keyof TestDefinitionAtom, value: string) => {
    setCurrentTestConfiguration(prev => ({
      ...prev!,
      test: {
        ...prev!.test,
        [field]: value
      }
    }));
  };


  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi'
  ]
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('currentTestConfiguration', currentTestConfiguration)    
    try {
      const validatedData = testSchema.parse(currentTestConfiguration.test);
      
      const response = await fetch('/api/mytests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTestConfiguration.test),
      });

      if (response.ok) {
        const testResponse = await response.json();
        setCurrentTestConfiguration({
          ...currentTestConfiguration,
          test: {
            ...currentTestConfiguration.test,
            testId: testResponse.testId
          } 
        });
        toast.success(testResponse.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create test');
      }
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };
  const getSaveButtonText = () => {
    return currentTestConfiguration?.test.testId === -1 ? 'Create Test' : 'Save'
  }
  
  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Test Name</label>
          <input
            type="text"
            value={currentTestConfiguration?.test?.name}
            onChange={(e) => {
              handleFieldChange('name', e.target.value )
            }}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter test name"
          />
        </div>

        <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Category</label>

          <EditableDropdown
            items={testCategories}
            selectedItems={[currentTestConfiguration?.test.category]}
            isMultiSelect={false}
            isEditable={true}
            onSelectionChange={(selected) => handleFieldChange('category', selected[0])}
            onAddItem={addNewCategory}
          />

        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description <span className='text-xs text-gray-400'>(Visible to you only)</span> </label>
          <textarea
            value={currentTestConfiguration?.test.description}
            onChange={(e) => {
              handleFieldChange('description', e.target.value )
            }}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter test description"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Test Language</label>
          <select
            value={currentTestConfiguration?.test.language}
            onChange={(e) => {
              handleFieldChange('language', e.target.value )
            }}
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
            {getSaveButtonText()}
          </button>
        </div>
      </form>
    </div>
  )
}
