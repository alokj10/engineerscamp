
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { AcademicCapIcon } from '../page';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    alert(result?.error);
    if (result?.ok) {
      router.push('/dashboard');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f3f4f2' }}>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <div className="font-bold flex items-center">
              <span className="text-3xl" style={{ color: '#69a83e' }}>Engineers</span>
              <span className="text-2xl text-gray-800">Camp</span>
              <span className="inline-block ml-1" style={{ color: '#69a83e' }}>
                    <AcademicCapIcon/>
              </span>
            </div>
          </div>
          <h2 className="mt-6 text-left text-3xl font-extrabold text-gray-900">Sign in</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#69a83e] focus:border-[#69a83e] focus:z-10 text-base mb-4"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#69a83e] focus:border-[#69a83e] focus:z-10 text-base"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#69a83e] focus:ring-[#69a83e] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium" style={{ color: '#69a83e' }}>
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-md font-bold rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: '#69a83e' }}
            >
              Sign in
            </button>
          </div>
        </form>
        
        {/* Add this section after the form */}
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium" style={{ color: '#69a83e' }}>
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  )
}