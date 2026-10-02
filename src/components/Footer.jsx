import { FaFacebookF, FaWhatsapp } from "react-icons/fa"

export default function Footer({ settings }) {
  return (
    <footer className="bg-[#5A3825] text-white">

      <div className="max-w-6xl mx-auto px-5 py-8">

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand */}
          <div className="text-center md:text-right">

            <h2 className="text-xl md:text-2xl font-semibold">
              مخبوزات توتا
            </h2>

            <p className="mt-2 text-sm text-white/80">
              مخبوزات بيتي بطعم مميز
            </p>

          </div>


          {/* Mini Contact */}
          <div className="text-center md:text-right">

            <h3 className="font-semibold mb-3">
              تواصل معنا
            </h3>

            {settings?.location && (
              <p className="text-sm text-white/80 whitespace-pre-line">
                {settings.location}
              </p>
            )}

            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">

              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                >
                  <FaFacebookF />
                </a>
              )}

              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                >
                  <FaWhatsapp />
                </a>
              )}

            </div>

          </div>

        </div>


        {/* Copyright */}
        <div className="border-t border-white/20 mt-6 pt-5 text-center">

          <p className="text-sm text-white/70">
            © 2026 مخبوزات توتا. جميع الحقوق محفوظة.
          </p>

        </div>

      </div>

    </footer>
  )
}