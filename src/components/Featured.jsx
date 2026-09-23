import { Link } from 'react-router-dom'

const products = [
  {
    id: 1,
    name: 'كرواسون',
    description: 'هش وخفيف بطعم الزبدة',
    price: 60,
  },
  {
    id: 2,
    name: 'سينابون',
    description: 'طري وغني بالقرفة',
    price: 70,
  },
  {
    id: 3,
    name: 'كوكيز',
    description: 'مخبوز طازج برقائق الشوكولاتة',
    price: 50,
  },
]

export default function Featured() {
  return (
    <section className="bg-[#F8F3EA] py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-5">

        <div className="text-center mb-10 md:mb-12">

          <p className="text-[#5A3825] font-medium mb-3">
            اختيارات توتة
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#2E1B12]">
            المخبوزات المميزة
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {products.map((product) => (
            <article
              key={product.id}
              className="bg-white rounded-xl overflow-hidden flex flex-col"
            >

              <div className="h-56 bg-[#EDE3D6]">
                {/* صورة المنتج */}
              </div>

              <div className="p-6 flex flex-col flex-1">

                <h3 className="text-xl font-semibold text-[#2E1B12]">
                  {product.name}
                </h3>

                <p className="mt-2 text-[#6B5A50]">
                  {product.description}
                </p>

                <div className="mt-auto pt-5 flex items-center justify-between">

                  <span className="font-semibold text-[#5A3825]">
                    {product.price} جنيه
                  </span>

                  <Link
                    to="/products"
                    className="bg-[#5A3825] text-white px-4 py-2 rounded-md active:bg-[#3F271A]"
                  >
                    اكتشف المنيو
                  </Link>

                </div>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  )
}