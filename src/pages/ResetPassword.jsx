import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
    FiEye,
    FiEyeOff,
} from 'react-icons/fi'

export default function ResetPassword() {

    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    useEffect(() => {

        const checkSession = async () => {

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                navigate('/')
                return
            }

            setCheckingSession(false)
        }

        checkSession()

    }, [navigate])

    const handleUpdatePassword = async () => {

        if (!password || !confirmPassword) {
            alert('يرجى إدخال كلمة المرور الجديدة وتأكيدها.')
            return
        }

        if (password !== confirmPassword) {
            alert('كلمتا المرور غير متطابقتين.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password,
        })

        setLoading(false)

        if (error) {
            console.log('Update password error:', error.message)
            alert('تعذر تحديث كلمة المرور، يرجى المحاولة مرة أخرى.')
            return
        }

        alert('تم تغيير كلمة المرور بنجاح.')

        await supabase.auth.signOut()

        navigate('/')
    }

    if (checkingSession) {
        return (
            <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">
                <div className="max-w-md mx-auto px-5">
                    <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                        <p className="text-gray-500">
                            جاري التحقق...
                        </p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">

            <div className="max-w-md mx-auto px-5">

                <div className="bg-white rounded-2xl p-6 shadow-sm">

                    <div className="text-center mb-8">

                        <h1 className="text-2xl font-bold text-[#5A3825]">
                            إعادة تعيين كلمة المرور
                        </h1>

                        <p className="text-gray-500 mt-2 leading-7">
                            أدخل كلمة المرور الجديدة لحسابك.
                        </p>

                    </div>

                    <div className="space-y-5">

                        {/* New Password */}
                        <div>

                            <label className="block text-sm text-[#5A3825] mb-2">
                                كلمة المرور الجديدة
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

                            </div>

                        </div>

                        {/* Confirm Password */}
                        <div>

                            <label className="block text-sm text-[#5A3825] mb-2">
                                تأكيد كلمة المرور الجديدة
                            </label>

                            <div className="relative">

                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#5A3825]"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5A3825]"
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>

                            </div>

                        </div>

                        {/* Save */}
                        <button
                            type="button"
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            className="w-full bg-[#5A3825] text-white rounded-xl py-3 hover:bg-[#4a2e20] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? 'جاري حفظ كلمة المرور...'
                                : 'حفظ كلمة المرور'}
                        </button>

                    </div>

                </div>

            </div>

        </main>
    )
}