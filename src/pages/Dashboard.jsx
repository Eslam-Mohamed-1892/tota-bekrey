import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminSupabase } from "../supabase";
import { toast } from "react-hot-toast";

import DashboardSidebar from "../components/DashboardSidebar";
import DashboardMobileHeader from "../components/DashboardMobileHeader";
import AdminProducts from "../components/AdminProducts";
import AdminSales from "../components/AdminSales";
import Settings from "../components/Settings";
import AdminMessages from "../components/AdminMessages";

export default function Dashboard({ products, setProducts }) {
    const [activeSection, setActiveSection] = useState("products");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const navigate = useNavigate();

    console.log("DASHBOARD activeSection:", activeSection);

    const loadUnreadMessagesCount = async () => {
        const { count, error } = await adminSupabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_type", "user")
            .is("read_at", null);

        if (error) {
            console.log("Unread messages count error:", error);
            return;
        }

        setUnreadMessagesCount(count || 0);
    };

    useEffect(() => {
        const getAdmin = async () => {
            const {
                data: { user },
                error: userError,
            } = await adminSupabase.auth.getUser();

            if (userError) {
                console.log("Admin user error:", userError);
                return;
            }

            if (!user) {
                console.log("No admin user found");
                return;
            }

            const { data: profile, error: profileError } =
                await adminSupabase
                    .from("profiles")
                    .select("username")
                    .eq("id", user.id)
                    .single();

            if (profileError) {
                console.log("Admin profile error:", profileError);
                return;
            }

            setAdminName(profile?.username || "الأدمن");
        };

        getAdmin();
        loadUnreadMessagesCount();
    }, []);

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
            id: "messages",
            label: "الرسائل",
            icon: "💬",
        },
        {
            id: "settings",
            label: "الإعدادات",
            icon: "⚙️",
        },
    ];

    const handleSectionChange = (section) => {
        console.log("DASHBOARD section clicked:", section);
        setActiveSection(section);
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        await adminSupabase.auth.signOut();
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
                    adminName={adminName}
                    unreadMessagesCount={unreadMessagesCount}
                />
                {/* Main Content */}
                <main className="flex-1 md:mr-64">

                    {/* Mobile Header */}
                    <DashboardMobileHeader
                        activeSection={activeSection}
                        sections={sections}
                        setIsMenuOpen={setIsMenuOpen}
                        isMenuOpen={isMenuOpen}
                        unreadMessagesCount={unreadMessagesCount}
                    />
                    {/* Page Content */}
                    <div className="p-4 md:p-8">
                        {activeSection === "products" && (
                            <AdminProducts
                                products={products}
                                setProducts={setProducts}
                            />
                        )}

                        {activeSection === "sales" && <AdminSales />}

                        {activeSection === "messages" && (
                            <AdminMessages
                                onUnreadCountChange={setUnreadMessagesCount}
                            />
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