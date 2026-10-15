import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase, adminSupabase } from "../supabase";

const WEEK_DAYS = [
    { id: 0, name: "الأحد" },
    { id: 1, name: "الاثنين" },
    { id: 2, name: "الثلاثاء" },
    { id: 3, name: "الأربعاء" },
    { id: 4, name: "الخميس" },
    { id: 5, name: "الجمعة" },
    { id: 6, name: "السبت" },
];

const DEFAULT_HOURS = {
    open_time: "08:00",
    close_time: "20:00",
    closed_days: [],
};

const inputClass =
    "w-full border border-[#E5D9CC] rounded-lg px-4 py-3 outline-none focus:border-[#5A3825]";

export default function Settings({ onLogout }) {
    const [settings, setSettings] = useState({
        phone: "",
        whatsapp: "",
        location: "",
        map_url: "",
        facebook_url: "",
    });

    const [paymentMethods, setPaymentMethods] = useState([]);

    const [admin, setAdmin] = useState({
        username: "",
        email: "",
    });

    const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            try {
                const [
                    settingsResult,
                    paymentResult,
                    hoursResult,
                    adminResult,
                ] = await Promise.all([
                    adminSupabase
                        .from("settings")
                        .select("*")
                        .eq("id", 1)
                        .single(),

                    adminSupabase
                        .from("payment_methods")
                        .select("*")
                        .order("id"),

                    adminSupabase
                        .from("business_hours")
                        .select("*")
                        .eq("id", 1)
                        .maybeSingle(),

                    adminSupabase.auth.getUser(),
                ]);

                if (!active) return;

                if (settingsResult.error) {
                    throw settingsResult.error;
                }

                if (paymentResult.error) {
                    throw paymentResult.error;
                }

                if (hoursResult.error) {
                    throw hoursResult.error;
                }

                const settingsData = settingsResult.data;
                const paymentData = paymentResult.data;
                const hoursData = hoursResult.data;

                setSettings({
                    phone: settingsData.phone || "",
                    whatsapp: settingsData.whatsapp || "",
                    location: settingsData.location || "",
                    map_url: settingsData.map_url || "",
                    facebook_url: settingsData.facebook_url || "",
                });

                setPaymentMethods(paymentData || []);

                if (hoursData) {
                    setBusinessHours({
                        open_time: hoursData.open_time?.slice(0, 5)
                            || DEFAULT_HOURS.open_time,
                        close_time: hoursData.close_time?.slice(0, 5)
                            || DEFAULT_HOURS.close_time,
                        closed_days: (hoursData.closed_days || [])
                            .map(Number),
                    });
                }

                if (adminResult.error) {
                    console.error(
                        "تعذر جلب حساب الأدمن:",
                        adminResult.error
                    );
                }

                const authUser = adminResult.data?.user;

                if (authUser) {
                    // الأولوية لاسم المستخدم المحفوظ في بيانات حساب Supabase.
                    // يمكن استخدام profiles كبديل إذا كان الاسم محفوظًا هناك.
                    let username =
                        authUser.user_metadata?.username ||
                        authUser.user_metadata?.name ||
                        authUser.user_metadata?.full_name ||
                        "";

                    if (!username) {
                        const { data: profile, error: profileError } =
                            await supabase
                                .from("profiles")
                                .select("username")
                                .eq("id", authUser.id)
                                .maybeSingle();

                        if (!profileError && profile?.username) {
                            username = profile.username;
                        }
                    }

                    if (active) {
                        setAdmin({
                            username: username || "الأدمن",
                            email: authUser.email || "",
                        });
                    }
                } else {
                    setAdmin({
                        username: "",
                        email: "",
                    });
                }
            } catch (error) {
                console.error("خطأ أثناء تحميل الإعدادات:", error);

                if (active) {
                    toast.error("حدث خطأ أثناء تحميل الإعدادات");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            active = false;
        };
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
                    ? { ...method, [field]: value }
                    : method
            )
        );
    };

    const handleHoursChange = (field, value) => {
        setBusinessHours((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDayToggle = (dayId) => {
        setBusinessHours((prev) => {
            const isClosed = prev.closed_days.includes(dayId);

            return {
                ...prev,
                closed_days: isClosed
                    ? prev.closed_days.filter((id) => id !== dayId)
                    : [...prev.closed_days, dayId].sort((a, b) => a - b),
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (businessHours.open_time >= businessHours.close_time) {
            toast.error("وقت الإغلاق لازم يكون بعد وقت الفتح");
            return;
        }

        const { data: authData, error: authError } =
            await adminSupabase.auth.getUser();

        console.log("Admin session user:", authData?.user?.id);
        console.log("Admin session email:", authData?.user?.email);
        console.log("Admin session error:", authError);

        setSaving(true);

        try {
            const { error: settingsError } = await adminSupabase
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

            if (settingsError) throw settingsError;

            for (const method of paymentMethods) {
                const { error } = await adminSupabase
                    .from("payment_methods")
                    .update({
                        is_active: method.is_active,
                        payment_number: method.payment_number,
                    })
                    .eq("id", method.id);

                if (error) throw error;
            }

            const { error: hoursError } = await adminSupabase
                .from("business_hours")
                .upsert(
                    {
                        id: 1,
                        open_time: businessHours.open_time,
                        close_time: businessHours.close_time,
                        closed_days: businessHours.closed_days,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "id" }
                );
            if (hoursError) throw hoursError;

            toast.success("تم حفظ الإعدادات بنجاح");
        } catch (error) {
            console.error("خطأ أثناء حفظ الإعدادات:", error);
            toast.error("حدث خطأ أثناء حفظ الإعدادات");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section dir="rtl">
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
        <section dir="rtl">
            <h2 className="text-2xl font-bold mb-2">
                الإعدادات
            </h2>

            <p className="text-[#6B5A50] mb-8">
                إدارة حساب الأدمن وساعات العمل وبيانات التواصل وطرق الدفع
            </p>

            <form
                onSubmit={handleSave}
                className="space-y-8 max-w-3xl"
            >
                {/* Admin Account */}
                <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-2">
                        بيانات الأدمن
                    </h3>

                    <p className="text-sm text-[#6B5A50] mb-6">
                        بيانات حساب الأدمن المسجّل دخوله حاليًا
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label className="block mb-2 font-medium">
                                اسم المستخدم
                            </label>

                            <input
                                type="text"
                                value={admin.username}
                                readOnly
                                placeholder="لا يوجد اسم مستخدم محفوظ"
                                className={`${inputClass} bg-[#F8F3EA] text-[#6B5A50]`}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">
                                البريد الإلكتروني
                            </label>

                            <input
                                type="email"
                                value={admin.email}
                                readOnly
                                placeholder="لا يوجد بريد إلكتروني"
                                dir="ltr"
                                className={`${inputClass} bg-[#F8F3EA] text-left text-[#6B5A50]`}
                            />
                        </div>

                        <p className="text-sm text-[#6B5A50]">
                            بيانات الحساب للعرض فقط، ولا يؤدي تعديل
                            إعدادات الموقع إلى تغيير بيانات تسجيل الدخول.
                        </p>
                    </div>
                </div>

                {/* Business Hours */}
                <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-2">
                        ساعات العمل
                    </h3>

                    <p className="text-sm text-[#6B5A50] mb-6">
                        حدد مواعيد العمل المعتادة، ثم أغلق الأيام التي
                        لا يستقبل فيها المخبز طلبات.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label className="block mb-2 font-medium">
                                وقت الفتح
                            </label>

                            <input
                                type="time"
                                required
                                value={businessHours.open_time}
                                onChange={(e) =>
                                    handleHoursChange(
                                        "open_time",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">
                                وقت الإغلاق
                            </label>

                            <input
                                type="time"
                                required
                                value={businessHours.close_time}
                                onChange={(e) =>
                                    handleHoursChange(
                                        "close_time",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="border-t border-[#E5D9CC] pt-5">
                        <h4 className="font-semibold mb-4">
                            أيام العمل
                        </h4>

                        <div className="space-y-3">
                            {WEEK_DAYS.map((day) => {
                                const isClosed =
                                    businessHours.closed_days.includes(day.id);

                                return (
                                    <div
                                        key={day.id}
                                        className="flex items-center justify-between gap-4 border border-[#E5D9CC] rounded-xl p-4"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {day.name}
                                            </p>

                                            <p className="text-sm text-[#6B5A50] mt-1">
                                                {isClosed
                                                    ? "مغلق طوال اليوم"
                                                    : `${businessHours.open_time} - ${businessHours.close_time}`}
                                            </p>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={!isClosed}
                                                onChange={() =>
                                                    handleDayToggle(day.id)
                                                }
                                                className="w-5 h-5 accent-[#5A3825]"
                                            />

                                            <span className="text-sm">
                                                {isClosed ? "مغلق" : "مفتوح"}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-sm text-[#6B5A50] mt-4">
                            مواعيد الفتح والإغلاق موحّدة لكل الأيام المفتوحة.
                            يمكنك إغلاق أي يوم بشكل مستقل.
                        </p>
                    </div>
                </div>

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
                                            className={inputClass}
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

                    <div>
                        <label className="block mb-2 font-medium">
                            رقم الهاتف
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={settings.phone}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

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
                            className={inputClass}
                        />

                        <p className="text-sm text-[#6B5A50] mt-2">
                            يمكن كتابة الرقم بصيغة مصرية أو دولية
                        </p>
                    </div>

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
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            العنوان
                        </label>

                        <textarea
                            name="location"
                            value={settings.location}
                            onChange={handleChange}
                            rows="4"
                            className={`${inputClass} resize-none`}
                        />

                        <p className="text-sm text-[#6B5A50] mt-2">
                            كل سطر سيظهر كسطر منفصل في صفحة التواصل
                        </p>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            رابط الموقع على الخريطة
                        </label>

                        <input
                            type="text"
                            name="map_url"
                            value={settings.map_url}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#5A3825] text-white px-6 py-3 rounded-lg active:bg-[#3F271A] disabled:opacity-60"
                        >
                            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Logout */}
            <div className="mt-8">
                <button
                    type="button"
                    onClick={onLogout}
                    className="bg-[#8B4513] text-white px-6 py-3 rounded-lg active:bg-[#6F350F]"
                >
                    تسجيل الخروج
                </button>
            </div>
        </section>
    );
}