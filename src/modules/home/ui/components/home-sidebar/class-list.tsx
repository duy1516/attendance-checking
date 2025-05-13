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
import { useEffect, useState } from "react";

type ClassItem = {
  id: string;
  className: string;
  classLink: string | null;
};

export const ClassList = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/class/list");
        if (!res.ok) {
          // Unauthorized or other error - treat as logged out
          setClasses([]);
        } else {
          const data = await res.json();
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading || classes.length === 0) {
    return null; // Don't render anything
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {classes.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.className}
                asChild
                isActive={false}
                onClick={() => { }}>
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
