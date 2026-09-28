import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { supabase } from '../supabase'

export default function Cart({ cart, setCart }) {
  const [location, setLocation] = useState(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const today = new Date().toISOString().split('T')[0]

  const updateCartQuantity = (item, change) => {
    setCart((prev) =>
      prev
        .map((cartItem) => {
          if (cartItem.id !== item.id) {
            return cartItem
          }

          const step = item.sale_type === 'piece' ? 1 : 0.5
          const newQuantity = cartItem.quantity + change * step

          return {
            ...cartItem,
            quantity: newQuantity,
          }
        })
        .filter((cartItem) => cartItem.quantity > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    )
  }

  const openCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setIsCheckoutOpen(false)
    setLocation(null)
    formik.resetForm()
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        alert('تعذر الحصول على موقعك')
      }
    )
  }

  const confirmOrder = async (values) => {
    const items = cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      sale_type: item.sale_type,
    }))

    const { error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: values.name,
          phone: values.phone,
          address: values.address,
          delivery_date: values.deliveryDate,
          delivery_time: values.deliveryTime,
          total_price: cartTotal,
          status: 'pending',
          items: items,
        },
      ])

    if (error) {
      console.log('Error creating order:', error)
      alert('حدث خطأ أثناء تسجيل الطلب')
      return
    }

    const mapsUrl = location
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : ''

    const productsMessage = cart
      .map((item) => {
        const unit =
          item.sale_type === 'piece'
            ? 'قطعة'
            : 'كجم'

        const itemTotal = item.price * item.quantity

        return `المنتج: ${item.name}
الكمية: ${item.quantity} ${unit}
السعر: ${item.price} جنيه / ${unit}
الإجمالي: ${itemTotal} جنيه`
      })
      .join('\n\n')

    const message = `مرحبًا، أريد تأكيد طلب

تفاصيل الطلب:
${productsMessage}

إجمالي الطلب: ${cartTotal} جنيه

بيانات العميل:
الاسم: ${values.name}
رقم الهاتف: ${values.phone}
العنوان: ${values.address}
تاريخ التسليم: ${values.deliveryDate}
وقت التسليم: ${values.deliveryTime}
${location ? `الموقع على الخريطة: ${mapsUrl}` : ''}

شكرًا لكم`

    const whatsappNumber = '201050838177'

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')

    setCart([])
    setIsCheckoutOpen(false)
    setLocation(null)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      address: '',
      deliveryDate: '',
      deliveryTime: '',
    },

    validationSchema: Yup.object({
      name: Yup.string().required('الاسم مطلوب'),

      phone: Yup.string().required('رقم الهاتف مطلوب'),

      address: Yup.string().required('العنوان مطلوب'),

      deliveryDate: Yup.string().required(
        'تاريخ التسليم مطلوب'
      ),

      deliveryTime: Yup.string().required(
        'وقت التسليم مطلوب'
      ),
    }),

    onSubmit: (values) => {
      confirmOrder(values)
    },
  })

  return (
    <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 md:pb-20">

      {cart.length > 0 ? (
        <div className="max-w-6xl mx-auto px-5">

          <div className="bg-white rounded-2xl p-5 md:p-6 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">

              <h1 className="text-xl font-semibold text-[#2E1B12]">
                السلة
              </h1>

              <span className="text-sm text-[#6B5A50]">
                {cart.length} منتجات
              </span>

            </div>

            {/* Cart Items */}
            <div className="space-y-3">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F8F3EA] rounded-xl p-4 overflow-hidden"
                >

                  <div className="flex items-center justify-between gap-3">

                    <p className="font-medium text-[#2E1B12]">
                      {item.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      إزالة
                    </button>

                  </div>

                  <div className="flex items-center justify-between gap-4 mt-4">

                    <p className="font-semibold text-[#5A3825]">
                      {item.price * item.quantity} جنيه
                    </p>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item, -1)}
                        className="w-8 h-8 border border-[#D8C9BC] rounded-lg"
                      >
                        -
                      </button>

                      <span className="min-w-16 text-center text-sm">
                        {item.quantity}{' '}
                        {item.sale_type === 'piece'
                          ? 'قطعة'
                          : 'كجم'}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item, 1)}
                        className="w-8 h-8 border border-[#D8C9BC] rounded-lg"
                      >
                        +
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#E8DED2]">

              <span className="font-semibold text-[#2E1B12]">
                الإجمالي
              </span>

              <span className="font-bold text-[#5A3825]">
                {cartTotal} جنيه
              </span>

            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={openCheckout}
              className="mt-5 w-full bg-[#5A3825] text-white py-3 rounded-xl active:bg-[#3F271A]"
            >
              إتمام الطلب
            </button>

          </div>

        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-5">

          <div className="bg-white rounded-2xl p-6 text-center">

            <p className="text-[#6B5A50]">
              السلة فارغة
            </p>

          </div>

        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">

          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold text-[#2E1B12]">
                إتمام الطلب
              </h2>

              <button
                type="button"
                onClick={closeCheckout}
                className="text-[#6B5A50] text-lg"
              >
                ✕
              </button>

            </div>

            {/* Order Summary */}
            <div className="mb-6">

              <h3 className="font-semibold text-[#2E1B12] mb-3">
                تفاصيل الطلب
              </h3>

              <div className="space-y-3">

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-[#E8DED2] pb-3"
                  >

                    <div>
                      <p className="font-medium text-[#2E1B12]">
                        {item.name}
                      </p>

                      <p className="text-sm text-[#6B5A50] mt-1">
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

              <div className="flex items-center justify-between mt-4">

                <span className="font-semibold">
                  الإجمالي
                </span>

                <span className="font-bold text-[#5A3825]">
                  {cartTotal} جنيه
                </span>

              </div>

            </div>

            {/* Customer Form */}
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-4"
            >

              {/* Name */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  الاسم
                </label>

                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 outline-none"
                />

                {formik.touched.name &&
                  formik.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.name}
                    </p>
                  )}

              </div>

              {/* Phone */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  رقم الهاتف
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 outline-none"
                />

                {formik.touched.phone &&
                  formik.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.phone}
                    </p>
                  )}

              </div>

              {/* Address */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  العنوان
                </label>

                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows="3"
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 outline-none resize-none"
                />

                {formik.touched.address &&
                  formik.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.address}
                    </p>
                  )}

              </div>

              {/* Location */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  الموقع
                </label>

                <button
                  type="button"
                  onClick={getLocation}
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 text-[#5A3825]"
                >
                  {location
                    ? 'تم تحديد الموقع'
                    : 'استخدم موقعي الحالي'}
                </button>

              </div>

              {/* Delivery Date */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  تاريخ التسليم
                </label>

                <input
                  type="date"
                  name="deliveryDate"
                  min={today}
                  value={formik.values.deliveryDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 outline-none"
                />

                {formik.touched.deliveryDate &&
                  formik.errors.deliveryDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.deliveryDate}
                    </p>
                  )}

              </div>

              {/* Delivery Time */}
              <div>

                <label className="block mb-1 text-sm text-[#2E1B12]">
                  وقت التسليم
                </label>

                <input
                  type="time"
                  name="deliveryTime"
                  value={formik.values.deliveryTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 outline-none"
                />

                {formik.touched.deliveryTime &&
                  formik.errors.deliveryTime && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.deliveryTime}
                    </p>
                  )}

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-1/2 border border-[#D8C9BC] text-[#5A3825] py-2.5 rounded-lg"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="w-1/2 bg-[#5A3825] text-white py-2.5 rounded-lg active:bg-[#3F271A]"
                >
                  تأكيد الطلب
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  )
}

