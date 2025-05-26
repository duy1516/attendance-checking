"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

type ClassItem = {
  id: string;
  className: string;
  classLink: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const useCurrentUser = () =>
  useQuery<User>({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (!res.ok || !data.isAuthenticated) {
        throw new Error("Not authenticated");
      }
      return data.user;
    },
    staleTime: 0,
  });

const useClassList = (userId: string) =>
  useQuery<ClassItem[]>({
    queryKey: ["classes", userId],
    queryFn: async () => {
      const res = await fetch("/api/class/list");
      if (!res.ok) throw new Error("Failed to fetch class list");
      const data = await res.json();
      return data.classes || [];
    },
    enabled: !!userId,
  });

export const ClassList = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const {
    data: classes = [],
    isLoading: classLoading,
  } = useClassList(user?.id || "");

  if (userLoading || classLoading || classes.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {classes.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton tooltip={item.className} asChild isActive={false}>
                <Link href={`/class/${item.id}`} className="flex items-center gap-4">
                  <BookIcon className="h-6 w-6" />
                  <span className="text-black text-base">{item.className}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
