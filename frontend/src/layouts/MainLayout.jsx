import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F4F5] font-['Inter']">
      <Navbar onMenuToggle={toggleSidebar} />
      
      <Sidebar isOpen={mobileSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="md:ml-[220px] pt-[64px] min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
