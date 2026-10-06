import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { adminSupabase } from '../supabase'

import logo from '../assets/images/logo3.jpeg'

import { toast } from 'react-hot-toast'

export default function AdminLogin({ setIsAdminLoggedIn }) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {

    const { data, error } = await adminSupabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    if (data.user) {

      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        await adminSupabase.auth.signOut()
        toast.error('هذا الحساب ليس حساب إدارة')
        return
      }

      setIsAdminLoggedIn(true)
      navigate('/dashboard')

      toast.success('تم تسجيل الدخول بنجاح')
    }
  }

  const handleForgotPassword = async () => {

    if (!forgotEmail.trim()) {
      toast.error('أدخل البريد الإلكتروني')
      return
    }

    setForgotLoading(true)

    const { error } = await adminSupabase.auth.resetPasswordForEmail(
      forgotEmail.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    setForgotLoading(false)

    if (error) {
      console.log('Admin reset password error:', error)
      toast.error('تعذر إرسال رسالة استعادة كلمة المرور')
      return
    }

    toast.success('تم إرسال رسالة استعادة كلمة المرور إلى بريدك الإلكتروني')
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

        {/* Forgot Password */}

        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="block mt-3 text-sm text-[#5A3825] hover:underline"
        >
          نسيت كلمة المرور؟
        </button>

        {/* Login */}

        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-[#5A3825] text-white py-2.5 rounded-md active:bg-[#3F271A]"
        >
          دخول
        </button>

      </div>

      {/* Forgot Password Modal */}

      {showForgotPassword && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">

          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold text-[#2E1B12]">
                استعادة كلمة المرور
              </h2>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-500 text-xl"
              >
                ×
              </button>

            </div>

            <p className="text-sm text-gray-600 mb-4">
              أدخل البريد الإلكتروني الخاص بحساب الإدارة لإرسال رسالة استعادة كلمة المرور.
            </p>

            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="w-full mt-4 bg-[#5A3825] text-white py-2.5 rounded-md active:bg-[#3F271A] disabled:opacity-60"
            >
              {forgotLoading
                ? 'جاري الإرسال...'
                : 'إرسال رسالة الاستعادة'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full mt-2 border border-[#D8C9BC] text-[#5A3825] py-2.5 rounded-md"
            >
              إلغاء
            </button>

          </div>

        </div>

      )}

    </main>
  )
}