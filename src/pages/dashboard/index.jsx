import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminDashboard from './admin/Admin'
import UserDashboard from './user/UserPanel'


function Dashboard() {
  return (
    <>
    <Routes>
        {/* Jab user sirf /dashboard par aaye tab AdminDashboard show ho */}
        <Route index element={<AdminDashboard />} />
        <Route path='admindashboard' element={<AdminDashboard />} />
        <Route path='userDashboard' element={<UserDashboard />} />
    </Routes>
    </>
  )
}

export default Dashboard