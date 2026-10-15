import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const WEEK_DAYS = [
  { id: 0, label: "الأحد" },
  { id: 1, label: "الاثنين" },
  { id: 2, label: "الثلاثاء" },
  { id: 3, label: "الأربعاء" },
  { id: 4, label: "الخميس" },
  { id: 5, label: "الجمعة" },
  { id: 6, label: "السبت" },
];

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);

  const period = hours >= 12 ? "م" : "ص";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function About() {
  const [businessHours, setBusinessHours] = useState(null);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [hoursError, setHoursError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBusinessHours() {
      setHoursLoading(true);
      setHoursError(false);

      const { data, error } = await supabase
        .from("business_hours")
        .select("open_time, close_time, closed_days")
        .eq("id", 1)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load business hours:", error);
        setHoursError(true);
        setBusinessHours(null);
      } else if (data) {
        setBusinessHours({
          open_time: data.open_time,
          close_time: data.close_time,
          closed_days: (data.closed_days || []).map(Number),
        });
      } else {
        setHoursError(true);
        setBusinessHours(null);
        console.error("No business_hours record found for id = 1");
      }

      setHoursLoading(false);
    }

    loadBusinessHours();

    return () => {
      isMounted = false;
    };
  }, []);

  const allDaysClosed =
    businessHours?.closed_days?.length === WEEK_DAYS.length;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 text-center">
        <div className="max-w-2xl">
          <p className="mb-3 font-medium text-[#5A3825]">
            عن مخبوزات توتا
          </p>

          <h2 className="text-3xl font-bold text-[#2E1B12] md:text-4xl">
            مخبوزات بسيطة بطعم تحبه
          </h2>

          <p className="mt-4 leading-relaxed text-[#6B5A50]">
            بنحضّر مخبوزاتنا بعناية وبمكونات بسيطة، عشان كل قطعة توصلك
            بطعم طازج وإحساس المخبوزات البيتي.
          </p>

          <div className="mt-6 rounded-xl border border-[#D8C9BC] bg-[#F8F3EA] p-5">
            <h3 className="mb-3 text-lg font-bold text-[#5A3825]">
              <span aria-hidden="true">🕒 </span>
              مواعيد العمل
            </h3>

            {hoursLoading ? (
              <p className="text-[#6B5A50]">
                جاري تحميل مواعيد العمل...
              </p>
            ) : hoursError ? (
              <p className="text-[#6B5A50]">
                مواعيد العمل غير متاحة حاليًا، برجاء المحاولة لاحقًا.
              </p>
            ) : allDaysClosed ? (
              <p className="text-lg font-semibold text-[#8B3A2B]">
                المخبز مغلق طوال الأسبوع
              </p>
            ) : (
              <>
                <p className="text-lg leading-relaxed text-[#6B5A50]">
                  من الساعة{" "}
                  <span className="font-bold text-[#5A3825]">
                    {formatTime(businessHours.open_time)}
                  </span>{" "}
                  إلى الساعة{" "}
                  <span className="font-bold text-[#5A3825]">
                    {formatTime(businessHours.close_time)}
                  </span>
                </p>

                {businessHours.closed_days.length > 0 && (
                  <p className="mt-3 text-sm text-[#7A6254]">
                    أيام الإغلاق:{" "}
                    {WEEK_DAYS
                      .filter((day) =>
                        businessHours.closed_days.includes(day.id)
                      )
                      .map((day) => day.label)
                      .join("، ")}
                  </p>
                )}

                {businessHours.closed_days.length === 0 && (
                  <p className="mt-2 text-sm text-[#7A6254]">
                    نعمل طوال أيام الأسبوع.
                  </p>
                )}
              </>
            )}
          </div>


          <div className="mt-5 rounded-xl border border-[#D8C9BC] bg-[#F8F3EA] p-5">
            <h3 className="mb-3 text-lg font-bold text-[#5A3825]">
              🥐 خدمة التسوية
            </h3>

            <p className="leading-relaxed text-[#6B5A50]">
              عندك الخامات ومحتاج تسوية بس؟
            </p>

            <p className="mt-2 leading-relaxed text-[#6B5A50]">
              وفّر خاماتك بنفسك، وإحنا نتولى تسوية مخبوزاتك بكل عناية،
              عشان تستمتع بطعم بيتي شهي زي ما بتحب ❤️
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}