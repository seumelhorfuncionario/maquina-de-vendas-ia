import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Sidebar />
      <main className="ml-[260px] p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  )
}
