import React from 'react'
import DashboardSidebar from './Components/DashboardSidebar'
import FloatingNav from '@/components/ui/FloatingNav'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='bg-white min-h-screen flex flex-col'>
            <FloatingNav />
            <div className='flex pr-4 flex-1'>
                <DashboardSidebar />
                <div className='w-full pt-28'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default layout