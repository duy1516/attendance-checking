import { SidebarProvider } from "@/components/ui/sidebar";
import { ProfileNavbar } from "../components/profile-navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
};

export const ProfileLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <ProfileNavbar />
        <div className="flex min-h-screen pt-[4rem]">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};