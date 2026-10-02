import { supabase } from '../supabase'

export default function Account() {

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.log('Logout error:', error.message)
            return
        }

        console.log('Logged out successfully')
    }

    return (
        <main className="min-h-screen bg-[#F8F3EA] pt-28 pb-12">
            <div className="max-w-4xl mx-auto px-5">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#5A3825]">
                        حسابي
                    </h1>

                    <p className="text-gray-500 mt-2">
                        أهلاً بيك في حسابك
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#5A3825] mb-6">
                        معلومات الحساب
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                اسم المستخدم
                            </p>

                            <p className="text-[#5A3825] font-medium">
                                إسلام
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                البريد الإلكتروني
                            </p>

                            <p className="text-[#5A3825] font-medium">
                                example@email.com
                            </p>
                        </div>
                    </div>
                </div>

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
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white rounded-xl py-3 hover:bg-red-600 transition"
                    >
                        تسجيل الخروج
                    </button>                </div>
            </div>
        </main>
    )
}