import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { Toaster } from 'react-hot-toast'

import Header from './components/Header'
import Footer from './components/Footer'
import Contact from './components/Contact'
import UserAccount from './components/UserAccount'
import Account from './components/Account'

import Products from './pages/Products'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'

export default function App() {
	const location = useLocation()
	const [user, setUser] = useState(null)
	const isAdmin = location.pathname === '/admin'
	const isAdminLogin = location.pathname === '/admin-login'
	const isDashboard = location.pathname === '/dashboard'

	const [products, setProducts] = useState([])
	const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

	const [settings, setSettings] = useState({
		whatsapp: '',
		location: '',
		facebook_url: '',
	})

	const [cart, setCart] = useState(() => {
		const savedCart = localStorage.getItem('cart')

		return savedCart ? JSON.parse(savedCart) : []
	})

	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cart))
	}, [cart])

	console.log("Cart:", cart)

	useEffect(() => {
		const loadUser = async (authUser) => {
			if (!authUser) {
				setUser(null)
				return
			}

			const { data: profile, error } = await supabase
				.from('profiles')
				.select('username')
				.eq('id', authUser.id)
				.single()

			if (error) {
				console.log('Profile error:', error)
				setUser({
					id: authUser.id,
					email: authUser.email,
					username: null,
				})
				return
			}

			setUser({
				id: authUser.id,
				email: authUser.email,
				username: profile?.username || '',
			})
		}

		const checkSession = async () => {
			const { data, error } = await supabase.auth.getSession()

			if (error) {
				console.log('Session error:', error)
				return
			}

			await loadUser(data.session?.user || null)
		}

		checkSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			await loadUser(session?.user || null)
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

	useEffect(() => {
		const getSettings = async () => {
			const { data, error } = await supabase
				.from('settings')
				.select('whatsapp, location, facebook_url')
				.eq('id', 1)
				.single()

			if (error) {
				console.log('Error loading settings:', error)
				return
			}

			setSettings({
				whatsapp: data.whatsapp || '',
				location: data.location || '',
				facebook_url: data.facebook_url || '',
			})
		}

		getSettings()
	}, [])
	const [isUserAccountOpen, setIsUserAccountOpen] = useState(false)

	return (
		<>
			{!isAdmin && !isAdminLogin && !isDashboard && (
				<Header
					cart={cart}
					user={user}
					setIsUserAccountOpen={setIsUserAccountOpen}
				/>
			)}
			<UserAccount
				isOpen={isUserAccountOpen}
				setIsOpen={setIsUserAccountOpen}
			/>

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
						/>
					}
				/>

				<Route
					path="/contact"
					element={<Contact />}
				/>

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
				/>

				<Route
					path="/cart"
					element={
						<Cart
							cart={cart}
							setCart={setCart}
						/>
					}
				/>
				<Route path="/account" element={<Account />} />
			</Routes>

			{!isAdmin && !isAdminLogin && !isDashboard && (
				<Footer settings={settings} />
			)}

			<Toaster position="top-center" />
		</>
	)
}