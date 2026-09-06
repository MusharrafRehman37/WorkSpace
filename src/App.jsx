import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Frontend from './pages/frontend/Index'
import './App.css'
import AuthPage from './pages/auth/Auth'
import Dashboard from './pages/dashboard'

function App() {
  return (
    <>
    <Routes>
      <Route path='/*' element={<Frontend />} />
      <Route path='/auth/*' element={<AuthPage />} />
      <Route path='/dashboard/*' element={<Dashboard />} />
    </Routes>
    </>
  )
}

export default App