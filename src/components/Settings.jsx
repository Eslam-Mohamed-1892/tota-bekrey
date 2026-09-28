import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Settings({ onLogout }) {
    const [settings, setSettings] = useState({
        phone: "",
        whatsapp: "",
        location: "",
        map_url: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("settings")
                .select("*")
                .eq("id", 1)
                .single();

            if (error) {
                console.error(error);
                return;
            }

            setSettings({
                phone: data.phone || "",
                whatsapp: data.whatsapp || "",
                location: data.location || "",
                map_url: data.map_url || "",
            });

            setLoading(false);
        };

        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("settings")
            .update({
                phone: settings.phone,
                whatsapp: settings.whatsapp,
                location: settings.location,
                map_url: settings.map_url,
                updated_at: new Date().toISOString(),
            })
            .eq("id", 1);

        setSaving(false);

        if (error) {
            console.error(error);
            setMessage("حدث خطأ أثناء حفظ الإعدادات");
            return;
        }

        setMessage("تم حفظ الإعدادات بنجاح");
    };

    if (loading) {
        return (
            <section>
                <h2 className="text-2xl font-bold mb-6">
                    الإعدادات
                </h2>

                <p className="text-[#6B5A50]">
                    جاري تحميل الإعدادات...
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-2">
                الإعدادات
            </h2>

            <p className="text-[#6B5A50] mb-8">
                تعديل بيانات التواصل والموقع
            </p>

            <form
                onSubmit={handleSave}
                className="bg-white rounded-2xl p-6 space-y-6 max-w-3xl"
            >
                {/* Phone */}
                <div>
                    <label className="block mb-2 font-medium">
                        رقم الهاتف
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                        className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]"
                    />
                </div>

                {/* WhatsApp */}
                <div>
                    <label className="block mb-2 font-medium">
                        رقم الواتساب
                    </label>

                    <input
                        type="text"
                        name="whatsapp"
                        value={settings.whatsapp}
                        onChange={handleChange}
                        placeholder="مثال: 201028280847"
                        className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]"
                    />

                    <p className="text-sm text-[#6B5A50] mt-2">
                        يمكن كتابة الرقم بصيغة مصرية أو دولية
                    </p>
                </div>

                {/* Location */}
                <div>
                    <label className="block mb-2 font-medium">
                        العنوان
                    </label>

                    <textarea
                        name="location"
                        value={settings.location}
                        onChange={handleChange}
                        rows="4"
                        className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825] resize-none"
                    />

                    <p className="text-sm text-[#6B5A50] mt-2">
                        كل سطر سيظهر كسطر منفصل في صفحة التواصل
                    </p>
                </div>

                {/* Map URL */}
                <div>
                    <label className="block mb-2 font-medium">
                        رابط الموقع على الخريطة
                    </label>

                    <input
                        type="text"
                        name="map_url"
                        value={settings.map_url}
                        onChange={handleChange}
                        className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#5A3825] text-white px-6 py-3 rounded-lg active:bg-[#3F271A] disabled:opacity-60"
                    >
                        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                    </button>

                    {message && (
                        <p className="text-[#5A3825] text-sm">
                            {message}
                        </p>
                    )}
                </div>
            </form>

            {/* Logout inside Settings */}
            <div className="mt-8">
                <button
                    onClick={onLogout}
                    className="bg-[#8B4513] text-white px-6 py-3 rounded-lg active:bg-[#6F350F]"
                >
                    تسجيل الخروج
                </button>
            </div>
        </section>
    );
}