import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../supabase'

export default function AdminProducts({ products, setProducts }) {
    const [imagePreview, setImagePreview] = useState('')
    const [editImagePreview, setEditImagePreview] = useState('')

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        sale_type: 'kg',
    })

    const [editProduct, setEditProduct] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        sale_type: 'kg',
    })

    const [modalType, setModalType] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)

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
            sale_type: product.sale_type,
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
        try {
            let imageUrl = ''

            const imageFile = newProduct.image

            if (imageFile instanceof File) {
                const filePath = `${Date.now()}.jpg`

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile)

                if (uploadError) {
                    console.log('Image upload error:', uploadError)
                    toast.error(uploadError.message)
                    return
                }

                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath)

                imageUrl = publicUrlData.publicUrl
            }

            const product = {
                id: Date.now(),
                name: newProduct.name,
                description: newProduct.description,
                price: Number(newProduct.price),
                sale_type: newProduct.sale_type,
                image: imageUrl,
            }

            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()

            if (error) {
                console.log('Error adding product:', error)
                toast.error(error.message)
                return
            }

            setProducts((prev) => [...prev, data[0]])

            setNewProduct({
                name: '',
                description: '',
                price: '',
                image: '',
                sale_type: 'kg',
            })

            setImagePreview('')
            closeModal()

            toast.success('تم إضافة المنتج بنجاح')
        } catch (error) {
            console.log('Add product error:', error)
            toast.error('حدث خطأ أثناء إضافة المنتج')
        }
    }

    const updateProduct = async () => {
        try {
            let imageUrl = editProduct.image

            const imageFile = editProduct.image

            if (imageFile instanceof File) {
                const filePath = `${Date.now()}.jpg`

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile)

                if (uploadError) {
                    console.log('Image upload error:', uploadError)
                    toast.error(uploadError.message)
                    return
                }

                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath)

                imageUrl = publicUrlData.publicUrl
            }

            const { data, error } = await supabase
                .from('products')
                .update({
                    name: editProduct.name,
                    description: editProduct.description,
                    price: Number(editProduct.price),
                    image: imageUrl,
                    sale_type: editProduct.sale_type,
                })
                .eq('id', selectedProduct.id)
                .select()

            if (error) {
                console.log('Error updating product:', error)
                toast.error(error.message)
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

            toast.success('تم حفظ التغييرات بنجاح')
        } catch (error) {
            console.log('Update product error:', error)
            toast.error('حدث خطأ أثناء حفظ التغييرات')
        }
    }

    const deleteProduct = async () => {
        try {
            if (selectedProduct?.image) {
                const imageUrl = selectedProduct.image
                const marker = '/storage/v1/object/public/products/'

                if (imageUrl.includes(marker)) {
                    const filePath = imageUrl.split(marker)[1]

                    const { error: storageError } = await supabase.storage
                        .from('products')
                        .remove([filePath])

                    if (storageError) {
                        console.log(
                            'Storage delete error:',
                            storageError
                        )
                    }
                }
            }

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', selectedProduct.id)

            if (error) {
                console.log('Error deleting product:', error)
                toast.error(error.message)
                return
            }

            setProducts((prev) =>
                prev.filter(
                    (product) => product.id !== selectedProduct.id
                )
            )

            closeModal()

            toast.success('تم حذف المنتج بنجاح')
        } catch (error) {
            console.log('Delete product error:', error)
            toast.error('حدث خطأ أثناء حذف المنتج')
        }
    }

    return (
        <section className='overflow-hidden'>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">
                            المنتجات
                        </h2>

                        <p className="text-[#6B5A50] mt-1">
                            إدارة المنتجات وإضافة وتعديل وحذف المنتجات.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto bg-[#5A3825] text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
                    >
                        إضافة منتج
                    </button>
                </div>

                {/* Products Count */}
                <div className="mt-6 bg-white border border-[#E8DED2] rounded-2xl p-5">
                    <p className="text-sm text-[#6B5A50]">
                        إجمالي المنتجات
                    </p>

                    <p className="text-3xl font-bold text-[#5A3825] mt-2">
                        {products.length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#E8DED2] flex flex-col"
                    >
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                        )}

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold">
                                {product.name}
                            </h3>

                            <p className="text-[#6B5A50] text-sm mt-2">
                                {product.description}
                            </p>

                            <p className="text-[#5A3825] font-bold mt-4">
                                {product.price} جنيه /{' '}
                                {product.sale_type === 'piece' ? 'قطعة' : 'كجم'}
                            </p>

                            <div className="flex gap-3 mt-auto pt-5">
                                <button
                                    onClick={() =>
                                        openEditModal(product)
                                    }
                                    className="flex-1 border border-[#5A3825] text-[#5A3825] py-2 rounded-xl hover:bg-[#F8F3EA] transition"
                                >
                                    تعديل
                                </button>

                                <button
                                    onClick={() =>
                                        openDeleteModal(product)
                                    }
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl hover:bg-red-100 transition"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {modalType === 'add' && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">
                                إضافة منتج
                            </h3>

                            <button
                                onClick={closeModal}
                                className="text-2xl text-[#6B5A50]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="اسم المنتج"
                                value={newProduct.name}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />

                            <textarea
                                placeholder="وصف المنتج"
                                value={newProduct.description}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                                rows="3"
                            />

                            <input
                                type="number"
                                placeholder="السعر"
                                value={newProduct.price}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        price: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />

                            <div>
                                <p className="text-sm font-medium mb-2">
                                    طريقة البيع
                                </p>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sale_type"
                                            value="kg"
                                            checked={newProduct.sale_type === 'kg'}
                                            onChange={(e) =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    sale_type: e.target.value,
                                                })
                                            }
                                        />
                                        <span>بالكيلو</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sale_type"
                                            value="piece"
                                            checked={newProduct.sale_type === 'piece'}
                                            onChange={(e) =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    sale_type: e.target.value,
                                                })
                                            }
                                        />
                                        <span>بالقطعة</span>
                                    </label>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0]

                                    setNewProduct({
                                        ...newProduct,
                                        image: file,
                                    })

                                    if (file) {
                                        setImagePreview(
                                            URL.createObjectURL(file)
                                        )
                                    }
                                }}
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="معاينة"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                            )}

                            <button
                                onClick={addProduct}
                                className="w-full bg-[#5A3825] text-white py-3 rounded-xl hover:opacity-90 transition"
                            >
                                إضافة المنتج
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {modalType === 'edit' && selectedProduct && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">
                                تعديل المنتج
                            </h3>

                            <button
                                onClick={closeModal}
                                className="text-2xl text-[#6B5A50]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="اسم المنتج"
                                value={editProduct.name}
                                onChange={(e) =>
                                    setEditProduct({
                                        ...editProduct,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />

                            <textarea
                                placeholder="وصف المنتج"
                                value={editProduct.description}
                                onChange={(e) =>
                                    setEditProduct({
                                        ...editProduct,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                                rows="3"
                            />

                            <input
                                type="number"
                                placeholder="السعر"
                                value={editProduct.price}
                                onChange={(e) =>
                                    setEditProduct({
                                        ...editProduct,
                                        price: e.target.value,
                                    })
                                }
                                className="w-full border border-[#E8DED2] rounded-xl px-4 py-3 outline-none focus:border-[#5A3825]"
                            />

                            <div>
                                <p className="text-sm font-medium mb-2">
                                    طريقة البيع
                                </p>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="edit_sale_type"
                                            value="kg"
                                            checked={editProduct.sale_type === 'kg'}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    sale_type: e.target.value,
                                                })
                                            }
                                        />
                                        <span>بالكيلو</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="edit_sale_type"
                                            value="piece"
                                            checked={editProduct.sale_type === 'piece'}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    sale_type: e.target.value,
                                                })
                                            }
                                        />
                                        <span>بالقطعة</span>
                                    </label>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0]

                                    setEditProduct({
                                        ...editProduct,
                                        image: file,
                                    })

                                    if (file) {
                                        setEditImagePreview(
                                            URL.createObjectURL(file)
                                        )
                                    }
                                }}
                                className="w-full"
                            />

                            {editImagePreview && (
                                <img
                                    src={editImagePreview}
                                    alt="معاينة"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                            )}

                            <button
                                onClick={updateProduct}
                                className="w-full bg-[#5A3825] text-white py-3 rounded-xl hover:opacity-90 transition"
                            >
                                حفظ التعديلات
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {modalType === 'delete' && selectedProduct && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6">
                        <h3 className="text-xl font-bold">
                            حذف المنتج
                        </h3>

                        <p className="text-[#6B5A50] mt-3">
                            هل أنت متأكد من حذف "{selectedProduct.name}"؟
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 border border-[#E8DED2] py-3 rounded-xl"
                            >
                                إلغاء
                            </button>

                            <button
                                onClick={deleteProduct}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}