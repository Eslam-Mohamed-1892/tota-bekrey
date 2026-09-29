import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { Toaster } from 'react-hot-toast'

import Header from './components/Header'
import Footer from './components/Footer'
import Contact from './components/Contact'

import Products from './pages/Products'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'

export default function App() {
	const location = useLocation()

	const isAdmin = location.pathname === '/admin'
	const isAdminLogin = location.pathname === '/admin-login'
	const isDashboard = location.pathname === '/dashboard'

	const [products, setProducts] = useState([])
	const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
	const [cart, setCart] = useState(() => {
		const savedCart = localStorage.getItem('cart')

		return savedCart ? JSON.parse(savedCart) : []
	})
	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cart))
	}, [cart])
	console.log("Cart:", cart)

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
			{!isAdmin && !isAdminLogin && !isDashboard && <Header cart={cart} />}

			<Routes>
				<Route
					path="/"
					element={<Home products={products} />}
				/>
				<Route
					path="/products"
					element={
						<Products
							products={products}
							setCart={setCart}
						/>}
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
				<Route
					path="/dashboard"
					element={
						isAdminLoggedIn ? (
							<Dashboard
								products={products}
								setProducts={setProducts}
							/>
						) : (
							<AdminLogin
								setIsAdminLoggedIn={setIsAdminLoggedIn}
							/>
						)
					}
				/><Route
					path="/cart"
					element={
						<Cart
							cart={cart}
							setCart={setCart}
						/>
					}
				/>
			</Routes>

			{!isAdmin && !isAdminLogin && !isDashboard && <Footer />}
			<Toaster position="top-center" />
		</>
	)
}