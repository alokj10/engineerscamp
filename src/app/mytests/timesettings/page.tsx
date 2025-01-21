'use client'
import { useState } from 'react'
import { add } from 'date-fns'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAtom } from 'jotai'
import { currentTestConfigurationAtom, TestQuestionMappingAtom } from '@/app/store/myTestAtom'
import { InformationCircleIcon } from '../layout'

const TimeSettingsSchema = z.object({
  durationOption: z.enum(['complete', 'perQuestion']),
  hours: z.number(),
  minutes: z.number(),
  activationOption: z.enum(['manual', 'scheduled']),
  manualDuration: z.object({
    months: z.number(),
    days: z.number(),
    hours: z.number(),
    minutes: z.number()
  }),
  activationStartTime: z.string(),
  activationEndTime: z.string()
}).refine((data) => {
  if (data.durationOption === 'complete') {
    return (data.hours * 60 + data.minutes) >= 15
  }
  return (data.hours * 60 + data.minutes) >= 1
}, {
  message: 'Minimum duration required: 15 minutes for complete test, 1 minute per question'
}).refine((data) => {
  if (data.activationOption === 'manual') {
    const totalMinutes = data.manualDuration.months * 43200 + 
                        data.manualDuration.days * 1440 + 
                        data.manualDuration.hours * 60 + 
                        data.manualDuration.minutes
    return totalMinutes >= 30
  }
  let startTime = new Date(data.activationStartTime), 
  validStartTime = add(new Date(), { minutes: 5 })
  console.log(`Start Time: ${startTime}, Valid Start Time: ${validStartTime}`)
  return startTime > validStartTime
}, {
  message: `Invalid activation time settings: Start Time:`
})

