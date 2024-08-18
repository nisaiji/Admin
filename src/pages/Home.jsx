import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <>
    <Navbar/>
    <Outlet/> 
    {/* <Footer/>      */}
    </>
  )
}
