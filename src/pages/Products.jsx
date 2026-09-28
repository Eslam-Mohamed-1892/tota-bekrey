import { useState } from 'react'

export default function Products({ products, setCart }) {
  const [quantities, setQuantities] = useState({})

  const increaseQuantity = (product) => {
    setQuantities((prev) => {
      const currentQuantity =
        prev[product.id] || (product.sale_type === 'piece' ? 1 : 0.5)

      const step = product.sale_type === 'piece' ? 1 : 0.5

      return {
        ...prev,
        [product.id]: currentQuantity + step,
      }
    })
  }

  const decreaseQuantity = (product) => {
    setQuantities((prev) => {
      const currentQuantity =
        prev[product.id] || (product.sale_type === 'piece' ? 1 : 0.5)

      const step = product.sale_type === 'piece' ? 1 : 0.5

      return {
        ...prev,
        [product.id]: Math.max(
          currentQuantity - step,
          product.sale_type === 'piece' ? 1 : 0.5
        ),
      }
    })
  }

  const addToCart = (product) => {
    const quantity =
      quantities[product.id] ||
      (product.sale_type === 'piece' ? 1 : 0.5)

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id
      )

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          sale_type: product.sale_type,
        },
      ]
    })
  }

  return (
    <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 md:pb-20">

      <section>
        <div className="max-w-6xl mx-auto px-5 m-10">

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
              const quantity =
                quantities[product.id] ||
                (product.sale_type === 'piece' ? 1 : 0.5)

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
                        {product.price} جنيه /{' '}
                        {product.sale_type === 'piece'
                          ? 'قطعة'
                          : 'كجم'}
                      </span>

                    </div>

                    {/* Total + Counter */}
                    <div className="mt-auto pt-6 mb-2">

                      <div className="flex items-center justify-between gap-4">

                        {/* Counter */}
                        <div className="flex items-center border border-[#D8C9BC] rounded-md overflow-hidden shrink-0">

                          <button
                            type="button"
                            onClick={() => decreaseQuantity(product)}
                            className="px-3 py-1.5 text-[#5A3825] active:bg-[#F8F3EA]"
                          >
                            -
                          </button>

                          <span className="px-3 py-1.5 text-[#2E1B12]">
                            {quantity}
                          </span>

                          <button
                            type="button"
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

                    {/* Cart Button */}
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-5 w-full bg-[#5A3825] text-white py-2.5 rounded-md active:bg-[#3F271A]"
                    >
                      أضف للسلة
                    </button>

                  </div>

                </article>
              )
            })}

          </div>

        </div>
      </section>

    </main>
  )
}

