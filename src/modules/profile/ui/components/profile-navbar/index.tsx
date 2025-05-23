import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const ProfileNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#FBFBFB] flex items-center px-2 pr-5 z-50 border-b border-b-[#D9D9D9]">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <Link href="/">
            <div className="flex items-center gap-1">
              <ArrowLeftIcon className="mr-4" />
              <p className="text-xl font-semibold tracking-tight">Face scan</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}