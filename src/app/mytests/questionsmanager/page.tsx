
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { QuestionAnswerDefinitionAtom } from '@/app/store/questionAnswerDefinitionAtom'
import { Editor, EditorState, convertFromRaw } from "draft-js";
import { toast } from 'react-hot-toast';


interface Question {
  id: number
  serialNo: number
  category: string
  type: string
  points: number
  text: string
  options: string[]
  correctAnswers: number[]
}

export default function QuestionsManager() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionAnswerDefinitionAtom[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const router = useRouter();

  const handleDeleteClick = (questionId: number) => {
    setShowDeleteConfirm(questionId);
    setShowMenu(null);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/mytests/questionsmanager/${questionId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Question deleted successfully');
        fetchQuestions(); // Refresh the questions list
      } else {
        toast.error(data.error || 'Failed to delete question');
      }
    } catch (error) {
      toast.error('Error deleting question');
    }
    
    setShowMenu(null); // Close the menu after action
  };
  
  const fetchQuestions = async () => {
    const params = new URLSearchParams()
    
    if (selectedCategory !== 'All') {
      params.append('category', selectedCategory)
    }
    
    if (searchText) {
      params.append('search', searchText)
    }

    const queryString = params.toString()
    const url = `/api/mytests/questionsmanager${queryString ? `?${queryString}` : ''}`

    try {
      const response = await fetch(url)
      const { data } = await response.json()
      console.log(`1 - ${filteredQuestions.length}, ${data}`);
      setFilteredQuestions(data)
      console.log(`2 - ${filteredQuestions.length}`);
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [selectedCategory, searchText])

  const categories = ['All', 'Programming', 'Database', 'Networking']

  // const filteredQuestions = questions.filter(q => {
  //   const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory
  //   const matchesSearch = q.text.toLowerCase().includes(searchText.toLowerCase())
  //   return matchesCategory && matchesSearch
  // })

  return (
    <div className="p-4">
      <div className="bg-white shadow-sm border-b sticky top-0">
  <div className="flex justify-between items-center p-4">
    <div className="flex items-center gap-4">
      <span className="text-gray-600 font-medium">
        {filteredQuestions?.length} Question(s)
      </span>
      <div className="flex gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
          <div className="flex items-center gap-2">
            {showSearch ? (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="ml-2 p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              onClick={() => router.push('/mytests/questionsmanager/add')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Question
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {filteredQuestions && filteredQuestions.length && filteredQuestions.map((question, qIndex) => (
          <div key={question.question.questionId} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">Q {qIndex + 1}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">{question.question.category}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">{question.question.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">10 points</span>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === question.question.questionId ? null : question.question.questionId)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {showMenu === question.question.questionId && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(question.question.questionId)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
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
            </div>

            <p className="mb-4">
              {/* {question.question.blocks[0].text} */}
              <Editor editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(question.question.question)))} readOnly={true} />
            </p>

            <div className="space-y-2">
              {question.answerOptions.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    option.isCorrect
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Editor editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(option.answer)))} readOnly={true} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">Delete Question</h3>
      <p className="text-gray-600 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteConfirm(null)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleDeleteQuestion(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}
