export default function DashboardSidebar({
    activeSection,
    handleSectionChange,
    sections,
    isMenuOpen,
    setIsMenuOpen,
    onLogout,
    adminName,
    unreadMessagesCount,
}) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-l border-[#E8DED2] flex-col fixed right-0 top-0 bottom-0">

                {/* Logo / Brand */}
                <div className="p-6 border-b border-[#E8DED2]">
                    <h1 className="text-xl font-bold text-[#5A3825]">
                        مخبوزات توتا
                    </h1>

                    <p className="text-sm text-[#6B5A50] mt-1">
                        لوحة الإدارة
                    </p>
                    <div className="mt-4 px-3 py-3 rounded-xl bg-[#F8F3EA]">
                        <p className="text-xs text-[#6B5A50]">
                            الحساب
                        </p>

                        <p className="text-sm font-semibold text-[#5A3825] mt-1 truncate">
                            {adminName || "الأدمن"}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 flex-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionChange(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition ${activeSection === section.id
                                ? "bg-[#F8F3EA] text-[#5A3825] font-semibold"
                                : "text-[#6B5A50] hover:bg-[#F8F3EA]"
                                }`}
                        >
                            <span>{section.icon}</span>
                            <span>{section.label}</span>

                            {section.id === "messages" && unreadMessagesCount > 0 && (
                                <span className="mr-auto min-w-6 h-6 px-2 rounded-full bg-[#5A3825] text-white text-xs font-semibold flex items-center justify-center">
                                    {unreadMessagesCount}
                                </span>
                            )}                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#E8DED2]">
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-3 rounded-xl text-right text-red-600 hover:bg-red-50 transition"
                    >
                        تسجيل الخروج
                    </button>
                </div>

            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 right-0 bottom-0 w-72 max-w-[85%] bg-white z-50 shadow-xl transform transition-transform duration-300 md:hidden ${isMenuOpen
                    ? "translate-x-0"
                    : "translate-x-full"
                    }`}
            >
                {/* Mobile Sidebar Header */}
                <div className="p-6 border-b border-[#E8DED2] flex items-center justify-between">

                    <div>
                        <h1 className="text-xl font-bold text-[#5A3825]">
                            مخبوزات توتا
                        </h1>

                        <p className="text-sm text-[#6B5A50] mt-1">
                            لوحة الإدارة
                        </p>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-2xl text-[#6B5A50]"
                        aria-label="إغلاق القائمة"
                    >
                        ×
                    </button>

                </div>

                {/* Mobile Navigation */}
                <nav className="p-4 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionChange(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition ${activeSection === section.id
                                ? "bg-[#F8F3EA] text-[#5A3825] font-semibold"
                                : "text-[#6B5A50] hover:bg-[#F8F3EA]"
                                }`}
                        >
                            <span>{section.icon}</span>
                            <span>{section.label}</span>

                            {section.id === "messages" && unreadMessagesCount > 0 && (
                                <span className="mr-auto min-w-6 h-6 px-2 rounded-full bg-[#5A3825] text-white text-xs font-semibold flex items-center justify-center">
                                    {unreadMessagesCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Mobile Logout */}
                <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-[#E8DED2]">
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-3 rounded-xl text-right text-red-600 hover:bg-red-50 transition"
                    >
                        تسجيل الخروج
                    </button>
                </div>

            </aside>
        </>
    );
}

