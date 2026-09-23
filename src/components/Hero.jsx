import heroImage from '../assets/images/hero/hero1.jpg'

export default function Hero() {
  return (
    <section className="bg-[#F8F3EA] min-h-[80vh] flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-5 py-16 w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Image */}
          <div>
            <img
              src={heroImage}
              alt="Fresh baked goods"
              className="w-full h-105 object-cover rounded-2xl"
            />
          </div>

          {/* Content */}
          <div className="max-w-xl">
            <p className="text-[#5A3825] font-medium mb-3">
              مخبوزات توتة
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2E1B12] leading-tight">
              طعم البيت في كل قطعة
            </h1>

            <p className="mt-5 text-[#6B5A50] text-lg leading-relaxed">
              مخبوزات طازجة تُحضّر بحب، لتستمتع بطعم بسيط ولذيذ في كل مرة.
            </p>

            <button className="mt-8 bg-[#5A3825] text-white px-6 py-3 rounded-md active:bg-[#3F271A]">
              اكتشف المخبوزات
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}