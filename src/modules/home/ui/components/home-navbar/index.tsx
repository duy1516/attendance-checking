import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { CreateClassButton } from "@/modules/class/ui/components/create-class-button";

export const HomeNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#FBFBFB] flex items-center px-2 pr-5 z-50 border-b border-b-[#D9D9D9]">
            <div className="flex items-center gap-4 w-full">
                <div className="flex items-center flex-shrink-0">
                    <SidebarTrigger />
                    <Link href="/">
                        <div className="p-4 flex items-center gap-1">
                            <p className="text-xl font-semibold tracking-tight">Face scan</p>
                        </div>
                    </Link>
                </div>
                <div className="flex-shrink-0 items-center flex gap-4 ml-auto">
                    <CreateClassButton />
                </div>
                <div className="flex-shrink-0 items-center flex gap-4">
                    <AuthButton />
                </div>
            </div>
        </nav>
    )
}