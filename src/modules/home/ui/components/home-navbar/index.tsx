"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { CreateClassButton } from "@/modules/class/ui/components/create/create-class-button";
import { JoinClassButton } from "@/modules/class/ui/components/join/join-class-button";
import { useEffect, useState } from "react";

type UserRole = "teacher" | "student" | null;

export const HomeNavbar = () => {
    const [role, setRole] = useState<UserRole>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/status");
                const data = await res.json();

                if (!data.isAuthenticated) {
                    setRole(null);
                    return;
                }

                setRole(data.user.role); // role should be 'teacher' or 'student'
            } catch (err) {
                setRole(null);
            }
        };

        fetchUser();
    }, []);

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

                <div className="flex items-center gap-4 ml-auto">
                    {/* Student sees JoinClassButton */}
                    {role === "student" && (
                        <div className="flex-shrink-0 items-center flex gap-4">
                            <JoinClassButton />
                        </div>
                    )}

                    {/* Teacher sees CreateClassButton */}
                    {role === "teacher" && (
                        <div className="flex-shrink-0 items-center flex gap-4 ml-auto">
                            <CreateClassButton />
                        </div>
                    )}

                    {/* Everyone sees AuthButton */}
                    <div className="flex-shrink-0 items-center flex gap-4">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};
