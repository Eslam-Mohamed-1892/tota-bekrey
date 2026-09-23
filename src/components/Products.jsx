import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from "yup";
import { supabase } from '../supabase'

export default function Products({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [location, setLocation] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const increaseQuantity = (product) => {
    setQuantities((prev) => {
      const currentQuantity = prev[product.id] || 0.5

      return {
        ...prev,
        [product.id]: currentQuantity + 0.5,
      }
    })
  }

  const decreaseQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0.5) - 0.5, 0.5),
    }))
  }

  const openOrderModal = (product) => {
    const quantity = quantities[product.id] || 0.5
    const total = product.price * quantity

    setSelectedProduct({
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: total,
    })
  }

  const confirmOrder = async (values) => {
    const { error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: values.name,
          phone: values.phone,
          address: values.address,
          delivery_date: values.deliveryDate,
          delivery_time: values.deliveryTime,
          total_price: selectedProduct.total,
          items: [
            {
              name: selectedProduct.name,
              price: selectedProduct.price,
              quantity: selectedProduct.quantity,
            },
          ],
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

    const message = `مرحبًا، أريد تأكيد طلب

بيانات الطلب:
المنتج: ${selectedProduct.name}
الكمية: ${selectedProduct.quantity} كجم
السعر: ${selectedProduct.price} جنيه / كجم
الإجمالي: ${selectedProduct.total} جنيه

بيانات العميل:
الاسم: ${values.name}
رقم الهاتف: ${values.phone}
العنوان: ${values.address}
تاريخ التسليم: ${values.deliveryDate}
وقت التسليم: ${values.deliveryTime}
${location ? `الموقع على الخريطة: ${mapsUrl}` : ''}

شكرًا لكم`

    const whatsappNumber = '201050838177'

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')

    setSelectedProduct(null)
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
      deliveryDate: Yup.string().required('تاريخ التسليم مطلوب'),
      deliveryTime: Yup.string().required('وقت التسليم مطلوب'),
    }),

    onSubmit: (values) => {
      confirmOrder(values)
    },
  })

  return (
    <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 md:pb-20">
      <section>
        <div className="max-w-6xl mx-auto px-5">

          {/* Heading */}
          <div className="text-center mb-10 md:mb-12">
            <p className="text-[#5A3825] font-medium mb-3">
              مخبوزات توتة
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#2E1B12]">
              المنيو
            </h1>

            <p className="mt-4 text-[#6B5A50]">
              اختار المخبوزات المفضلة لديك
            </p>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => {
              const quantity = quantities[product.id] || 0.5

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden flex flex-col"
                >

                  {/* Image */}
                  <div className="h-56 bg-[#EDE3D6]">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">

                    <h2 className="text-xl font-semibold text-[#2E1B12]">
                      {product.name}
                    </h2>

                    <p className="mt-2 mb-2 text-[#6B5A50] leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5A3825] whitespace-nowrap">
                        {product.price} جنيه / كجم
                      </span>
                    </div>

                    {/* Total + Counter */}
                    <div className="mt-auto pt-6 mb-2">
                      <div className="flex items-center justify-between gap-4">

                        {/* Counter */}
                        <div className="flex items-center border border-[#D8C9BC] rounded-md overflow-hidden shrink-0">

                          <button
                            onClick={() => decreaseQuantity(product.id)}
                            className="px-3 py-1.5 text-[#5A3825] active:bg-[#F8F3EA]"
                          >
                            -
                          </button>

                          <span className="px-3 py-1.5 text-[#2E1B12]">
                            {quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(product)}
                            className="px-3 py-1.5 text-[#5A3825] active:bg-[#F8F3EA]"
                          >
                            +
                          </button>

                        </div>

                        {/* Total Price */}
                        <p className="mt-4 text-[#2E1B12] font-medium -translate-y-2.5">
                          الإجمالي: {product.price * quantity} جنيه
                        </p>

                      </div>
                    </div>

                    <p className="mt-4 text-sm text-[#6B5A50]">
                      يتم تحضير المنتج بعد تأكيد الطلب
                    </p>

                    {/* Order Button */}
                    <button
                      onClick={() => openOrderModal(product)}
                      className="mt-5 w-full bg-[#5A3825] text-white py-2.5 rounded-md active:bg-[#3F271A]"
                    >
                      اطلب الآن
                    </button>

                  </div>
                </article>
              )
            })}

          </div>
        </div>
      </section>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">

          <form
            onSubmit={formik.handleSubmit}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6"
          >

            <h2 className="text-2xl font-semibold text-[#2E1B12]">
              بيانات الطلب
            </h2>

            {/* Product Info */}
            <div className="mt-6 bg-[#F8F3EA] rounded-md p-4">

              <h3 className="font-semibold text-[#2E1B12]">
                {selectedProduct.name}
              </h3>

              <p className="mt-2 text-[#6B5A50]">
                الكمية: {selectedProduct.quantity} كجم
              </p>

              <p className="mt-1 text-[#6B5A50]">
                السعر: {selectedProduct.price} جنيه / كجم
              </p>

              <p className="mt-1 font-semibold text-[#5A3825]">
                الإجمالي: {selectedProduct.total} جنيه
              </p>

            </div>

            {/* User Data */}
            <div className="mt-6 space-y-4">

              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="الاسم"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                />

                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                />

                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="العنوان بالتفصيل"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                />

                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              {/* Location */}
              <button
                type="button"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      })
                    },
                    () => {
                      alert('لم نتمكن من تحديد موقعك')
                    }
                  )
                }}
                className="w-full border border-[#D8C9BC] text-[#5A3825] py-2.5 rounded-md active:bg-[#F8F3EA]"
              >
                {location ? '✓ تم تحديد موقعك' : '📍 استخدام موقعي الحالي'}
              </button>

              {/* Delivery Date */}
              <div>
                <input
                  type="date"
                  name="deliveryDate"
                  min={today}
                  value={formik.values.deliveryDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                />

                {formik.touched.deliveryDate &&
                  formik.errors.deliveryDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.deliveryDate}
                    </p>
                  )}
              </div>

              {/* Delivery Time */}
              <div>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formik.values.deliveryTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                />

                {formik.touched.deliveryTime &&
                  formik.errors.deliveryTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.deliveryTime}
                    </p>
                  )}
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null)
                  setLocation(null)
                  formik.resetForm()
                }}
                className="px-5 py-2.5 text-[#5A3825] active:text-[#3F271A]"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="bg-[#5A3825] text-white px-5 py-2.5 rounded-md active:bg-[#3F271A]"
              >
                تأكيد الطلب
              </button>

            </div>

          </form>

        </div>
      )}
    </main>
  )
}