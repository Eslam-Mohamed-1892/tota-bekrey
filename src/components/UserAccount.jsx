import { useState } from 'react'
import { supabase } from '../supabase'
import { FiX, FiLogIn, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi'
export default function UserAccount({ isOpen, setIsOpen }) {

    const [mode, setMode] = useState('choice')
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.log('Login error:', error.message)
            return
        }

        console.log('Logged in user:', data.user)
    }
    const handleRegister = async () => {
        console.log('REGISTER:', {
            username,
            email,
        })

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username.trim(),
                },
            },
        })

        if (error) {
            console.log('Register error:', error.message)
            return
        }

        console.log('Registered user:', data.user)
        console.log('Session after register:', data.session)

        if (!data.session) {
            alert(
                'تم إنشاء الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني من الرسالة المرسلة إليك، ثم تسجيل الدخول.'
            )
            return
        }

        console.log('Registration and login successful')
    }
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-2xl p-6 relative">

                {/* Close */}
                <button
                    onClick={() => {
                        setIsOpen(false)
                        setMode('choice')
                    }}
                    className="absolute top-4 left-4 text-gray-500 hover:text-[#5A3825] text-xl"
                >
                    <FiX />
                </button>
                {/* Title */}
                <div className="text-center mb-8">

                    <h2 className="text-2xl font-bold text-[#5A3825]">

                        {mode === 'choice' && 'حسابك'}

                        {mode === 'login' && 'تسجيل الدخول'}

                        {mode === 'register' && 'إنشاء حساب'}

                    </h2>

                    {mode === 'choice' && (
                        <p className="text-gray-500 mt-2">
                            اختر الطريقة المناسبة للمتابعة
                        </p>
                    )}

                </div>
                {/* Choice */}
                {mode === 'choice' && (

                    <div className="space-y-4">

                        {/* Login */}
                        <button
                            onClick={() => setMode('login')}
                            className="w-full flex items-center justify-center gap-3 border border-[#5A3825] text-[#5A3825] rounded-xl py-3 hover:bg-[#5A3825] hover:text-white transition"
                        >
                            <FiLogIn />

                            <span>
                                لديك حساب؟ تسجيل الدخول
                            </span>
                        </button>

                        {/* Register */}
                        <button
                            onClick={() => setMode('register')}
                            className="w-full flex items-center justify-center gap-3 bg-[#5A3825] text-white rounded-xl py-3 hover:bg-[#4a2e20] transition"
                        >
                            <FiUserPlus />

                            <span>
                                إنشاء حساب
                            </span>
                        </button>

                    </div>

                )}
                {mode === 'login' && (

                    <div className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-[#5A3825] mb-2">
                                البريد الإلكتروني
                            </label>

                            <input
                                type="email"
                                placeholder="example@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-[#5A3825] mb-2">
                                كلمة المرور
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#5A3825]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5A3825]"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>

                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-[#5A3825] text-white rounded-xl py-3 hover:bg-[#4a2e20] transition"
                        >
                            تسجيل الدخول
                        </button>
                        {/* Register */}
                        <p className="text-center text-sm text-gray-500">

                            ليس لديك حساب؟

                            <button
                                onClick={() => setMode('register')}
                                className="text-[#5A3825] font-semibold mr-1"
                            >
                                إنشاء حساب
                            </button>

                        </p>

                        {/* Back */}
                        <button
                            onClick={() => setMode('choice')}
                            className="w-full text-sm text-gray-500 hover:text-[#5A3825]"
                        >
                            العودة
                        </button>

                    </div>

                )}

                {mode === 'register' && (

                    <div className="space-y-5">

                        {/* Username */}
                        <div>
                            <label className="block text-sm text-[#5A3825] mb-2">
                                اسم المستخدم
                            </label>

                            <input
                                type="text"
                                placeholder="اسم المستخدم"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-[#5A3825] mb-2">
                                البريد الإلكتروني
                            </label>

                            <input
                                type="email"
                                placeholder="example@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-[#5A3825] mb-2">
                                كلمة المرور
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#5A3825]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5A3825]"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>

                            </div>                        </div>

                        {/* Register Button */}
                        <button
                            onClick={handleRegister}
                            className="w-full bg-[#5A3825] text-white rounded-xl py-3 hover:bg-[#4a2e20] transition"
                        >
                            إنشاء الحساب
                        </button>
                        {/* Login */}
                        <p className="text-center text-sm text-gray-500">

                            لديك حساب بالفعل؟

                            <button
                                onClick={() => setMode('login')}
                                className="text-[#5A3825] font-semibold mr-1"
                            >
                                تسجيل الدخول
                            </button>

                        </p>

                        {/* Back */}
                        <button
                            onClick={() => setMode('choice')}
                            className="w-full text-sm text-gray-500 hover:text-[#5A3825]"
                        >
                            العودة
                        </button>

                    </div>

                )}

            </div>

        </div>
    )
}