import Image from "next/image";
import Link from "next/link";
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await  getServerSession();

  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="font-bold flex items-center">
                <span className="text-3xl" style={{ color: '#69a83e' }}>Engineers</span>
                <span className="text-2xl text-gray-800">Camp</span>
                <span className="inline-block ml-1" style={{ color: '#69a83e' }}>
                    <AcademicCapIcon/>                  
                </span>
              </div>
            </div>
            <div className="space-x-4">
              <Link href="/login">
                <button className="px-6 py-2 font-semibold hover:opacity-80" style={{ color: '#69a83e' }}>
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2 text-white font-semibold rounded-lg hover:opacity-90" style={{ backgroundColor: '#69a83e' }}>
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-white py-20" style={{ background: `linear-gradient(to right, #69a83e, #558432)` }}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Transform Assessment Experience</h1>
          <p className="text-xl mb-8">Comprehensive online examination platform for businesses, recruiters, and educators</p>
          <button className="text-white font-bold py-3 px-8 rounded-full text-lg hover:opacity-90" style={{ backgroundColor: '#558432' }}>
            Sign Up Free
          </button>
        </div>
      </header>
{/* Quick Quiz Access Section */}
<section className="py-16 bg-gradient-to-b from-white to-gray-50">
  <div className="container mx-auto px-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="w-full md:w-1/2 space-y-6">
        <h2 className="text-4xl font-bold leading-tight" style={{ color: '#69a83e' }}>
          Got an Access Code? <br/>
          Start Your Test Instantly!
        </h2>
        <p className="text-xl text-gray-700">
          No sign-up required! Enter your access code and begin your assessment right away. It's that simple.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/qz" className="inline-block">
            <button 
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: '#69a83e' }}
            >
              Enter Access Code
            </button>
          </Link>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">1</div>
              <p className="text-lg">Receive your unique access code</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">2</div>
              <p className="text-lg">Visit our quick access portal</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">3</div>
              <p className="text-lg">Start your test immediately!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#97e0b9' }}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16" style={{ color: '#316047' }}>Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#69a83e' }}>Employee Assessment</h3>
              <p>Evaluate employee skills and knowledge with comprehensive assessment tools</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#69a83e' }}>Technical Recruitment</h3>
              <p>Screen candidates effectively with customized technical assessments</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#69a83e' }}>Interactive Quizzes</h3>
              <p>Boost user engagement with interactive and dynamic quiz formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#69a83e' }}>Academic Excellence</h2>
            <p className="text-xl text-gray-600">Supporting students at all educational levels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4" style={{ color: '#69a83e' }}>Comprehensive Exams</h3>
              <ul className="space-y-4">
                <li>✓ School level assessments</li>
                <li>✓ College examinations</li>
                <li>✓ Professional certifications</li>
                <li>✓ Customized certificates</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4" style={{ color: '#69a83e' }}>Platform Benefits</h3>
              <ul className="space-y-4">
                <li>✓ Real-time results</li>
                <li>✓ Detailed analytics</li>
                <li>✓ Secure environment</li>
                <li>✓ 24/7 support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#97e0b9', color: '#316047' }}>
      {/* <section className="text-white py-20" style={{ backgroundColor: '#69a83e' }}> */}
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of organizations already using our platform</p>
          <button className="text-white font-bold py-3 px-8 rounded-full text-lg hover:opacity-90" style={{ backgroundColor: '#558432' }}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 EngineersCamp. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a 
                href="/privacy" 
                className="text-gray-600 hover:text-[#69a83e]"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-gray-600 hover:text-[#69a83e]"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AcademicCapIcon(){
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>

}

