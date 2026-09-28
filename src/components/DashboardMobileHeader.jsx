export default function DashboardMobileHeader({
  activeSection,
  sections,
  setIsMenuOpen,
}) {
  return (
    <header className="md:hidden h-16 bg-white border-b border-[#E8DED2] flex items-center justify-between px-4 sticky top-0 z-30">

      <button
        onClick={() => setIsMenuOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8F3EA] text-[#5A3825]"
        aria-label="فتح القائمة"
      >
        <span className="text-2xl">☰</span>
      </button>

      <div className="text-right">
        <h1 className="text-base font-bold text-[#5A3825]">
          مخبوزات توتة
        </h1>

        <p className="text-xs text-[#6B5A50]">
          {sections.find(
            (section) => section.id === activeSection
          )?.label}
        </p>
      </div>

    </header>
  );
}