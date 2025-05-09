"use client";

import { Button } from "@/components/ui/button"
import { UserCircleIcon } from "lucide-react"
import Link from "next/link";


export const ProfileButton = () => {
  return (
    <div>
      <Button
        onClick={() => { }}
        variant="outline"
        className="md:flex items-center gap-2 rounded-2xl">
        <Link href="/profile" className="flex items-center gap-4">
          <UserCircleIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}