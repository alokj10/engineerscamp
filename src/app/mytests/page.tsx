'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TestQuestionMappingAtom, currentTestConfigurationAtom, TestDefinitionAtom } from '../store/myTestAtom'
import { useAtom } from 'jotai'

export default function MyTestsPage() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)
  const [tests, setTests] = useState<TestDefinitionAtom[]>([])
  const router = useRouter()
  console.log('currentTestConfiguration-root', currentTestConfiguration)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-600'
      case 'in_progress': return 'text-[#9f543d]'
      case 'closed': return 'text-[#9a0f3b]'
      default: return 'text-gray-600'
    }
  }

  const handleCreateNewTest = () => {
    const newTest: TestQuestionMappingAtom = 
    {
      id: -1,
      test: {
        testId: -1,
        name: 'Untitled Test',
        description: '',
        category: '',
        language: 'English',
        status: 'draft',
        questionSortOrder: '',
        createdBy: '',
        createdOn: new Date().toISOString()
      },
      questionAnswerDefinitions: []
    }
    setCurrentTestConfiguration(newTest)
  }

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/mytests')
      const data = await response.json()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    }
  }
  
  const handleEditTest = async (testId: number) => {
    try {
      const response = await fetch(`/api/mytests/${testId}`)
      const data = await response.json()
      
      const testConfig: TestQuestionMappingAtom = {
        id: testId,
        test: data.test,
        questionAnswerDefinitions: data.questionAnswerDefinitions,
        testRespondents: data.testRespondents
      }
      
      setCurrentTestConfiguration(testConfig)
      router.push('/mytests/settings')
    } catch (error) {
      console.error('Error fetching test details:', error)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tests (25)</h1>
        <Link href="/mytests/settings">
          <button
            onClick={handleCreateNewTest} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <PlusCircleIcon className="h-5 w-5" />
            Create New Test
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-4">
        <select 
          className="border rounded-lg px-3 py-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="math">Mathematics</option>
          <option value="science">Science</option>
        </select>

        <select 
          className="border rounded-lg px-3 py-2"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <div className="ml-auto relative">
          {showSearch && (
            <input
              type="text"
              placeholder="Search tests..."
              className="border rounded-lg px-3 py-2 w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          )}
          <SearchIcon
            className="h-6 w-6 cursor-pointer text-gray-600 ml-2"
            onClick={() => setShowSearch(!showSearch)}
          />
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.testId} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div className={`font-medium ${getStatusColor(test.status || 'draft')}`}>
                {test.status}
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(test.createdOn || '').toLocaleDateString()}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(test.testId)}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {showMenu === test.testId && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <button 
                      onClick={() => handleEditTest(test.testId)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                      </svg>
                      Clone
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{test.name}</h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {test.description}
              </p>
            </div>

            <div className="px-4 py-3 bg-gray-50 flex justify-end">
              <span className="text-sm text-gray-600">{test.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PlusCircleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
}

export function SearchIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
}

export function DotsVerticalIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        </svg>
}