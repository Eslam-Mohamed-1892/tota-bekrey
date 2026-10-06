import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../supabase'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

export default function AdminSales() {
    const currentMonth = (() => {
        const date = new Date()

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, '0')}`
    })()

    const [orderToDelete, setOrderToDelete] = useState(null)

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const [expenses, setExpenses] = useState([])
    const [expensesLoading, setExpensesLoading] = useState(true)

    const [selectedMonth, setSelectedMonth] = useState(currentMonth)

    const [expenseCategory, setExpenseCategory] = useState('gas')
    const [expenseDescription, setExpenseDescription] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    const [expenseDate, setExpenseDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [selectedStatus, setSelectedStatus] = useState("all")

    useEffect(() => {
        getOrders()
        getExpenses()
    }, [])

    const getOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.log('Error loading orders:', error)
            setLoading(false)
            return
        }

        setOrders(data)
        setLoading(false)
    }

    const getExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false })

        if (error) {
            console.log('Error loading expenses:', error)
            setExpensesLoading(false)
            return
        }

        setExpenses(data)
        setExpensesLoading(false)
    }

    const updateStatus = async (id, status) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)

        if (error) {
            console.log('Error updating order:', error)
            toast.error('حدث خطأ أثناء تحديث حالة الطلب')
            return
        }

        setOrders((prev) =>
            prev.map((order) =>
                order.id === id
                    ? { ...order, status }
                    : order
            )
        )

        toast.success(
            `تم تحديث حالة الطلب إلى ${getStatusText(status)}`
        )
    }

    const deleteOrder = async (id) => {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id)

        if (error) {
            console.log('Error deleting order:', error)
            toast.error('حدث خطأ أثناء حذف الطلب')
            return
        }

        setOrders((prev) =>
            prev.filter((order) => order.id !== id)
        )

        toast.success('تم حذف الطلب بنجاح')
    }

    const addExpense = async () => {
        if (!expenseAmount || Number(expenseAmount) <= 0) {
            toast.error('اكتب قيمة المصروف')
            return
        }

        if (!expenseDate) {
            toast.error('اختر تاريخ المصروف')
            return
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert([
                {
                    category: expenseCategory,
                    description: expenseDescription,
                    amount: Number(expenseAmount),
                    expense_date: expenseDate,
                },
            ])
            .select()

        if (error) {
            console.log('Error adding expense:', error)
            toast.error('حدث خطأ أثناء إضافة المصروف')
            return
        }

        setExpenses((prev) => [
            data[0],
            ...prev,
        ])

        setExpenseCategory('gas')
        setExpenseDescription('')
        setExpenseAmount('')
        setExpenseDate(
            new Date().toISOString().split('T')[0]
        )

        toast.success('تم إضافة المصروف بنجاح')
    }

    const deleteExpense = async (id) => {
        const confirmed = window.confirm(
            'هل أنت متأكد من حذف هذا المصروف؟'
        )

        if (!confirmed) return

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            console.log('Error deleting expense:', error)
            toast.error('حدث خطأ أثناء حذف المصروف')
            return
        }

        setExpenses((prev) =>
            prev.filter((expense) => expense.id !== id)
        )

        toast.success('تم حذف المصروف بنجاح')
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'قيد الانتظار'

            case 'confirmed':
                return 'تم التأكيد'

            case 'preparing':
                return 'جاري التجهيز'

            case 'delivered':
                return 'تم التسليم'

            case 'cancelled':
                return 'ملغي'

            default:
                return status
        }
    }

    const getCategoryText = (category) => {
        switch (category) {
            case 'gas':
                return 'غاز'

            case 'supplies':
                return 'مستلزمات'

            case 'labor':
                return 'أيدي عاملة'

            case 'other':
                return 'مصروفات إضافية'

            default:
                return category
        }
    }

    const isSale = (status) => {
        return (
            status === 'confirmed' ||
            status === 'preparing' ||
            status === 'delivered'
        )
    }

    const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at)

        const orderMonth = `${orderDate.getFullYear()}-${String(
            orderDate.getMonth() + 1
        ).padStart(2, '0')}`

        const matchesMonth = orderMonth === selectedMonth

        const matchesStatus =
            selectedStatus === 'all' ||
            order.status === selectedStatus

        return matchesMonth && matchesStatus
    })

    const reportOrders = filteredOrders

    const totalSales = filteredOrders
        .filter((order) => isSale(order.status))
        .reduce(
            (total, order) =>
                total + Number(order.total_price),
            0
        )

    const filteredExpenses = expenses.filter((expense) => {
        return expense.expense_date.startsWith(selectedMonth)
    })

    const gasExpenses = filteredExpenses
        .filter((expense) => expense.category === 'gas')
        .reduce(
            (total, expense) =>
                total + Number(expense.amount),
            0
        )

    const suppliesExpenses = filteredExpenses
        .filter((expense) => expense.category === 'supplies')
        .reduce(
            (total, expense) =>
                total + Number(expense.amount),
            0
        )

    const laborExpenses = filteredExpenses
        .filter((expense) => expense.category === 'labor')
        .reduce(
            (total, expense) =>
                total + Number(expense.amount),
            0
        )

    const otherExpenses = filteredExpenses
        .filter((expense) => expense.category === 'other')
        .reduce(
            (total, expense) =>
                total + Number(expense.amount),
            0
        )

    const totalExpenses =
        gasExpenses +
        suppliesExpenses +
        laborExpenses +
        otherExpenses

    const netProfit = totalSales - totalExpenses

    const months = Array.from(
        { length: 12 },
        (_, index) => {
            const date = new Date()

            date.setMonth(date.getMonth() - index)

            return {
                value: `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}`,

                label: date.toLocaleDateString('ar-EG', {
                    month: 'long',
                    year: 'numeric',
                }),
            }
        }
    )

    const monthlySales = Array.from(
        { length: 12 },
        (_, index) => {
            const date = new Date()

            date.setMonth(
                date.getMonth() - 11 + index
            )

            return {
                year: date.getFullYear(),
                month: date.getMonth(),
                label: date.toLocaleDateString('ar-EG', {
                    month: 'short',
                }),
                sales: 0,
            }
        }
    )

    orders
        .filter((order) => isSale(order.status))
        .forEach((order) => {
            const date = new Date(order.created_at)

            const monthData = monthlySales.find(
                (item) =>
                    item.year === date.getFullYear() &&
                    item.month === date.getMonth()
            )

            if (monthData) {
                monthData.sales += Number(
                    order.total_price
                )
            }
        })

    return (
        <section>

            {/* Header */}
            <div className="mb-6">

                <h2 className="text-2xl font-bold">
                    المبيعات
                </h2>

                <p className="text-[#6B5A50] mt-1">
                    إدارة الطلبات ومتابعة المبيعات والمصروفات.
                </p>

            </div>


            {/* Filters */}
            <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 mb-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-lg">
                            الفلاتر
                        </h3>

                        <p className="text-sm text-[#6B5A50] mt-1">
                            اختر الشهر وحالة الطلبات التي تريد عرضها
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Month */}
                        <select
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(e.target.value)
                            }
                            className="border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        >
                            {months.map((month) => (
                                <option
                                    key={month.value}
                                    value={month.value}
                                >
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={selectedStatus}
                            onChange={(e) =>
                                setSelectedStatus(e.target.value)
                            }
                            className="border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        >
                            <option value="all">
                                كل الحالات
                            </option>

                            <option value="pending">
                                قيد الانتظار
                            </option>

                            <option value="confirmed">
                                تم التأكيد
                            </option>

                            <option value="preparing">
                                جاري التجهيز
                            </option>

                            <option value="delivered">
                                تم التسليم
                            </option>

                            <option value="cancelled">
                                ملغي
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        عدد الطلبات
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                        {reportOrders.length}
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        إجمالي المبيعات
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                        {totalSales} جنيه
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        إجمالي المصروفات
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                        {totalExpenses} جنيه
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        صافي الربح
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                        {netProfit} جنيه
                    </p>

                </div>

            </div>


            {/* Expense Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        غاز
                    </p>

                    <p className="mt-2 text-xl font-bold text-[#2E1B12]">
                        {gasExpenses} جنيه
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        مستلزمات
                    </p>

                    <p className="mt-2 text-xl font-bold text-[#2E1B12]">
                        {suppliesExpenses} جنيه
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        أيدي عاملة
                    </p>

                    <p className="mt-2 text-xl font-bold text-[#2E1B12]">
                        {laborExpenses} جنيه
                    </p>

                </div>


                <div className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden">

                    <p className="text-sm text-[#6B5A50]">
                        مصروفات إضافية
                    </p>

                    <p className="mt-2 text-xl font-bold text-[#2E1B12]">
                        {otherExpenses} جنيه
                    </p>

                </div>

            </div>


            {/* Orders */}
            <section className="mb-6">

                <div className="mb-4">

                    <h3 className="text-xl font-bold">
                        الطلبات
                    </h3>

                    <p className="text-sm text-[#6B5A50] mt-1">
                        الطلبات الخاصة بالشهر المختار
                    </p>

                </div>


                {loading ? (

                    <p className="text-[#6B5A50]">
                        جاري تحميل الطلبات...
                    </p>

                ) : reportOrders.length === 0 ? (

                    <div className="bg-white border border-[#E8DED2] rounded-2xl p-6 overflow-hidden">

                        <p className="text-[#6B5A50]">
                            لا توجد طلبات في هذا الشهر.
                        </p>

                    </div>

                ) : (

                    <div className="max-h-[650px] overflow-y-auto overflow-x-hidden space-y-4 pr-1">

                        {reportOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-[#E8DED2] rounded-2xl p-5 overflow-hidden"
                            >

                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {order.customer_name}
                                        </h3>

                                        <p className="text-sm text-[#6B5A50] mt-1">
                                            {order.phone}
                                        </p>

                                        {order.additional_phone && (
                                            <p className="text-sm text-[#6B5A50] mt-1">
                                                هاتف إضافي: {order.additional_phone}
                                            </p>
                                        )}

                                        <p className="text-sm text-[#6B5A50] mt-1">
                                            {order.address}
                                        </p>

                                        {order.order_note && (
                                            <p className="text-sm text-[#6B5A50] mt-2">
                                                ملاحظات الطلب: {order.order_note}
                                            </p>
                                        )}
                                    </div>

                                    <div>

                                        <p className="font-bold text-[#5A3825]">
                                            {order.total_price} جنيه
                                        </p>

                                        {order.payment_method && (
                                            <p className="text-sm text-[#6B5A50] mt-1">
                                                طريقة الدفع: {order.payment_method}
                                            </p>
                                        )}

                                        <p className="text-sm text-[#6B5A50] mt-1">
                                            الحالة: {getStatusText(order.status)}
                                        </p>

                                    </div>
                                </div>


                                {/* Order Details */}
                                <div className="mt-5 pt-5 border-t border-[#E8DED2]">

                                    <p className="font-semibold mb-3">
                                        تفاصيل الطلب
                                    </p>

                                    {order.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between gap-4 text-sm text-[#6B5A50] mb-2"
                                        >

                                            <span className="min-w-0 break-words">
                                                {item.name} × {item.quantity}{' '}
                                                {item.sale_type === 'piece'
                                                    ? 'قطعة'
                                                    : 'كجم'}
                                            </span>

                                            <span className="shrink-0">
                                                {item.price * item.quantity} جنيه
                                            </span>

                                        </div>
                                    ))}

                                </div>


                                {/* Delivery */}
                                <div className="mt-4 text-sm text-[#6B5A50]">

                                    <p>
                                        تاريخ التسليم: {order.delivery_date}
                                    </p>

                                    <p className="mt-1">
                                        وقت التسليم: {order.delivery_time}
                                    </p>

                                </div>


                                {/* Controls */}
                                <div className="mt-5 pt-5 border-t border-[#E8DED2]">

                                    <label className="block text-sm font-medium mb-2">
                                        حالة الطلب
                                    </label>

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            updateStatus(
                                                order.id,
                                                e.target.value
                                            )
                                        }
                                        className="w-full md:w-auto border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                                    >

                                        <option value="pending">
                                            قيد الانتظار
                                        </option>

                                        <option value="confirmed">
                                            تم التأكيد
                                        </option>

                                        <option value="preparing">
                                            جاري التجهيز
                                        </option>

                                        <option value="delivered">
                                            تم التسليم
                                        </option>

                                        <option value="cancelled">
                                            ملغي
                                        </option>

                                    </select>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOrderToDelete(order)
                                        }
                                        className="mt-3 md:mt-0 md:mr-3 w-full md:w-auto bg-red-50 text-red-600 px-5 py-3 rounded-xl hover:bg-red-100 transition"
                                    >
                                        حذف الطلب
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>

                )}

            </section>


            {/* Sales Chart */}
            <section className="bg-white border border-[#E8DED2] rounded-2xl p-5 mb-6 overflow-hidden">

                <h3 className="text-xl font-bold">
                    المبيعات خلال آخر 12 شهر
                </h3>

                <p className="text-sm text-[#6B5A50] mt-1">
                    إجمالي المبيعات حسب الشهر
                </p>

                <div className="mt-6 w-full h-64 sm:h-80 overflow-hidden">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={monthlySales}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -25,
                                bottom: 5,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />

                            <YAxis
                                tick={{ fontSize: 12 }}
                                width={45}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    `${value} جنيه`,
                                    'المبيعات',
                                ]}
                            />

                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#5A3825"
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </section>


            {/* Expenses */}
            <section className="bg-white border border-[#E8DED2] rounded-2xl p-5 mb-6 overflow-hidden">

                <div className="mb-6">

                    <h3 className="text-xl font-bold">
                        المصروفات
                    </h3>

                    <p className="text-sm text-[#6B5A50] mt-1">
                        تسجيل ومتابعة مصروفات الشهر المختار.
                    </p>

                </div>


                {/* Add Expense */}
                <div className="bg-[#F8F3EA] rounded-2xl p-4 overflow-hidden">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Category */}
                        <select
                            value={expenseCategory}
                            onChange={(e) =>
                                setExpenseCategory(e.target.value)
                            }
                            className="w-full border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        >

                            <option value="gas">
                                غاز
                            </option>

                            <option value="supplies">
                                مستلزمات
                            </option>

                            <option value="labor">
                                أيدي عاملة
                            </option>

                            <option value="other">
                                مصروفات إضافية
                            </option>

                        </select>


                        {/* Description */}
                        <input
                            type="text"
                            value={expenseDescription}
                            onChange={(e) =>
                                setExpenseDescription(e.target.value)
                            }
                            placeholder={
                                expenseCategory === 'supplies'
                                    ? 'مثال: دقيق - سمنة - زيت - أكياس'
                                    : 'تفاصيل المصروف'
                            }
                            className="w-full border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        />


                        {/* Amount */}
                        <input
                            type="number"
                            min="0"
                            value={expenseAmount}
                            onChange={(e) =>
                                setExpenseAmount(e.target.value)
                            }
                            placeholder="قيمة المصروف"
                            className="w-full border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        />

                    </div>


                    <div className="flex flex-col sm:flex-row gap-4 mt-4">

                        <input
                            type="date"
                            value={expenseDate}
                            onChange={(e) =>
                                setExpenseDate(e.target.value)
                            }
                            className="w-full sm:w-auto border border-[#D8C9BC] rounded-xl px-4 py-3 outline-none bg-white"
                        />

                        <button
                            type="button"
                            onClick={addExpense}
                            className="bg-[#5A3825] text-white px-5 py-3 rounded-xl"
                        >
                            إضافة مصروف
                        </button>

                    </div>

                </div>


                {/* Expenses List */}
                <div className="mt-6">

                    {expensesLoading ? (

                        <p className="text-[#6B5A50]">
                            جاري تحميل المصروفات...
                        </p>

                    ) : filteredExpenses.length === 0 ? (

                        <div className="border border-[#E8DDD2] rounded-xl p-5 overflow-hidden">

                            <p className="text-[#6B5A50]">
                                لا توجد مصروفات في هذا الشهر.
                            </p>

                        </div>

                    ) : (

                        <div className="max-h-[450px] overflow-y-auto overflow-x-hidden space-y-3 pr-1">

                            {filteredExpenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="border border-[#E8DDD2] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden"
                                >

                                    <div>

                                        <p className="font-semibold text-[#2E1B12]">
                                            {getCategoryText(
                                                expense.category
                                            )}
                                        </p>

                                        {expense.description && (
                                            <p className="text-sm text-[#6B5A50] mt-1 break-words">
                                                {expense.description}
                                            </p>
                                        )}

                                        <p className="text-sm text-[#6B5A50] mt-1">
                                            {expense.expense_date}
                                        </p>

                                    </div>


                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">

                                        <p className="font-bold text-[#5A3825]">
                                            {expense.amount} جنيه
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteExpense(
                                                    expense.id
                                                )
                                            }
                                            className="text-red-600"
                                        >
                                            حذف
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                    )}

                </div>

            </section>


            {/* Delete Order Modal */}
            {orderToDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl p-6 overflow-hidden">

                        <h3 className="text-xl font-bold">
                            حذف الطلب
                        </h3>


                        <div className="text-[#6B5A50] mt-4 space-y-2">

                            <p>
                                العميل: {orderToDelete.customer_name}
                            </p>

                            <p>
                                الهاتف: {orderToDelete.phone}
                            </p>

                            <p>
                                المنتجات:
                            </p>

                            {orderToDelete.items?.map((item, index) => (
                                <p
                                    key={index}
                                    className="mr-3 break-words"
                                >
                                    {item.name} × {item.quantity}{' '}
                                    {item.sale_type === 'piece'
                                        ? 'قطعة'
                                        : 'كجم'}
                                </p>
                            ))}

                            <p>
                                الإجمالي: {orderToDelete.total_price} جنيه
                            </p>

                            <p>
                                تاريخ التسليم: {orderToDelete.delivery_date}
                            </p>

                            <p>
                                وقت التسليم: {orderToDelete.delivery_time}
                            </p>

                        </div>


                        <div className="flex gap-3 mt-6">

                            <button
                                type="button"
                                onClick={() =>
                                    setOrderToDelete(null)
                                }
                                className="flex-1 border border-[#E8DDD2] py-3 rounded-xl"
                            >
                                إلغاء
                            </button>


                            <button
                                type="button"
                                onClick={async () => {
                                    await deleteOrder(
                                        orderToDelete.id
                                    )

                                    setOrderToDelete(null)
                                }}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl"
                            >
                                حذف الطلب
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </section>
    )
}