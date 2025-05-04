"use client";

import { Button } from "@/components/ui/button"
import { UserCircleIcon } from "lucide-react"
import Link from "next/link";


export const AuthButton = () => {
  return (
    <div>
      <Button
        onClick={() => { }}
        variant="outline"
        className="md:flex items-center gap-2 rounded-2xl">
        <Link href="/sign-in" className="flex items-center gap-4">
          <UserCircleIcon className="h-4 w-4" />
          <p>Login</p>
        </Link>
      </Button>
    </div>
  )
}