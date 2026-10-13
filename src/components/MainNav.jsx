

import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
    FiHome,
    FiShoppingCart,
    FiUser,
    FiPackage,
    FiMenu,
    FiX,
    FiMapPin,
} from 'react-icons/fi'

export default function MainNav({
    cart = [],
    user,
    setIsUserAccountOpen,
}) {
    const cartCount = cart.length

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const closeMenu = () => setIsMenuOpen(false)


    const navItems = [
        {
            to: '/',
            label: 'الرئيسية',
            icon: FiHome,
            end: true,
        },
        {
            to: '/products',
            label: 'المخبوزات',
            icon: FiPackage,
        },
        {
            to: '/cart',
            label: 'السلة',
            icon: FiShoppingCart,
            cart: true,
        },
    ]

    const linkClass = ({ isActive }) =>
        `relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2
    px-2 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium
    transition-colors duration-200
    ${isActive
            ? 'text-[#5A3825] bg-[#F8F3EA]'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`

    return (
        <>
            {/* Mobile & Tablet Navigation */}
            <>
                <nav
                    dir="rtl"
                    aria-label="التنقل الرئيسي"
                    className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#5A3825] border-t border-white/15 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
                >
                    <div className="grid grid-cols-4 max-w-xl mx-auto px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">

                        {/* Menu */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                            aria-expanded={isMenuOpen}
                            className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
                        >
                            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            <span>القائمة</span>
                        </button>

                        {/* Home */}
                        <NavLink to="/" end className={linkClass}>
                            <FiHome size={22} />
                            <span>الرئيسية</span>
                        </NavLink>

                        {/* Cart */}
                        <NavLink to="/cart" className={linkClass}>
                            <span className="relative">
                                <FiShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-white text-[#5A3825] text-[10px] font-bold flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                            <span>السلة</span>
                        </NavLink>

                        {/* Account */}
                        {user ? (
                            <NavLink to="/account" className={linkClass}>
                                <FiUser size={22} />
                                <span>حسابي</span>
                            </NavLink>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsUserAccountOpen(true)}
                                className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
                            >
                                <FiUser size={22} />
                                <span>حسابي</span>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Backdrop */}
                {isMenuOpen && (
                    <button
                        type="button"
                        aria-label="إغلاق القائمة"
                        onClick={closeMenu}
                        className="md:hidden fixed inset-0 z-[60] bg-black/40"
                    />
                )}

                {/* Sidebar */}
                <aside
                    dir="rtl"
                    aria-label="قائمة الموقع"
                    aria-hidden={!isMenuOpen}
                    className={`md:hidden fixed top-0 right-0 bottom-0 z-[70] w-[min(82vw,320px)] bg-[#F8F3EA] text-[#2E1B12] shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex items-center justify-between p-5 border-b border-[#D8C9BC]">
                        <h2 className="text-xl font-bold">مخبوزات توتا</h2>

                        <button
                            type="button"
                            onClick={closeMenu}
                            aria-label="إغلاق القائمة"
                            className="p-2 rounded-lg hover:bg-[#EDE2D4] transition"
                        >
                            <FiX size={22} />
                        </button>
                    </div>

                    <nav className="p-4 flex flex-col gap-2">
                        <NavLink
                            to="/"
                            end
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                    ? 'bg-[#5A3825] text-white'
                                    : 'hover:bg-[#EDE2D4]'
                                }`
                            }
                        >
                            <FiHome size={20} />
                            الرئيسية
                        </NavLink>

                        <NavLink
                            to="/products"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                    ? 'bg-[#5A3825] text-white'
                                    : 'hover:bg-[#EDE2D4]'
                                }`
                            }
                        >
                            <FiPackage size={20} />
                            المخبوزات
                        </NavLink>

                        <NavLink
                            to="/cart"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                    ? 'bg-[#5A3825] text-white'
                                    : 'hover:bg-[#EDE2D4]'
                                }`
                            }
                        >
                            <FiShoppingCart size={20} />
                            السلة
                            {cartCount > 0 && (
                                <span className="mr-auto rounded-full bg-[#5A3825] text-white text-xs px-2 py-1">
                                    {cartCount}
                                </span>
                            )}
                        </NavLink>

                        <NavLink
                            to="/contact"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-xl transition ${isActive
                                    ? 'bg-[#5A3825] text-white'
                                    : 'hover:bg-[#EDE2D4]'
                                }`
                            }
                        >
                            <FiMapPin size={20} />
                            العنوان والتواصل
                        </NavLink>

                        <div className="my-2 border-t border-[#D8C9BC]" />

                        {user ? (
                            <Link
                                to="/account"
                                onClick={closeMenu}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#EDE2D4] transition"
                            >
                                <FiUser size={20} />
                                <span>{user.username || 'حسابي'}</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    closeMenu()
                                    setIsUserAccountOpen(true)
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#EDE2D4] transition"
                            >
                                <FiUser size={20} />
                                تسجيل الدخول
                            </button>
                        )}
                    </nav>
                </aside>
            </>
        </>
    )
}
