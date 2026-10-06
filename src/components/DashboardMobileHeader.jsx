export default function DashboardMobileHeader({
  activeSection,
  sections,
  setIsMenuOpen,
  isMenuOpen,
  unreadMessagesCount,
}) {
  const activeLabel =
    sections.find(
      (section) => section.id === activeSection
    )?.label || "لوحة الإدارة";

  return (
    <header className="md:hidden h-16 bg-white border-b border-[#E8DED2] flex items-center justify-between px-4 sticky top-0 z-30">

      <button
        onClick={() => setIsMenuOpen(true)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8F3EA] text-[#5A3825]"
        aria-label="فتح القائمة"
      >
        <span className="text-2xl">☰</span>

        {unreadMessagesCount > 0 && !isMenuOpen && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#5A3825] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadMessagesCount}
          </span>
        )}
      </button>
      <div className="text-right">

        <h1 className="text-base font-bold text-[#5A3825]">
          مخبوزات توتا
        </h1>

        <p className="text-xs text-[#6B5A50]">
          {activeLabel}
        </p>

      </div>

    </header>
  );
}