export default function TimeSettings() {
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)
  const [durationOption, setDurationOption] = useState(currentTestConfiguration.test.testDurationMethod || 'complete')

  const parseDuration = (duration?: string) => {
    if (!duration) return { hours: 0, minutes: 0 }
    const [hours, minutes] = duration.split(':').map(Number)
    return { hours, minutes }
  }

  const testDuration = currentTestConfiguration.test.testDurationForTest || 
                      currentTestConfiguration.test.testDurationForQuestion
  const { hours: initialHours, minutes: initialMinutes } = parseDuration(testDuration)

  const [durationHours, setDurationHours] = useState(initialHours)
  const [durationMinutes, setDurationMinutes] = useState(initialMinutes)

  const parseManualPeriod = (period?: string) => {
    if (!period) return { months: 12, days: 0, hours: 0, minutes: 0 }
    const matches = period.match(/(\d+)M\s+(\d+)d\s+(\d+)h\s+(\d+)min/)
    if (!matches) return { months: 12, days: 0, hours: 0, minutes: 0 }
    return {
      months: parseInt(matches[1]),
      days: parseInt(matches[2]),
      hours: parseInt(matches[3]),
      minutes: parseInt(matches[4])
    }
  }

  const [activationOption, setActivationOption] = useState(currentTestConfiguration.test.testActivationMethod || 'manual')

  const manualPeriod = parseManualPeriod(currentTestConfiguration.test.manualActivationPeriod)
  const [months, setMonths] = useState(manualPeriod.months)
  const [days, setDays] = useState(manualPeriod.days)
  const [hours, setHours] = useState(manualPeriod.hours)
  const [minutes, setMinutes] = useState(manualPeriod.minutes)

  const [activationStartTime, setActivationStartTime] = useState<string>(
    new Date(currentTestConfiguration.test.scheduledActivationStartsOn || new Date()).toISOString().slice(0, 16) || 
    new Date(add(new Date(), { minutes: 5 })).toISOString().slice(0, 16)
  )

  const [activationEndTime, setActivationEndTime] = useState<string>(
    new Date(currentTestConfiguration.test.scheduledActivationEndsOn || new Date()).toISOString().slice(0, 16) || 
    new Date(add(new Date(), { days: 30, minutes: 5 })).toISOString().slice(0, 16)
  )

  const handleSave = async () => {
    try {
      const formData = {
        durationOption,
        hours: durationHours,
        minutes: durationMinutes,
        activationOption,
        manualDuration: {
          months,
          days,
          hours,
          minutes
        },
        activationStartTime: activationStartTime,
        activationEndTime: activationEndTime
      }

      TimeSettingsSchema.parse(formData)

      const getDuration = (hrs: number, mins: number): string => {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      }

      const updatedConfig: TestQuestionMappingAtom = {
        ...currentTestConfiguration,
        test: {
          ...currentTestConfiguration.test,
          testDurationMethod: durationOption,
          testDurationForTest: durationOption === 'complete' ? getDuration(durationHours, durationMinutes) : undefined,
          testDurationForQuestion: durationOption === 'perQuestion' ? getDuration(durationHours, durationMinutes) : undefined,
          testActivationMethod: activationOption,
          manualActivationPeriod: activationOption === 'manual' ? `${months}M ${days}d ${hours}h ${minutes}min` : undefined,
          scheduledActivationStartsOn: activationOption === 'scheduled' ? activationStartTime : undefined,
          scheduledActivationEndsOn: activationOption === 'scheduled' ? activationEndTime : undefined
        }
      }

      const response = await fetch(`/api/mytests/${currentTestConfiguration.test.testId}/timesettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      })

      if (!response.ok) throw new Error('Failed to save time settings')

      setCurrentTestConfiguration(updatedConfig)
      toast.success('Time settings saved successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error('Failed to save time settings')
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Test Duration</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="duration"
              value="complete"
              checked={durationOption === 'complete'}
              onChange={(e) => setDurationOption(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span>Time to complete the test</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="duration"
              value="perQuestion"
              checked={durationOption === 'perQuestion'}
              onChange={(e) => setDurationOption(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span>Time limit for each question</span>
          </label>
          
          <div className="ml-6 flex items-center space-x-4">
            <select 
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[...Array(24)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')} hrs</option>
              ))}
            </select>

            <select 
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')} mins</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Activation Method</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="activation"
              value="manual"
              checked={activationOption === 'manual'}
              onChange={(e) => setActivationOption(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span>Manual Test Activation</span>
          </label>
          {activationOption === 'manual' && (
            <div className="ml-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md flex items-start">
                <span className="h-8 w-8 text-green-800 mr-5 mt-0.5">
                    <InformationCircleIcon  />
                </span>
                <p className="text-gray-700">
                  In the Test Configuration menu, click on Activate Test button to allow respondents to access the test only in the timeframe specified below
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span>Test Ends In</span>
                <select 
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="p-2 border rounded"
                >
                  {[...Array(13)].map((_, i) => (
                    <option key={i} value={i}>{i} months</option>
                  ))}
                </select>

                <select 
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="p-2 border rounded"
                >
                  {[...Array(32)].map((_, i) => (
                    <option key={i} value={i}>{i} days</option>
                  ))}
                </select>

                <select 
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="p-2 border rounded"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>{i} hrs</option>
                  ))}
                </select>

                <select 
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="p-2 border rounded"
                >
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={i}>{i} mins</option>
                  ))}
                </select>
                <span>after activation</span>
              </div>
            </div>
          )}
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="activation"
              value="scheduled"
              checked={activationOption === 'scheduled'}
              onChange={(e) => setActivationOption(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span>Activation Per Set Time Period</span>
          </label>

          {activationOption === 'scheduled' && (
            <div className="ml-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md flex items-start">
                <span className="h-8 w-8 text-green-800 mr-5 mt-0.5">
                    <InformationCircleIcon  />
                </span>
                
                <p className="text-gray-700">
                  Test will be automatically activated on time specified below so that respondents can access the test only in the timeframe specified below
                </p>
              </div>
              <div>
                <label>Starts On</label>
                <input
                type="datetime-local"
                value={activationStartTime}
                min={new Date(add(new Date(), { minutes: 5 })).toISOString().slice(0, 16)}
                onChange={(e) => setActivationStartTime(e.target.value)}
                className="ml-6 p-2 border rounded"
              />
              </div>
              <div>
              <label>Ends On</label>
              <input
                type="datetime-local"
                value={activationEndTime}
                min={new Date(add(new Date(), { days: 5 })).toISOString().slice(0, 16)}
                onChange={(e) => setActivationEndTime(e.target.value)}
                className="ml-8 p-2 border rounded"
              />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
