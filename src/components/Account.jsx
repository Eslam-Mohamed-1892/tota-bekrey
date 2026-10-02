import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
    FiUser,
    FiMail,
    FiLock,
    FiLogOut,
    FiChevronLeft,
    FiX,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function Account() {

    const [user, setUser] = useState(null)
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const [showPasswordReset, setShowPasswordReset] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {

        const loadAccount = async () => {

            setLoading(true)

            const {
                data: { user: authUser },
                error: authError,
            } = await supabase.auth.getUser()

            if (authError) {
                console.log('Account user error:', authError.message)
                setLoading(false)
                return
            }

            if (!authUser) {
                setUser(null)
                setUsername('')
                setLoading(false)
                return
            }

            setUser(authUser)

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', authUser.id)
                .single()

            if (profileError) {
                console.log('Account profile error:', profileError.message)
                setUsername(authUser.user_metadata?.username || '')
                setLoading(false)
                return
            }

            setUsername(profile?.username || authUser.user_metadata?.username || '')

            setLoading(false)
        }

        loadAccount()

    }, [])

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.log('Logout error:', error.message)
            return
        }

        navigate('/')
    }
    
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">

                <div className="max-w-4xl mx-auto px-5">

                    <div className="text-center py-20">

                        <p className="text-gray-500">
                            جاري تحميل بيانات الحساب...
                        </p>

                    </div>

                </div>

            </main>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">

                <div className="max-w-4xl mx-auto px-5">

                    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">

                        <h1 className="text-2xl font-bold text-[#5A3825]">
                            حسابي
                        </h1>

                        <p className="text-gray-500 mt-3">
                            يرجى تسجيل الدخول للوصول إلى حسابك.
                        </p>

                    </div>

                </div>

            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">

            <div className="max-w-4xl mx-auto px-5">

                {/* Page Header */}
                <div className="text-center mb-8">

                    <h1 className="text-2xl font-bold text-[#5A3825]">
                        حسابي
                    </h1>

                    <p className="text-gray-500 mt-2">
                        إدارة بيانات حسابك وطلباتك
                    </p>

                </div>

                {/* Account Information */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-[#5A3825] mb-6">
                        معلومات الحساب
                    </h2>

                    <div className="space-y-5">

                        {/* Username */}
                        <div className="flex items-center gap-4">

                            <div className="w-11 h-11 rounded-xl bg-[#F8F3EA] flex items-center justify-center text-[#5A3825]">
                                <FiUser />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    اسم المستخدم
                                </p>

                                <p className="text-[#5A3825] font-medium">
                                    {username || 'غير متوفر'}
                                </p>
                            </div>

                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4">

                            <div className="w-11 h-11 rounded-xl bg-[#F8F3EA] flex items-center justify-center text-[#5A3825]">
                                <FiMail />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    البريد الإلكتروني
                                </p>

                                <p className="text-[#5A3825] font-medium break-all">
                                    {user.email}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Account Management */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">

                    <h2 className="text-lg font-semibold text-[#5A3825] mb-4">
                        إدارة الحساب
                    </h2>

                    <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="w-full flex items-center justify-between border border-[#D8C9BC] rounded-xl px-4 py-4 hover:bg-[#F8F3EA] transition"
                    >

                        <div className="flex items-center gap-4">

                            <div className="w-10 h-10 rounded-xl bg-[#F8F3EA] flex items-center justify-center text-[#5A3825]">
                                <FiLock />
                            </div>

                            <div className="text-right">

                                <p className="text-[#5A3825] font-medium">
                                    تغيير كلمة المرور
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    إعادة تعيين كلمة المرور الخاصة بحسابك
                                </p>

                            </div>

                        </div>

                        <FiChevronLeft className="text-gray-400" />

                    </button>

                </div>

                {/* Previous Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">

                    <h2 className="text-lg font-semibold text-[#5A3825] mb-6">
                        طلباتي السابقة
                    </h2>

                    <div className="text-center py-8">

                        <p className="text-gray-500">
                            لا توجد طلبات حتى الآن
                        </p>

                    </div>

                </div>

                {/* Logout */}
                <div className="mt-8">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white rounded-xl py-3 hover:bg-red-600 transition"
                    >
                        <FiLogOut />

                        <span>
                            تسجيل الخروج
                        </span>

                    </button>

                </div>

                {/* Password Reset UI */}
                {showPasswordReset && (

                    <div className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center px-4">

                        <div className="w-full max-w-md bg-white rounded-2xl p-6 relative">

                            {/* Close */}
                            <button
                                type="button"
                                onClick={() => setShowPasswordReset(false)}
                                className="absolute top-4 left-4 text-gray-500 hover:text-[#5A3825] text-xl transition"
                            >
                                <FiX />
                            </button>

                            <div className="text-center mb-8">

                                <h2 className="text-2xl font-bold text-[#5A3825]">
                                    تغيير كلمة المرور
                                </h2>

                                <p className="text-gray-500 mt-2 leading-7">
                                    سنرسل رابطًا إلى بريدك الإلكتروني لإعادة تعيين كلمة المرور.
                                </p>

                            </div>

                            <div className="space-y-5">

                                <div>

                                    <label className="block text-sm text-[#5A3825] mb-2">
                                        البريد الإلكتروني
                                    </label>

                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        readOnly
                                        className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 outline-none text-gray-500"
                                    />

                                </div>

                                <button
                                    type="button"
                                    className="w-full bg-[#5A3825] text-white rounded-xl py-3 hover:bg-[#4a2e20] transition"
                                >
                                    إرسال رابط إعادة التعيين
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPasswordReset(false)}
                                    className="w-full text-sm text-gray-500 hover:text-[#5A3825] transition"
                                >
                                    إلغاء
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </main>
    )
}