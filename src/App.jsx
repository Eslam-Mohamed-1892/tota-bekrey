import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './supabase'

import Header from './components/Header'
import Footer from './components/Footer'
import Products from './components/Products'
import Contact from './components/Contact'

import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'

export default function App() {
  const location = useLocation()

  const isAdmin = location.pathname === '/admin'
  const isAdminLogin = location.pathname === '/admin-login'

  const [products, setProducts] = useState([])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      setIsAdminLoggedIn(!!data.session)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const getProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        console.log('Error loading products:', error)
        return
      }

      console.log('Products from Supabase:', data)

      setProducts(data)
    }

    getProducts()
  }, [isAdminLoggedIn])

  return (
    <>
      {!isAdmin && !isAdminLogin && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={
            <Products
              products={products}
            />
          }
        />

        <Route path="/contact" element={<Contact />} />

        <Route
          path="/admin-login"
          element={
            <AdminLogin
              setIsAdminLoggedIn={setIsAdminLoggedIn}
            />
          }
        />

        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <Admin
                products={products}
                setProducts={setProducts}
              />
            ) : (
              <AdminLogin
                setIsAdminLoggedIn={setIsAdminLoggedIn}
              />
            )
          }
        />
      </Routes>

      {!isAdmin && !isAdminLogin && <Footer />}
    </>
  )
}