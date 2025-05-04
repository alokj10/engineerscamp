'use client';

import Link from "next/link"
import { useEffect, useState } from "react"
import { AcademicCapIcon } from "../page"
import { usePathname, useRouter } from 'next/navigation'
import { atom, useAtom } from 'jotai'
import { currentTestConfigurationAtom, TestDefinitionAtom, TestQuestionMappingAtom } from '@/app/store/myTestAtom'
import { Toaster, toast } from "react-hot-toast"
import { checkAuth } from "../uiUtils"
import { useSession } from "next-auth/react";


export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession();

  return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    );
}