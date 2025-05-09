import { ProfileLayout } from "@/modules/profile/ui/layouts/profile-layout";


interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <ProfileLayout>
      {children}
    </ProfileLayout>
  );
};

export default Layout;