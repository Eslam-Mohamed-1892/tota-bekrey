import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase";

export default function Settings({ onLogout }) {
    const [settings, setSettings] = useState({
        phone: "",
        whatsapp: "",
        location: "",
        map_url: "",
        facebook_url: "",
    });

    const [paymentMethods, setPaymentMethods] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: settingsData, error: settingsError } =
                await supabase
                    .from("settings")
                    .select("*")
                    .eq("id", 1)
                    .single();

            if (settingsError) {
                console.error(settingsError);
                return;
            }

            const { data: paymentData, error: paymentError } =
                await supabase
                    .from("payment_methods")
                    .select("*")
                    .order("id");

            if (paymentError) {
                console.error(paymentError);
                return;
            }

            setSettings({
                phone: settingsData.phone || "",
                whatsapp: settingsData.whatsapp || "",
                location: settingsData.location || "",
                map_url: settingsData.map_url || "",
                facebook_url: settingsData.facebook_url || "",
            });

            setPaymentMethods(paymentData || []);

            setLoading(false);
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePaymentChange = (id, field, value) => {
        setPaymentMethods((prev) =>
            prev.map((method) =>
                method.id === id
                    ? {
                        ...method,
                        [field]: value,
                    }
                    : method
            )
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setSaving(true);

        const { error: settingsError } = await supabase
            .from("settings")
            .update({
                phone: settings.phone,
                whatsapp: settings.whatsapp,
                location: settings.location,
                map_url: settings.map_url,
                facebook_url: settings.facebook_url,
                updated_at: new Date().toISOString(),
            })
            .eq("id", 1);

        if (settingsError) {
            console.error(settingsError);
            setSaving(false);
            toast.error("حدث خطأ أثناء حفظ الإعدادات");
            return;
        }

        for (const method of paymentMethods) {
            const { error } = await supabase
                .from("payment_methods")
                .update({
                    is_active: method.is_active,
                    payment_number: method.payment_number,
                })
                .eq("id", method.id);

            if (error) {
                console.error(error);
                setSaving(false);
                toast.error("حدث خطأ أثناء حفظ طرق الدفع");
                return;
            }
        }

        setSaving(false);
        toast.success("تم حفظ الإعدادات بنجاح");
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
                تعديل بيانات التواصل وطرق الدفع
            </p>

            <form
                onSubmit={handleSave}
                className="space-y-8 max-w-3xl"
            >

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-2">
                        طرق الدفع
                    </h3>

                    <p className="text-[#6B5A50] text-sm mb-6">
                        التحكم في ظهور طرق الدفع ورقم التحويل
                    </p>

                    <div className="space-y-5">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className="border border-[#E5D9CC] rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">
                                            {method.name}
                                        </p>

                                        <p className="text-sm text-[#6B5A50] mt-1">
                                            {method.is_active
                                                ? "ظاهرة للعملاء"
                                                : "مخفية عن العملاء"}
                                        </p>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={method.is_active}
                                            onChange={(e) =>
                                                handlePaymentChange(
                                                    method.id,
                                                    "is_active",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-5 h-5 accent-[#5A3825]"
                                        />

                                        <span className="text-sm">
                                            إظهار
                                        </span>
                                    </label>
                                </div>

                                {method.code !== "cash_on_delivery" && (
                                    <div className="mt-4">
                                        <label className="block mb-2 text-sm font-medium">
                                            رقم التحويل
                                        </label>

                                        <input
                                            type="text"
                                            value={method.payment_number || ""}
                                            onChange={(e) =>
                                                handlePaymentChange(
                                                    method.id,
                                                    "payment_number",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="رقم الموبايل"
                                            className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Settings */}
                <div className="bg-white rounded-2xl p-6 space-y-6">
                    <h3 className="text-xl font-bold">
                        بيانات التواصل
                    </h3>

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

                    {/* Facebook */}
                    <div>
                        <label className="block mb-2 font-medium">
                            رابط صفحة Facebook
                        </label>

                        <input
                            type="text"
                            name="facebook_url"
                            value={settings.facebook_url}
                            onChange={handleChange}
                            placeholder="https://www.facebook.com/..."
                            className="w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]"
                        />
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

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#5A3825] text-white px-6 py-3 rounded-lg active:bg-[#3F271A] disabled:opacity-60"
                        >
                            {saving
                                ? "جاري الحفظ..."
                                : "حفظ الإعدادات"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Logout */}
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