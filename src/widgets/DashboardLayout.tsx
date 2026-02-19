import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/widgets/AppSidebar";
import { Navbar } from "@/widgets/Navbar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
