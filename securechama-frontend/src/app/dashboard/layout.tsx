import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
