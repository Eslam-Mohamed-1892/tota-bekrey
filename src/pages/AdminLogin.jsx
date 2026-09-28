import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import logo from '../assets/images/logo3.jpeg'

export default function AdminLogin({ setIsAdminLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    if (data.user) {
      setIsAdminLoggedIn(true)
      navigate('/dashboard')
    }
  }

  return (
    <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 flex items-center justify-center px-5">

      <div className="bg-white w-full max-w-md rounded-xl p-6">

        <div className="w-50 h-50 lg:w-full lg:h-full rounded-full lg:rounded-2xl overflow-hidden mx-auto mb-4">
          <img
            src={logo}
            alt="مخبوزات توتا"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-[#5A3825] font-medium mb-2">
          مخبوزات توتا
        </p>

        <h1 className="text-2xl font-bold text-[#2E1B12]">
          دخول الإدارة
        </h1>
        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          className="w-full mt-6 border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full mt-4 border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-[#5A3825] text-white py-2.5 rounded-md active:bg-[#3F271A]"
        >
          دخول
        </button>

      </div>

    </main>
  )
}