import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX, FiShoppingCart } from 'react-icons/fi'

export default function Header({ cart }) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => {
    setIsOpen(false)
  }

  const cartCount = cart.length

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#5A3825] text-white">

      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-semibold"
        >
          مخبوزات توتة
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">

          <Link to="/" onClick={closeMenu}>
            الرئيسية
          </Link>

          <Link to="/products" onClick={closeMenu}>
            المخبوزات
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            مكانّا
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={closeMenu}
            className="relative text-xl"
            aria-label="السلة"
          >
            <FiShoppingCart />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#5A3825] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 md:hidden">

          {/* Cart */}
          <Link
            to="/cart"
            onClick={closeMenu}
            className="relative text-xl"
            aria-label="السلة"
          >
            <FiShoppingCart />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#5A3825] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl"
            aria-label="فتح القائمة"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden border-t border-white/20">

          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-4 text-center">

            <Link
              to="/"
              onClick={closeMenu}
            >
              الرئيسية
            </Link>

            <Link
              to="/products"
              onClick={closeMenu}
            >
              المخبوزات
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
            >
              مكانّا
            </Link>

          </div>

        </nav>
      )}

    </header>
  )
}

