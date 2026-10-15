
import { Link, NavLink } from 'react-router-dom'
import {
  FiHome,
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiMapPin,
} from 'react-icons/fi'
import headerLogo from '../assets/images/headerLogo5.png'

export default function Header({
  cart = [],
  user,
  setIsUserAccountOpen,
}) {
  const cartCount = cart.length

  const desktopLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'bg-white text-[#5A3825]'
      : 'text-white/85 hover:bg-white/10 hover:text-white'
    }`

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#5A3825] shadow-md">
      <div
        dir="rtl"
        className="max-w-6xl mx-auto px-5 min-h-19 flex flex-col items-center justify-center gap-2 py-2 md:flex-row md:justify-between md:gap-4 md:py-0"
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="مخبوزات توتا - الرئيسية"
          className="shrink-0"
        >
          <img
            src={headerLogo}
            alt="مخبوزات توتا"
            className="w-50 sm:w-56 md:w-40 h-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Only */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-1"
        >
          <NavLink to="/" end className={desktopLinkClass}>
            <FiHome size={18} />
            <span>الرئيسية</span>
          </NavLink>

          <NavLink to="/products" className={desktopLinkClass}>
            <FiPackage size={18} />
            <span>المخبوزات</span>
          </NavLink>

          <NavLink to="/contact" className={desktopLinkClass}>
            <FiMapPin size={18} />
            <span>العنوان والتواصل</span>
          </NavLink>
          <NavLink to="/cart" className={desktopLinkClass}>
            <span className="relative">
              <FiShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-white text-[#5A3825] text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </span>
            <span>السلة</span>
          </NavLink>

          {user ? (
            <Link
              to="/account"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-[#5A3825] hover:bg-[#F8F3EA] transition"
            >
              <FiUser size={18} />
              <span>{user.username || 'حسابي'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsUserAccountOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-[#5A3825] hover:bg-[#F8F3EA] transition"
            >
              <FiUser size={18} />
              <span>تسجيل الدخول</span>
            </button>)}
        </nav>
      </div>
    </header>
  )
}
