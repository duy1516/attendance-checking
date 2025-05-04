import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { ClassList } from "./class-list"

export const HomeSidebar = () => {
    return (
        <Sidebar className="pt-16 z-40 border-b border-b-[#D9D9D9]" collapsible="icon">
            <SidebarContent className="bg-background">
                <div>
                    <ClassList />
                </div>
            </SidebarContent>
        </Sidebar>
    )
}