'use client'
import { useEffect, useState } from 'react'
import { TestRespondentAtom } from '@/app/store/myTestAtom'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAtom } from 'jotai'
import { currentTestConfigurationAtom } from '@/app/store/myTestAtom'
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/uiUtils'

const emailSchema = z.string().email('Invalid email format')
const respondentsSchema = z.array(z.object({
  email: z.string().email()
})).max(20, 'Maximum 20 respondents allowed')

export default function TestAccess() {
  const [email, setEmail] = useState('')
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)
  const router = useRouter()
  useEffect(() => {
    checkAuth(router)
  }, [router])

  const addRespondent = () => {
    try {
      emailSchema.parse(email)
      
      if (currentTestConfiguration.testRespondents?.some(r => r.email === email)) {
        toast.error('This email is already added')
        return
      }

      const newRespondent: TestRespondentAtom = {
        respondentId: 0,
        firstName: '',
        lastName: '',
        email: email,
        testId: currentTestConfiguration.test.testId || 0,
        accessCode: ''
      }

      const updatedRespondents = [...(currentTestConfiguration.testRespondents || []), newRespondent]
      respondentsSchema.parse(updatedRespondents)
      
      setCurrentTestConfiguration({
        ...currentTestConfiguration,
        testRespondents: updatedRespondents
      })
      
      setEmail('')
      toast.success('Respondent added successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      }
    }
  }

  const removeRespondent = (email: string) => {
    const updatedRespondents = currentTestConfiguration.testRespondents?.filter(r => r.email !== email) || []
    setCurrentTestConfiguration({
      ...currentTestConfiguration,
      testRespondents: updatedRespondents
    })
    toast.success('Respondent removed')
  }

  const handleSubmit = async () => {
    try {
      respondentsSchema.parse(currentTestConfiguration.testRespondents)
      
      const response = await fetch('/api/mytests/respondents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTestConfiguration),
      })

      if (response.ok) {
        const { data } = await response.json()
        setCurrentTestConfiguration(data)
        toast.success('Test configuration saved successfully')
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error('Error saving configuration')
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-blue-50 border-l-4 border-gray-400 p-4 mb-6">
        <p className="text-gray-700">
          Respondents can take the test using Access Code. 
          <br></br>Add email ids of respondents and submit so that access codes will be sent to the respective email ids when test is activated.
        </p>
      </div>

      <h1 className="text-2xl font-bold mb-6">Manage Test Respondents</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addRespondent}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Respondent
        </button>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Access Code</th>
              <th className="border p-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTestConfiguration.testRespondents?.map((respondent, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="border p-2">{respondent.email}</td>
                <td className="border p-2">{respondent.accessCode || 'Pending'}</td>
                <td className="border p-2 text-right">
                  <button
                    onClick={() => removeRespondent(respondent.email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentTestConfiguration.testRespondents?.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Submit and Send Codes
          </button>
        </div>
      )}
    </div>
  )
}
