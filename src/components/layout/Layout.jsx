import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import TabNav from './TabNav'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-twitter-background">
      <Header />
      
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Desktop */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-56px)] bg-white border-x border-twitter-extraLightGray">
          <Outlet />
        </main>

        
      </div>

      {/* Bottom Navigation - Mobile */}
      <TabNav />
      
      {/* Spacer for bottom nav */}
      <div className="h-14 md:hidden" />
    </div>
  )
}
