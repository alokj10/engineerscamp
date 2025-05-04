'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TestResponseDetailsAtom {
  questionId: number;
  question: string;
  answer: string;
  isCorrect: boolean;
}

const XMarkIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
    )
}

const CheckCircleIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
    )
}

const XCircleIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
        </svg>
    )
}

const AnswersReviewPage = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondentInfo, setRespondentInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [testResponseDetails, setTestResponseDetails] = useState<TestResponseDetailsAtom[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      
      // Get respondent info from URL parameters
      const firstName = searchParams.get('firstName') || '';
      const lastName = searchParams.get('lastName') || '';
      const email = searchParams.get('email') || '';
      setRespondentInfo({ firstName, lastName, email });
      
      // Get response details from URL parameter
      const responseDetailsParam = searchParams.get('responseDetails');
      
      if (responseDetailsParam) {
        try {
          const details = JSON.parse(decodeURIComponent(responseDetailsParam)) as TestResponseDetailsAtom[];
          setTestResponseDetails(details);
        } catch (e) {
          console.error('Failed to parse response details:', e);
          setError('Failed to parse test response details');
        }
      } else {
        setError('No response details provided');
      }
    } catch (err) {
      console.error('Error processing parameters:', err);
      setError('Failed to process parameters');
    } finally {
      setLoading(false);
      // Trigger the fade-in animation after a small delay
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
    setIsOpen(false);
    // Navigate back to the results page after animation completes
    setTimeout(() => {
      window.history.back();
    }, 400); // Slightly longer than the CSS transition duration
  };

  // Function to decode HTML content from rich text editor
  const decodeContent = (content: string) => {
    if (!content) return '';
    
    try {
      // First try to parse if it's JSON
      const parsedContent = JSON.parse(content);
      if (parsedContent.blocks) {
        // Handle Draft.js content structure
        return parsedContent.blocks.map((block: any) => block.text).join('\n');
      }
      return content;
    } catch (e) {
      // If not JSON, return as is
      return content;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-3/4 bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 flex items-center justify-center opacity-0">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-3/4 bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        transitionProperty: 'transform, opacity',
        transitionDuration: '300ms'
      }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Answer Review</h2>
            <p className="text-gray-600">
              {respondentInfo.firstName} {respondentInfo.lastName} ({respondentInfo.email})
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <XMarkIcon />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">{error}</div>
        )}

        {!error && testResponseDetails.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No response details available
          </div>
        ) : (
          <ul className="space-y-6">
            {testResponseDetails.map((detail, index) => (
              <li 
                key={index} 
                className={`p-4 rounded-lg ${
                  detail.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {detail.isCorrect ? (
                    <CheckCircleIcon />
                  ) : (
                    <XCircleIcon />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-2">
                      Question {index + 1}:
                    </div>
                    <div className="mb-4 text-gray-700 whitespace-pre-wrap">
                      {decodeContent(detail.question)}
                    </div>
                    
                    <div className="font-semibold text-gray-800 mb-2">
                      Response:
                    </div>
                    <div className={`p-3 rounded ${
                      detail.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    } whitespace-pre-wrap`}>
                      {decodeContent(detail.answer)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnswersReviewPage;