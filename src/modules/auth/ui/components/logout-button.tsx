"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const LogoutButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Invalidate auth status query so UI knows user is logged out
      await queryClient.invalidateQueries({ queryKey: ["authStatus"] });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  );
};
