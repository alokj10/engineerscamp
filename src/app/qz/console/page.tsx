'use client';

import { useEffect, useState } from 'react';
import { QzResponseAtom, QzSessionAtom } from '@/app/store/qzAtom';
import toast from 'react-hot-toast';
import { convertFromRaw, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { TestResponseStatus } from '@/app/Constants';


// Component to render Draft.js content
const RichTextRenderer = ({ contentRaw }: { contentRaw: string }) => {
  try {
    if (!contentRaw) return <span>No content available</span>;
    
    // Parse the raw content
    const contentState = convertFromRaw(JSON.parse(contentRaw));
    const editorState = EditorState.createWithContent(contentState);
    
    // Convert to HTML
    const html = stateToHTML(editorState.getCurrentContent());
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (error) {
    console.error('Error rendering rich text:', error);
    // Fallback to displaying raw text if parsing fails
    return <span>{contentRaw}</span>;
  }
};

export default function QuizConsole() {
  const [session, setSession] = useState<QzSessionAtom | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  // const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number[]}>({});
  const [selectedAnswers, setSelectedAnswers] = useState<QzResponseAtom | null>({
    testId: session?.testId || 0,
    respondentId: 1,
    status: TestResponseStatus.Pending,
    questionAnswers: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelection = (answerId: number) => {
    const currentDateTime = new Date().toISOString();
    const question = session?.questionAnswers[currentQuestionIndex];
    
    if (!question) return;
    
    const questionId = question.question.questionId;
    
    if(!selectedAnswers) {
      setSelectedAnswers({
        testId: session?.testId,
        respondentId: session?.respondentId || 0,
        status: TestResponseStatus.Pending,
        questionAnswers: []
      });
    }

    // Create a copy of the current state
    const updatedResponse: QzResponseAtom = { 
      ...selectedAnswers,
      testId: session?.testId,
      respondentId: session?.respondentId || 0,
      status: TestResponseStatus.Pending,
      questionAnswers: [...(selectedAnswers?.questionAnswers || [])]
    };
    
    // Find if we already have an answer for this question
    const existingAnswerIndex = updatedResponse.questionAnswers.findIndex(
      qa => qa.questionId === questionId
    );
    
    if (existingAnswerIndex >= 0) {
      // We already have an answer for this question
      const existingAnswer = updatedResponse.questionAnswers[existingAnswerIndex];
      
      if (question.question.type === 'Single Choice') {
        // For single choice, replace the answer
        updatedResponse.questionAnswers[existingAnswerIndex] = {
          ...existingAnswer,
          // answerOptionId: answerId,
          answerOptionIds: [answerId],
          answeredOn: currentDateTime
        };
      } else {
        // For multiple choice, toggle the answer
        const updatedAnswerIds = existingAnswer.answerOptionIds.includes(answerId)
          ? existingAnswer.answerOptionIds.filter(id => id !== answerId)
          : [...existingAnswer.answerOptionIds, answerId];
          
        updatedResponse.questionAnswers[existingAnswerIndex] = {
          ...existingAnswer,
          answerOptionIds: updatedAnswerIds,
          answeredOn: currentDateTime
        };
      }
    } else {
      // First answer for this question
      updatedResponse.questionAnswers.push({
        questionId: questionId,
        answerOptionIds: [answerId],
        answeredOn: currentDateTime
      });
    }
    
    setSelectedAnswers(updatedResponse);
  };

  const handleNavigation = async (direction: 'next' | 'prev') => {
    if (direction === 'next' && session?.testDurationMethod === 'perQuestion') {
      setQuestionStartTime(Date.now());
      setElapsedTime(0);
    }
    setCurrentQuestionIndex(prev => 
      direction === 'next' ? prev + 1 : prev - 1
    );

    if(direction === 'next') {
      await saveResponse();
    }
  };

  const fetchQuizData = async () => {
    try {
        setIsLoading(true);
      const response = await fetch('/api/qz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json() as QzSessionAtom;
      console.log('fetchquizdata');
      console.log(data);
      setSession(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
      toast.error('There is no response from the server at the moment.');
      setIsLoading(false);
    }
  };

  const saveResponse = async (isSubmitted = false) => {
    try {

      const updatedResponse: QzResponseAtom = { 
        ...selectedAnswers,
        testId: session?.testId || 0,
        respondentId: session?.respondentId || 0,
        status: isSubmitted ? TestResponseStatus.Submitted : TestResponseStatus.InProgress,
        questionAnswers: [...(selectedAnswers?.questionAnswers || [])]
      };
      setSelectedAnswers(updatedResponse);
      const response = await fetch('/api/qz/response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            QzSession: session,
            QzResponse: updatedResponse
          })
      });
      if (response.ok) {
        // alert(selectedAnswers?.status);
        if(selectedAnswers?.status  === TestResponseStatus.Submitted) {
          toast.success('Your answers have been submitted successfully.');
          setIsSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleSubmit = async () => {
    const updatedResponse: QzResponseAtom = { 
      ...selectedAnswers,
      testId: session?.testId || 0,
      respondentId: session?.respondentId || 0,
      status: TestResponseStatus.Submitted,
      questionAnswers: [...(selectedAnswers?.questionAnswers || [])]
    };
    setSelectedAnswers(updatedResponse);
    await saveResponse(true);
  };

  // console.log('quiz session', session);
  if (session === null || !session) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (isSubmitted) return (
    <div className="flex items-center justify-center min-h-screen text-2xl font-semibold text-gray-800">
      Thank you for taking the test!
    </div>
  );

  const currentQuestion = session.questionAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questionAnswers.length - 1;
  const timeLeft = session.testDurationMethod === 'complete'
    ? parseInt(session.testDurationForTest!) * 60 - elapsedTime
    : parseInt(session.testDurationForQuestion!) * 60 - elapsedTime;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm md:text-base text-gray-600">
              <span>Elapsed Time: {elapsedTime}s</span>
              {timeLeft > 0 && <span>Time Left: {timeLeft}s</span>}
            </div>
            <div className="flex gap-3">
              {session.testDurationMethod !== 'perQuestion' && currentQuestionIndex > 0 && (
                <button 
                  onClick={() => handleNavigation('prev')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Previous
                </button>
              )}
              {!isLastQuestion && (
                <button 
                  onClick={() => handleNavigation('next')}
                  className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            <div className="text-gray-700 text-base md:text-lg mb-3">
              <RichTextRenderer contentRaw={currentQuestion.question.question} />
            </div>
            <p className="text-sm text-gray-500 italic">
              {currentQuestion.question.type === 'Single Choice' 
                ? 'Select one correct answer'
                : 'You can select multiple correct answers'}
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion.answerOptions.map(answerOption => (
              <label 
                key={answerOption.answerOptionId} 
                className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type={currentQuestion.question.type === 'Single Choice' ? 'radio' : 'checkbox'}
                  checked={selectedAnswers[currentQuestionIndex]?.includes(answerOption.answerOptionId)}
                  onChange={() => handleAnswerSelection(answerOption.answerOptionId)}
                  name={`question-${currentQuestionIndex}`}
                  className="mr-3 h-4 w-4 text-blue-600 mt-1"
                />
                <div className="text-gray-700">
                  <RichTextRenderer contentRaw={answerOption.answer} />
                </div>
              </label>
            ))}
          </div>

          {isLastQuestion && (
            <button 
              onClick={handleSubmit}
              className="mt-8 w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
            >
              Submit Test
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
