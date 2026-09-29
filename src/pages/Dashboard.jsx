import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { toast } from "react-hot-toast";

import DashboardSidebar from "../components/DashboardSidebar";
import DashboardMobileHeader from "../components/DashboardMobileHeader";
import AdminProducts from "../components/AdminProducts";
import AdminSales from "../components/AdminSales";
import Settings from "../components/Settings";

export default function Dashboard({ products, setProducts }) {
    const [activeSection, setActiveSection] = useState("products");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    const sections = [
        {
            id: "products",
            label: "المنتجات",
            icon: "📦",
        },
        {
            id: "sales",
            label: "المبيعات",
            icon: "📊",
        },
        {
            id: "settings",
            label: "الإعدادات",
            icon: "⚙️",
        },
    ];

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();

        toast.success("تم تسجيل الخروج بنجاح");

        navigate("/admin-login");
    };
    return (
        <div
            dir="rtl"
            className="min-h-screen bg-[#F8F3EA] text-[#2E1B12]"
        >
            <div className="flex min-h-screen">

                {/* Sidebar */}
                <DashboardSidebar
                    activeSection={activeSection}
                    handleSectionChange={handleSectionChange}
                    sections={sections}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    onLogout={handleLogout}
                />

                {/* Main Content */}
                <main className="flex-1 md:mr-64">

                    {/* Mobile Header */}
                    <DashboardMobileHeader
                        activeSection={activeSection}
                        sections={sections}
                        setIsMenuOpen={setIsMenuOpen}
                    />

                    {/* Page Content */}
                    <div className="p-4 md:p-8">

                        {activeSection === "products" && (
                            <AdminProducts
                                products={products}
                                setProducts={setProducts}
                            />
                        )}

                        {activeSection === "sales" && (
                            <AdminSales />
                        )}

                        {activeSection === "settings" && (
                            <Settings onLogout={handleLogout} />
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}