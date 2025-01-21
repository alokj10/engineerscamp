'use client'
import Link from "next/link"
import { useState } from "react"
import { AcademicCapIcon } from "../page"
import { usePathname } from 'next/navigation'
import { atom, useAtom } from 'jotai'
import { currentTestConfigurationAtom, TestDefinitionAtom } from '@/app/store/myTestAtom'
import { Toaster, toast } from "react-hot-toast"


export default function TestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentTestConfiguration, setCurrentTestConfiguration] = useAtom(currentTestConfigurationAtom)
  // Modify the activation button click handler
const [isPopupOpen, setIsPopupOpen] = useState(false);
const [currentTestConfig] = useAtom(currentTestConfigurationAtom);

const handleActivateClick = async () => {
  setIsPopupOpen(true);
};

const handleConfirmActivation = async () => {
  try {
    const response = await fetch(`/api/mytests/${currentTestConfig.test.testId}/activation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentTestConfig),
    });

    if (!response.ok) throw new Error('Activation failed');

    toast.success('Test activated successfully');
    setIsPopupOpen(false);
  } catch (error) {
    toast.error('Failed to activate test');
  }
};
  const pathname = usePathname()
  
  const showSidebar = pathname !== '/mytests'

  const isOptionDisabled = (href: string) => {
    if (!currentTestConfiguration || currentTestConfiguration.test.testId === -1
    ) {
      return href !== '/mytests/settings'
    }
    return false
  }
  const isProgressItemDisabled = (currentTestConfiguration: TestDefinitionAtom | null) => {
    return !currentTestConfiguration || currentTestConfiguration.status !== 'Active'
  }

  

  const testConfigItems = [
    { icon: Cog6ToothIcon, label: "General Settings", href: "/mytests/settings" },
    { icon: QuestionMarkCircleIcon, label: "Questions Manager", href: "/mytests/questionsmanager" },
    { icon: UsersIcon, label: "Test Access", href: "/mytests/testaccess" },
    { icon: ArrowRightCircleIcon, label: "Test Start Page", href: "/mytests/start-page" },
    { icon: AcademicCapIcon, label: "Grading", href: "/mytests/grading" },
    { icon: ClockIcon, label: "Time Settings", href: "/mytests/timesettings" },
  ]

  const testProgressItems = [
    { icon: ComputerDesktopIcon, label: "Respondent Monitoring", href: "/mytests/monitoring" },
    { icon: ClipboardDocumentListIcon, label: "Results", href: "/mytests/results" },
    { icon: CheckBadgeIcon, label: "Answers Review", href: "/mytests/review" },
    { icon: ChartBarIcon, label: "Statistics", href: "/mytests/statistics" },
  ]
  const getCurrentPageTitle = () => {
    const currentItem = [...testConfigItems, ...testProgressItems].find(item => item.href === pathname)
    return currentItem?.label || 'My Tests'
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Toaster position="top-center" reverseOrder={false} />
      {showSidebar && (
        <header className="w-full bg-gray-50 border-b px-8 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">
              <span className="text-gray-600">{getCurrentPageTitle()}</span>
              <span className="mx-2">•</span>
              {currentTestConfiguration?.test?.name}
            </h1>
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {showSidebar && (
          <aside className="w-64 bg-gray-50 border-r p-6">
            <nav className="space-y-1">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Test Configuration</h3>
                {testConfigItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg 
                      ${pathname === item.href ? 'bg-gray-100' : ''}
                      ${isOptionDisabled(item.href) ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={handleActivateClick}
                  className={`w-full mt-4 py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200
                    ${isOptionDisabled('') || currentTestConfig.test.status === 'ACTIVE'
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  disabled={isOptionDisabled('') || currentTestConfig.test.status === 'ACTIVE'}
                >
                  <PlayIcon className="mr-3 h-5 w-5" />
                  <span>Activate Test</span>
                </button>

                <ActivationSummaryPopup 
                  isOpen={isPopupOpen}
                  onClose={() => setIsPopupOpen(false)}
                  onConfirm={handleConfirmActivation}
                  testConfig={currentTestConfig}
                />
              </div>
              <div className="h-px bg-gray-200 w-full my-4"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Test Progress & Results</h3>
                {testProgressItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg 
                      ${pathname === item.href ? 'bg-gray-100' : ''}
                      ${isProgressItemDisabled(currentTestConfiguration) ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              
            </nav>
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
export function Cog6ToothIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
}
export function QuestionMarkCircleIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
}
export function UsersIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
}
export function PlayIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
}
export function GraduationCapIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
}
export function ClockIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
}
export function ComputerDesktopIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
}
export function ClipboardDocumentListIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
}
export function CheckBadgeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>
}
export function ChartBarIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
}
export function PowerIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
}
export function ArrowRightCircleIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
}
export function InformationCircleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
}


// Add this component in the same file
const ActivationSummaryPopup = ({ isOpen, onClose, onConfirm, testConfig }) => {
  if (!isOpen) return null;

  const questionsByCategory = testConfig.questionAnswerDefinitions.reduce((acc, q) => {
    acc[q.question.category] = (acc[q.question.category] || 0) + 1;
    return acc;
  }, {});

  const questionsByType = testConfig.questionAnswerDefinitions.reduce((acc, q) => {
    acc[q.question.type] = (acc[q.question.type] || 0) + 1;
    return acc;
  }, {});

  const calculateEndDate = (period: string): string => {
    if (!period) return 'Not set';
    
    const now = new Date();
    const endDate = new Date(now);
    
    // Parse the period string (e.g., "2M 15d 8h 30min")
    const matches = period.match(/(\d+)(M|d|h|min)/g);
    
    if (matches) {
      matches.forEach(match => {
        const value = parseInt(match);
        const unit = match.replace(/\d+/g, '');
        
        switch (unit) {
          case 'M':
            endDate.setMonth(endDate.getMonth() + value);
            break;
          case 'd':
            endDate.setDate(endDate.getDate() + value);
            break;
          case 'h':
            endDate.setHours(endDate.getHours() + value);
            break;
          case 'min':
            endDate.setMinutes(endDate.getMinutes() + value);
            break;
        }
      });
    }
    
    return endDate.toLocaleString();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Test Activation Summary</h2>
        
        <div className="grid gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Test Details</h3>
            <p>Name: {testConfig.test.name}</p>
            <p>Category: {testConfig.test.category}</p>
            <p>Language: {testConfig.test.language}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Questions Summary</h3>
            <div className="mt-2">
              <h4 className="font-medium">Categories:</h4>
              {Object.entries(questionsByCategory).map(([category, count]) => (
                <p key={category}>{category}: {count}</p>
              ))}
            </div>
            <div className="mt-2">
              <h4 className="font-medium">Question Types:</h4>
              {Object.entries(questionsByType).map(([type, count]) => (
                <p key={type}>{type}: {count}</p>
              ))}
            </div>
            <p className="font-bold">Total Questions: {testConfig.questionAnswerDefinitions.length}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Test Configuration</h3>
            <p>Total Respondents: {testConfig.testRespondents.length}</p>
            <p>Passing Score: {testConfig.test.passingScore} {testConfig.test.passingScoreUnit}</p>
            <p>Active Period: {testConfig.test.manualActivationPeriod}</p>
            <p>Active Period: {testConfig.test.manualActivationPeriod} (Ends: {calculateEndDate(testConfig.test.manualActivationPeriod)})</p>

        </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Activate Test
          </button>
        </div>
      </div>
    </div>
  );
};