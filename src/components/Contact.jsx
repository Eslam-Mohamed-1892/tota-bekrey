import { useEffect, useState } from "react";
import { FiMapPin, FiPhone, FiMessageCircle } from "react-icons/fi";
import { supabase } from "../supabase";

export default function Contact() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("settings")
                .select("phone, whatsapp, location, map_url")
                .eq("id", 1)
                .single();

            if (error) {
                console.error(error);
                return;
            }

            setSettings(data);
        };

        fetchSettings();
    }, []);

    if (!settings) {
        return (
            <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 md:pb-20">
                <div className="max-w-6xl mx-auto px-5 text-center">
                    <p className="text-[#6B5A50]">
                        جاري تحميل بيانات التواصل...
                    </p>
                </div>
            </main>
        );
    }

    const whatsappNumber = settings.whatsapp.replace(/\D/g, "");

    const normalizedWhatsapp = whatsappNumber.startsWith("0")
        ? `20${whatsappNumber.slice(1)}`
        : whatsappNumber;

    const whatsappUrl = `https://wa.me/${normalizedWhatsapp}`;

    const locationLines = settings.location
        .split("\n")
        .filter((line) => line.trim() !== "");

    return (
        <main className="bg-[#F8F3EA] min-h-screen pt-24 pb-16 md:pb-20">

            <section>
                <div className="max-w-6xl mx-auto px-5">

                    {/* Heading */}
                    <div className="text-center mb-10 md:mb-12">

                        <p className="text-[#5A3825] font-medium mb-3">
                            مخبوزات توتا
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-[#2E1B12]">
                            تواصل معنا
                        </h1>

                        <p className="mt-4 text-[#6B5A50]">
                            يسعدنا تواصلك معنا
                        </p>

                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Address */}
                        <div className="bg-white rounded-xl p-6 text-center flex flex-col items-center">

                            <FiMapPin className="text-3xl text-[#5A3825]" />

                            <h2 className="mt-4 text-xl font-semibold text-[#2E1B12]">
                                العنوان
                            </h2>

                            <p className="mt-3 text-[#6B5A50] leading-relaxed">
                                {locationLines.map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        {index < locationLines.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>

                            <a
                                href={settings.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto pt-5 text-[#5A3825] font-medium active:text-[#3F271A]"
                            >
                                الموقع على الخريطة
                            </a>

                        </div>

                        {/* Phone */}
                        <div className="bg-white rounded-xl p-6 text-center flex flex-col items-center">

                            <FiPhone className="text-3xl text-[#5A3825]" />

                            <h2 className="mt-4 text-xl font-semibold text-[#2E1B12]">
                                الهاتف
                            </h2>

                            <a
                                href={`tel:${settings.phone}`}
                                className="mt-3 text-[#6B5A50] active:text-[#5A3825]"
                            >
                                {settings.phone}
                            </a>

                        </div>

                        {/* WhatsApp */}
                        <div className="bg-white rounded-xl p-6 text-center flex flex-col items-center">

                            <FiMessageCircle className="text-3xl text-[#5A3825]" />

                            <h2 className="mt-4 text-xl font-semibold text-[#2E1B12]">
                                واتساب
                            </h2>

                            <p className="mt-3 text-[#6B5A50]">
                                تواصل معنا مباشرة عبر واتساب
                            </p>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto pt-5"
                            >
                                <span className="inline-block bg-[#5A3825] text-white px-5 py-2.5 rounded-md active:bg-[#3F271A]">
                                    تواصل معنا
                                </span>
                            </a>

                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}