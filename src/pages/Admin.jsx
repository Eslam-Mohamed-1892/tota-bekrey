import { useEffect, useState } from 'react'
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


export default function Admin({ products, setProducts }) {
  const [imagePreview, setImagePreview] = useState('')
  const [editImagePreview, setEditImagePreview] = useState('')
  const [ordersCount, setOrdersCount] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [reportOrders, setReportOrders] = useState(0)
  const [reportSales, setReportSales] = useState(0)
  const [monthlySales, setMonthlySales] = useState([])

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
  })

  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
  })

  const [modalType, setModalType] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    const getOrders = async () => {
      const now = new Date()

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )

      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      )

      const { data, error } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', startOfNextMonth.toISOString())

      if (error) {
        console.log('Error loading orders:', error)
        return
      }

      setOrdersCount(data.length)

      const sales = data.reduce(
        (total, order) => total + Number(order.total_price),
        0
      )

      setTotalSales(sales)
    }

    getOrders()
  }, [])

  useEffect(() => {
    if (!selectedMonth) {
      setReportOrders(0)
      setReportSales(0)
      return
    }

    const getMonthlyReport = async () => {
      const [year, month] = selectedMonth.split('-')

      const startOfMonth = new Date(
        Number(year),
        Number(month) - 1,
        1
      )

      const startOfNextMonth = new Date(
        Number(year),
        Number(month),
        1
      )

      const { data, error } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', startOfNextMonth.toISOString())

      if (error) {
        console.log('Error loading monthly report:', error)
        return
      }

      setReportOrders(data.length)

      const sales = data.reduce(
        (total, order) => total + Number(order.total_price),
        0
      )

      setReportSales(sales)
    }

    getMonthlyReport()
  }, [selectedMonth])
  useEffect(() => {
    const getMonthlySales = async () => {
      const now = new Date()

      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1
      )

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      )

      const { data, error } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())

      if (error) {
        console.log('Error loading monthly sales:', error)
        return
      }

      const months = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 11 + index,
          1
        )

        return {
          year: date.getFullYear(),
          month: date.getMonth(),
          label: date.toLocaleDateString('ar-EG', {
            month: 'short',
          }),
          sales: 0,
        }
      })

      data.forEach((order) => {
        const date = new Date(order.created_at)

        const monthData = months.find(
          (item) =>
            item.year === date.getFullYear() &&
            item.month === date.getMonth()
        )

        if (monthData) {
          monthData.sales += Number(order.total_price)
        }
      })

      setMonthlySales(months)
    }

    getMonthlySales()
  }, [])

  const months = Array.from({ length: 12 }, (_, index) => {
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
  })

  const openAddModal = () => {
    setSelectedProduct(null)
    setModalType('add')
  }

  const openEditModal = (product) => {
    setSelectedProduct(product)

    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    })

    setEditImagePreview(product.image)

    setModalType('edit')
  }
  const openDeleteModal = (product) => {
    setSelectedProduct(product)
    setModalType('delete')
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedProduct(null)
    setImagePreview('')
  }
  const addProduct = async () => {
    const imageFile = newProduct.image

    let imageUrl = ''

    if (imageFile) {
      const filePath = `${Date.now()}-${imageFile.name}`

      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.log('Error uploading image:', uploadError)
        return
      }

      const { data: imageData } = supabase
        .storage
        .from('products')
        .getPublicUrl(filePath)

      imageUrl = imageData.publicUrl
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      image: imageUrl,
    }
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()

    console.log('Added product:', data)

    if (error) {
      console.log('Error adding product:', error)
      return
    }

    setProducts((prev) => [...prev, data[0]])


    setNewProduct({
      name: '',
      description: '',
      price: '',
      image: '',
    })
    setImagePreview('')

    closeModal()
  }

  const updateProduct = async () => {
    let imageUrl = editProduct.image

    if (editProduct.image instanceof File) {
      const filePath = `${Date.now()}.jpg`

      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(filePath, editProduct.image)

      if (uploadError) {
        console.log('Error uploading image:', uploadError)
        alert(uploadError.message)
        return
      }

      const { data: imageData } = supabase
        .storage
        .from('products')
        .getPublicUrl(filePath)

      imageUrl = imageData.publicUrl
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: editProduct.name,
        description: editProduct.description,
        price: Number(editProduct.price),
        image: imageUrl,
      })
      .eq('id', selectedProduct.id)
      .select()

    if (error) {
      console.log('Error updating product:', error)
      alert(error.message)
      return
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id
          ? data[0]
          : product
      )
    )

    closeModal()
  }
  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log('Logout error:', error)
      return
    }
  }
  const deleteProduct = async () => {
    if (selectedProduct.image) {
      const imageUrl = selectedProduct.image

      const filePath =
        imageUrl.split('/storage/v1/object/public/products/')[1]

      console.log('Deleting image:', filePath)

      const { data: imageData, error: imageError } = await supabase
        .storage
        .from('products')
        .remove([filePath])

      console.log('Delete result:', imageData)
      console.log('Delete error:', imageError)

      if (imageError) {
        console.log('Error deleting image:', imageError)
        alert(imageError.message)
        return
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', selectedProduct.id)

    if (error) {
      console.log('Error deleting product:', error)
      alert(error.message)
      return
    }

    setProducts((prev) =>
      prev.filter((product) => product.id !== selectedProduct.id)
    )

    closeModal()
  }


  return (
    <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16">

      <div className="max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="mb-10">

          <p className="text-[#5A3825] font-medium mb-2">
            مخبوزات توتة
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#2E1B12]">
            لوحة التحكم
          </h1>

          <p className="mt-3 text-[#6B5A50]">
            إدارة المنتجات والطلبات
          </p>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-xl p-6">
            <p className="text-[#6B5A50]">
              عدد المنتجات
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2E1B12]">
              {products.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <p className="text-[#6B5A50]">
              الطلبات
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2E1B12]">
              {ordersCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <p className="text-[#6B5A50]">
              إجمالي المبيعات
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2E1B12]">
              {totalSales} جنيه
            </p>
          </div>
        </div>

        {/* Sales Reports */}
        <section className="bg-white rounded-xl p-6 mb-10">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <h2 className="text-2xl font-semibold text-[#2E1B12]">
                تقارير المبيعات
              </h2>

              <p className="mt-2 text-[#6B5A50]">
                اختر شهرًا لعرض تقرير المبيعات
              </p>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-[#D8C9BC] rounded-md px-4 py-3 outline-none text-[#2E1B12]"
            >
              <option value="">
                اختر الشهر
              </option>

              {months.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

              <div className="bg-[#F8F3EA] rounded-lg p-5">
                <p className="text-[#6B5A50]">
                  عدد الطلبات
                </p>

                <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                  {reportOrders}
                </p>
              </div>

              <div className="bg-[#F8F3EA] rounded-lg p-5">
                <p className="text-[#6B5A50]">
                  إجمالي المبيعات
                </p>

                <p className="mt-2 text-2xl font-bold text-[#2E1B12]">
                  {reportSales} جنيه
                </p>
              </div>

            </div>

          </div>

        </section>
        {/* Sales Chart */}
        <section className="bg-white rounded-xl p-6 mb-10">

          <h2 className="text-2xl font-semibold text-[#2E1B12]">
            المبيعات خلال آخر 12 شهر
          </h2>

          <p className="mt-2 text-[#6B5A50]">
            متابعة إجمالي المبيعات حسب الشهر
          </p>

          <div className="mt-8 w-full h-64 sm:h-80">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySales}
                margin={{
                  top: 10,
                  right: 10,
                  left: -30,
                  bottom: 5,
                }}
              >

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
                  formatter={(value) => [`${value} جنيه`, 'المبيعات']}
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

        {/* Products */}
        <section className="bg-white rounded-xl p-6">

          <div className="flex items-center justify-between gap-4 mb-6">

            <h2 className="text-2xl font-semibold text-[#2E1B12]">
              المنتجات
            </h2>

            <button
              onClick={openAddModal}
              className="bg-[#5A3825] text-white px-5 py-2.5 rounded-md active:bg-[#3F271A]"
            >
              إضافة منتج
            </button>

          </div>

          <div className="space-y-4">

            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 border-b border-[#E8DDD2] pb-4"
              >

                <div className='flex flex-col gap-4'>
                  <h3 className="font-semibold text-[#2E1B12]">
                    {product.name}
                  </h3>

                  <p className="text-sm text-[#6B5A50]">
                    {product.description}
                  </p>

                  <p className="text-sm text-[#6B5A50]">
                    {product.price} جنيه / كجم
                  </p>
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-[#EDE3D6] shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#6B5A50]">
                        لا توجد صورة
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() => openEditModal(product)}
                    className="text-[#5A3825] active:text-[#3F271A]"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => openDeleteModal(product)}
                    className="text-red-700 active:text-red-900"
                  >
                    حذف
                  </button>

                </div>

              </div>
            ))}

          </div>

        </section>
        <button
          onClick={logout}
          className="px-4 py-2 bg-[#5A3825] text-white rounded-lg mt-10"
        >
          Logout
        </button>

      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">

          <div className="bg-white w-full max-w-lg rounded-xl p-6">

            {/* Add */}
            {modalType === 'add' && (
              <>
                <h2 className="text-2xl font-semibold text-[#2E1B12]">
                  إضافة منتج
                </h2>

                <div className="mt-6 space-y-4">

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                      })
                    }
                    placeholder="اسم المنتج"
                  />

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                    type="text"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="وصف المنتج"
                  />

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"

                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: e.target.value,
                      })
                    }
                    placeholder="السعر"
                  />

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]

                      setNewProduct({
                        ...newProduct,
                        image: file,
                      })

                      if (file) {
                        setImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">

                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 text-[#5A3825] active:text-[#3F271A]"
                  >
                    إلغاء
                  </button>

                  <button
                    onClick={addProduct}
                    className="bg-[#5A3825] text-white px-5 py-2.5 rounded-md active:bg-[#3F271A]"
                  >
                    إضافة المنتج
                  </button>

                </div>
              </>
            )}

            {/* Edit */}
            {modalType === 'edit' && selectedProduct && (
              <>
                <h2 className="text-2xl font-semibold text-[#2E1B12]">
                  تعديل المنتج
                </h2>

                <div className="mt-6 space-y-4">

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3"

                    type="text"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        name: e.target.value,
                      })
                    }
                    placeholder="اسم المنتج"
                  />

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3"
                    type="text"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="وصف المنتج"
                  />

                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3"

                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: e.target.value,
                      })
                    }
                    placeholder="السعر"
                  />
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-[#EDE3D6]">
                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt={editProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#6B5A50]">
                        لا توجد صورة
                      </div>
                    )}
                  </div>
                  <input
                    className="w-full border border-[#D8C9BC] rounded-md px-4 py-3 outline-none"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0]

                      if (!file) return

                      setEditProduct({
                        ...editProduct,
                        image: file,
                      })

                      setEditImagePreview(URL.createObjectURL(file))
                    }} />

                </div>

                <div className="flex justify-end gap-3 mt-6">

                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 text-[#5A3825] active:text-[#3F271A]"
                  >
                    إلغاء
                  </button>

                  <button
                    onClick={updateProduct}
                    className="bg-[#5A3825] text-white px-5 py-2.5 rounded-md active:bg-[#3F271A]"
                  >
                    حفظ التغييرات
                  </button>

                </div>
              </>
            )}

            {/* Delete */}
            {modalType === 'delete' && selectedProduct && (
              <>
                <h2 className="text-2xl font-semibold text-[#2E1B12]">
                  حذف المنتج
                </h2>

                <div className="mt-6 bg-[#F8F3EA] rounded-md p-4">

                  <h3 className="font-semibold text-[#2E1B12]">
                    {selectedProduct.name}
                  </h3>

                  <p className="mt-2 text-[#6B5A50]">
                    السعر: {selectedProduct.price} جنيه / كجم
                  </p>

                </div>

                <p className="mt-5 text-[#6B5A50]">
                  هل أنت متأكد أنك تريد حذف هذا المنتج؟
                </p>

                <div className="flex justify-end gap-3 mt-6">

                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 text-[#5A3825] active:text-[#3F271A]"
                  >
                    إلغاء
                  </button>

                  <button
                    onClick={deleteProduct}
                    className="bg-red-700 text-white px-5 py-2.5 rounded-md active:bg-red-900"
                  >
                    حذف المنتج
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </main>
  )
}