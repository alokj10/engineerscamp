'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const [step, setStep] = useState(1)
  const [accessCode, setAccessCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter();

  const isEmailValid = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }

  const handleSubmit = async () => {
    try {
      // const response = await fetch('/api/qz', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     accessCode,
      //     firstName,
      //     lastName,
      //     email,
      //   }),
      // })

      const result = await signIn('credentials', {
        credentialType: 'respondent',
        email,
        firstName,
        lastName,
        accessCode,
        redirect: false,
      }, {
        callbackUrl: '/qz',
      });
      console.log('respondent signIn result', result);
      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // alert('Invalid respondent credentials ' + result?.error );
        // console.log('respondent signIn notok', result);
        toast.error(`${result?.error}`)
      }
    } catch (error) {
      console.log('respondent signIn error', error);
      toast.error('Something went wrong. Please try again.')
    }
  }

  const inputClasses = `
    mt-1 block w-full 
    rounded-md border-2 border-gray-300 
    shadow-sm focus:border-green-500 focus:ring-green-500 
    text-lg py-3 px-4
    bg-gray-50 hover:bg-gray-100
    transition-colors duration-200
  `  
  const buttonClasses = "w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
  const secondaryButtonClasses = "flex-1 py-3 px-6 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')} 
              className="text-gray-600 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="font-bold flex items-center absolute left-1/2 transform -translate-x-1/2">
              <span className="text-3xl" style={{ color: '#69a83e' }}>Engineers</span>
              <span className="text-2xl text-gray-800">Camp</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Start Test</h2>
          <p className="mt-2 text-gray-600 text-lg">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-lg font-medium text-gray-700">
                Access Code
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className={inputClasses}
                placeholder="Enter access code"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!accessCode}
              className={buttonClasses}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-lg font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-lg font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className={secondaryButtonClasses}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!firstName || !lastName || !email || !isEmailValid(email)}
                className={buttonClasses}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
