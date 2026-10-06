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
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const orderStatusLabels = {
        pending: 'قيد المراجعة',
        confirmed: 'تم التأكيد',
        preparing: 'جاري التجهيز',
        out_for_delivery: 'خرج للتوصيل',
        cancelled: 'ملغي',
    }
    const [currentTime, setCurrentTime] = useState(Date.now())
    const [cancellationMinutes, setCancellationMinutes] = useState(15)
    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState('')
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [showCancellationModal, setShowCancellationModal] = useState(false)
    const [cancellationOrder, setCancellationOrder] = useState(null)
    const [ordersLoading, setOrdersLoading] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

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

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: true })

            if (ordersError) {
                console.log('Account orders error:', ordersError.message)
                setOrders([])
            } else {
                setOrders(ordersData || [])
            }
            const { data: settingsData, error: settingsError } = await supabase
                .from('settings')
                .select('cancellation_minutes')
                .eq('id', 1)
                .single()

            if (settingsError) {
                console.log('Account settings error:', settingsError.message)
            } else {
                setCancellationMinutes(settingsData?.cancellation_minutes || 15)
            }

            setLoading(false)
        }

        loadAccount()

    }, [])
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedOrder || !user) {
                setMessages([])
                return
            }

            setMessagesLoading(true)

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('order_id', selectedOrder.id)
                .order('sent_at', { ascending: true })

            if (error) {
                console.log('Messages error:', error.message)
                setMessages([])
                setMessagesLoading(false)
                return
            }

            const loadedMessages = data || []
            const undeliveredAdminMessages = loadedMessages.filter(
                (message) =>
                    message.sender_type === 'admin' &&
                    !message.delivered_at
            )

            if (undeliveredAdminMessages.length > 0) {
                const deliveredIds = undeliveredAdminMessages.map(
                    (message) => message.id
                )

                const deliveredAt = new Date().toISOString()

                const { error: deliveredError } = await supabase
                    .from('messages')
                    .update({
                        delivered_at: deliveredAt,
                    })
                    .in('id', deliveredIds)

                if (deliveredError) {
                    console.log(
                        'Mark admin messages as delivered error:',
                        deliveredError.message
                    )
                }
            }

            setMessages(loadedMessages)

            // تعليم رسائل الأدمن كمقروءة
            const unreadAdminMessages = loadedMessages.filter(
                (message) =>
                    message.sender_type === 'admin' &&
                    !message.read_at
            )

            if (unreadAdminMessages.length > 0) {
                const unreadIds = unreadAdminMessages.map(
                    (message) => message.id
                )

                const { error: readError } = await supabase
                    .from('messages')
                    .update({
                        read_at: new Date().toISOString(),
                    })
                    .in('id', unreadIds)

                if (readError) {
                    console.log(
                        'Mark messages as read error:',
                        readError.message
                    )
                } else {
                    setMessages((prev) =>
                        prev.map((message) =>
                            unreadIds.includes(message.id)
                                ? {
                                    ...message,
                                    read_at:
                                        new Date().toISOString(),
                                }
                                : message
                        )
                    )
                }
            }

            setMessagesLoading(false)
        }

        loadMessages()
    }, [selectedOrder, user])
    const sendMessage = async () => {

        if (!messageText.trim() || !selectedOrder || !user || sendingMessage) {
            return
        }

        setSendingMessage(true)

        const { data, error } = await supabase
            .from('messages')
            .insert({
                order_id: selectedOrder.id,
                user_id: user.id,
                sender_type: 'user',
                message: messageText.trim(),
            })
            .select()
            .single()

        if (error) {
            console.log('Send message error:', error.message)
            setSendingMessage(false)
            return
        }

        setMessages((prev) => [...prev, data])
        setMessageText('')
        setSendingMessage(false)
    }

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

                    {orders.length === 0 ? (

                        <div className="text-center py-8">

                            <p className="text-gray-500">
                                لا توجد طلبات حتى الآن
                            </p>

                        </div>

                    ) : (

                        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">

                            {orders.map((order) => {

                                const canShowCancellation =
                                    order.status === 'confirmed' ||
                                    order.status === 'preparing'

                                const cancellationStartedAt = order.cancellation_started_at
                                    ? new Date(order.cancellation_started_at).getTime()
                                    : null

                                const cancellationEndTime = cancellationStartedAt
                                    ? cancellationStartedAt + cancellationMinutes * 60 * 1000
                                    : null

                                const remainingTime = cancellationEndTime
                                    ? Math.max(0, cancellationEndTime - currentTime)
                                    : 0

                                const remainingMinutes = Math.floor(
                                    remainingTime / (1000 * 60)
                                )

                                const remainingSeconds = Math.floor(
                                    (remainingTime % (1000 * 60)) / 1000
                                )

                                const canCancel =
                                    canShowCancellation &&
                                    cancellationStartedAt &&
                                    remainingTime > 0

                                return (

                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="border border-[#D8C9BC] rounded-xl p-4 cursor-pointer"
                                    >

                                        <div className="flex items-center justify-between gap-4">

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    رقم الطلب
                                                </p>

                                                <p className="font-semibold text-[#5A3825]">
                                                    #{order.order_number}
                                                </p>

                                            </div>

                                            <div className="text-left">

                                                <p className="text-sm text-gray-500">
                                                    الإجمالي
                                                </p>

                                                <p className="font-semibold text-[#5A3825]">
                                                    {order.total_price} جنيه
                                                </p>

                                            </div>

                                        </div>

                                        <div className="border-t border-[#D8C9BC] mt-4 pt-4">

                                            <div className="flex items-center justify-between gap-4 text-sm">

                                                <div>

                                                    <p className="text-gray-500">
                                                        تاريخ الطلب
                                                    </p>

                                                    <p className="text-[#5A3825] mt-1">
                                                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                                    </p>

                                                </div>

                                                <div>

                                                    <p className="text-gray-500">
                                                        الحالة
                                                    </p>

                                                    <p className="text-[#5A3825] mt-1">
                                                        {orderStatusLabels[order.status] || order.status}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* Cancellation */}
                                        {canCancel && (

                                            <div className="border-t border-[#D8C9BC] mt-4 pt-4">

                                                <div className="flex items-center justify-between gap-4">

                                                    <div>

                                                        <p className="text-sm text-gray-500">
                                                            متبقي على إلغاء الطلب
                                                        </p>

                                                        <p className="text-[#5A3825] font-semibold mt-1">
                                                            {canCancel
                                                                ? `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
                                                                : ''
                                                            }
                                                        </p>

                                                    </div>

                                                    {canCancel && (

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setCancellationOrder(order)
                                                                setShowCancellationModal(true)
                                                            }}
                                                            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            إلغاء الطلب
                                                        </button>)}

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                )

                            })}
                        </div>

                    )}

                </div>
                {selectedOrder && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#D8C9BC]">

                                <h2 className="text-lg font-semibold text-[#5A3825]">
                                    تفاصيل الطلب #{selectedOrder.order_number}
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedOrder(null)
                                        setMessageText('')
                                        setMessages([])
                                    }}
                                    className="text-gray-500 hover:text-[#5A3825] cursor-pointer"
                                >
                                    ✕
                                </button>

                            </div>


                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">

                                <div className="space-y-4">

                                    {/* الحالة */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            الحالة
                                        </p>

                                        <p className="text-[#5A3825] mt-1">
                                            {orderStatusLabels[selectedOrder.status] || selectedOrder.status}
                                        </p>

                                    </div>


                                    {/* الإجمالي */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            الإجمالي
                                        </p>

                                        <p className="text-[#5A3825] mt-1">
                                            {selectedOrder.total_price} جنيه
                                        </p>

                                    </div>


                                    {/* تاريخ الطلب */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            تاريخ الطلب
                                        </p>

                                        <p className="text-[#5A3825] mt-1">
                                            {new Date(selectedOrder.created_at).toLocaleDateString('ar-EG')}
                                        </p>

                                    </div>


                                    {/* المنتجات */}
                                    <div className="border-t border-[#D8C9BC] pt-4">

                                        <p className="text-sm text-gray-500 mb-3">
                                            المنتجات
                                        </p>

                                        <div className="space-y-3">

                                            {selectedOrder.items?.map((item, index) => (

                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between gap-4"
                                                >

                                                    <div>

                                                        <p className="text-[#5A3825]">
                                                            {item.name}
                                                        </p>

                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.quantity}{' '}
                                                            {item.sale_type === 'piece'
                                                                ? 'قطعة'
                                                                : 'كجم'}
                                                        </p>

                                                    </div>

                                                    <p className="font-semibold text-[#5A3825]">
                                                        {item.price * item.quantity} جنيه
                                                    </p>

                                                </div>

                                            ))}

                                        </div>

                                    </div>


                                    {/* باقي تفاصيل الطلب */}
                                    <div className="border-t border-[#D8C9BC] pt-4 space-y-4">

                                        {/* موعد التسليم */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                موعد التسليم
                                            </p>

                                            <p className="text-[#5A3825] mt-1">
                                                {selectedOrder.delivery_date} - {selectedOrder.delivery_time}
                                            </p>

                                        </div>


                                        {/* طريقة الدفع */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                طريقة الدفع
                                            </p>

                                            <p className="text-[#5A3825] mt-1">
                                                {selectedOrder.payment_method}
                                            </p>

                                        </div>


                                        {/* العنوان */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                العنوان
                                            </p>

                                            <p className="text-[#5A3825] mt-1">
                                                {selectedOrder.address}
                                            </p>

                                        </div>


                                        {/* رقم الهاتف */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                رقم الهاتف
                                            </p>

                                            <p className="text-[#5A3825] mt-1">
                                                {selectedOrder.phone}
                                            </p>

                                        </div>


                                        {/* الرقم الإضافي */}
                                        {selectedOrder.additional_phone && (

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    رقم إضافي
                                                </p>

                                                <p className="text-[#5A3825] mt-1">
                                                    {selectedOrder.additional_phone}
                                                </p>

                                            </div>

                                        )}


                                        {/* ملاحظات الطلب */}
                                        {selectedOrder.order_note && (

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    ملاحظات الطلب
                                                </p>

                                                <p className="text-[#5A3825] mt-1">
                                                    {selectedOrder.order_note}
                                                </p>

                                            </div>

                                        )}

                                    </div>


                                    {/* المراسلات */}
                                    <div className="border-t border-[#D8C9BC] pt-4">

                                        <p className="text-sm text-gray-500 mb-3">
                                            المراسلات
                                        </p>


                                        {/* الرسائل */}
                                        {messagesLoading ? (

                                            <div className="py-4 text-center">

                                                <p className="text-sm text-gray-500">
                                                    جاري تحميل الرسائل...
                                                </p>

                                            </div>

                                        ) : messages.length === 0 ? (

                                            <div className="py-4 text-center">

                                                <p className="text-sm text-gray-400">
                                                    لا توجد رسائل بعد
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">

                                                {messages.map((msg) => (

                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.sender_type === 'user'
                                                            ? 'justify-start'
                                                            : 'justify-end'
                                                            }`}
                                                    >

                                                        <div
                                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender_type === 'user'
                                                                ? 'bg-[#F8F3EA] text-[#5A3825]'
                                                                : 'bg-[#5A3825] text-white'
                                                                }`}
                                                        >

                                                            <p className="text-sm leading-6 break-words">
                                                                {msg.message}
                                                            </p>

                                                            <div
                                                                className={`flex items-center gap-2 text-[11px] mt-1 ${msg.sender_type === 'user'
                                                                    ? 'text-gray-400'
                                                                    : 'text-white/70'
                                                                    }`}
                                                            >
                                                                <span>
                                                                    {new Date(msg.sent_at).toLocaleTimeString(
                                                                        'ar-EG',
                                                                        {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        }
                                                                    )}
                                                                </span>

                                                                {msg.sender_type === 'user' && (
                                                                    <span
                                                                        className={
                                                                            msg.read_at || msg.delivered_at
                                                                                ? 'text-[#5A3825]'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {msg.read_at
                                                                            ? '✓✓ مقروءة'
                                                                            : msg.delivered_at
                                                                                ? '✓✓ تم التسليم'
                                                                                : '✓ تم الإرسال'}
                                                                    </span>
                                                                )}                                                            </div>
                                                        </div>

                                                    </div>

                                                ))}

                                            </div>

                                        )}


                                        {/* كتابة رسالة */}
                                        <div className="mt-4">

                                            <textarea
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                placeholder="اكتب رسالتك..."
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-[#D8C9BC] bg-[#F8F3EA] px-4 py-3 text-sm text-[#2E1B12] placeholder:text-gray-400 outline-none focus:border-[#5A3825]"
                                            />

                                            <div className="flex justify-end mt-2">

                                                <button
                                                    type="button"
                                                    onClick={sendMessage}
                                                    disabled={
                                                        !messageText.trim() ||
                                                        sendingMessage
                                                    }
                                                    className="rounded-xl bg-[#5A3825] px-5 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {sendingMessage
                                                        ? 'جاري الإرسال...'
                                                        : 'إرسال'}
                                                </button>

                                            </div>

                                        </div>

                                    </div>


                                </div>

                            </div>

                        </div>

                    </div>

                )}

                {/* Cancellation Confirmation Modal */}
                {showCancellationModal && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

                        <div className="bg-white rounded-2xl w-full max-w-md p-6">

                            <div className="flex items-center justify-between mb-6">

                                <h2 className="text-lg font-semibold text-[#5A3825]">
                                    إلغاء الطلب
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowCancellationModal(false)}
                                    className="text-gray-500 hover:text-[#5A3825] text-xl"
                                >
                                    <FiX />
                                </button>

                            </div>

                            <p className="text-[#5A3825] text-center text-lg mb-8">
                                هل تريد الغاء الطلب
                            </p>

                            <div className="flex gap-3">

                                <button
                                    type="button"
                                    onClick={() => setShowCancellationModal(false)}
                                    className="flex-1 rounded-xl border border-[#D8C9BC] py-3 text-gray-600 hover:bg-[#F8F3EA] transition"
                                >
                                    إلغاء
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        console.log('CANCEL CONFIRM CLICKED')
                                        console.log('Cancellation order:', cancellationOrder)
                                        console.log('User:', user)

                                        if (!cancellationOrder || !user) {
                                            console.log('Missing cancellationOrder or user')
                                            return
                                        }

                                        const { data, error } = await supabase
                                            .from('messages')
                                            .insert({
                                                order_id: cancellationOrder.id,
                                                user_id: user.id,
                                                sender_type: 'user',
                                                message: 'اريد الغاء الطلب',
                                            })
                                            .select()
                                            .single()

                                        console.log('Cancellation message result:', { data, error })

                                        if (error) {
                                            console.log('Send cancellation message error:', error)
                                            return
                                        }

                                        setMessages((prev) => [...prev, data])
                                        setShowCancellationModal(false)
                                        setCancellationOrder(null)
                                    }}
                                    className="flex-1 rounded-xl bg-red-500 text-white py-3 hover:bg-red-600 transition"
                                >
                                    تأكيد
                                </button>
                            </div>

                        </div>

                    </div>

                )}
                {/* Logout */}
                <div className="mt-8">

                    <button
                        onClick={handleLogout}
                        className="w-full cursor-pointer flex items-center justify-center gap-2 bg-red-500 text-white rounded-xl py-3 hover:bg-red-600 transition"
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






