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
  classLink: string;
};

export const ClassList = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/class/list");
        const data = await res.json();
        setClasses(data.classes); // expects { classes: [...] }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    fetchClasses();
  }, []);

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
