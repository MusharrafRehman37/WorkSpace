import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './landingPage/Index'

function Frontend() {
  return (
    <>
    <Routes>
        <Route path='/' element={<LandingPage />} />
    </Routes>
    </>
  )
}

export default Frontend