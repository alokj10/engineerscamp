'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicCapIcon } from '../page';
import toast from 'react-hot-toast';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!acceptTerms) {
      setErrors(prev => ({...prev, terms: 'You must accept the terms and conditions'}));
      return;
    }

    try {
      const validatedData = signupSchema.parse({ email, password, confirmPassword });
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: validatedData.email, password: validatedData.password }),
      });

      if(!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      
      setIsRegistered(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      toast.error(error instanceof Error ? error.message : 'Registration failed!');
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f3f4f2' }}>
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-6">
            <div className="font-bold flex items-center">
              <span className="text-3xl" style={{ color: '#69a83e' }}>Engineers</span>
              <span className="text-2xl text-gray-800">Camp</span>
              <span className="inline-block ml-1" style={{ color: '#69a83e' }}>
                <AcademicCapIcon/>
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
            <p className="text-gray-600">
              Thank you for registering. We have sent an activation link to your email address.
            </p>
            <p className="text-gray-600">
              Please check your inbox and click on the activation link to complete your registration.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="mt-6 text-left text-3xl font-extrabold text-gray-900">Sign up</h2>
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
                required
                className={`appearance-none relative block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#69a83e] focus:border-[#69a83e] focus:z-10 text-base mb-4`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#69a83e] focus:border-[#69a83e] focus:z-10 text-base`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#69a83e] focus:border-[#69a83e] focus:z-10 text-base`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              required
              className={`h-4 w-4 text-[#69a83e] focus:ring-[#69a83e] border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''}`}
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
              I accept the{' '}
              <Link href="/terms" className="font-medium" style={{ color: '#69a83e' }}>
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-medium" style={{ color: '#69a83e' }}>
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: '#69a83e' }}
            >
              Create Account
            </button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#69a83e' }}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}