import { useEffect, useState } from "react";
import { adminSupabase } from "../supabase";
import { toast } from "react-hot-toast";

export default function AdminMessages({ onUnreadCountChange }) {
    console.log("ADMIN MESSAGES COMPONENT RENDERED");
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageFilter, setMessageFilter] = useState("all");
    const [mobileView, setMobileView] = useState("conversations");

    useEffect(() => {
        const loadMessages = async () => {
            console.log("ADMIN MESSAGES: loadMessages started");
            setLoading(true);

            const { data, error } = await adminSupabase
                .from("messages")
                .select(`
        id,
        order_id,
        user_id,
        sender_type,
        message,
        sent_at,
        delivered_at,
        read_at,
        orders (
            customer_name,
            order_number,
            created_at
        )
    `)
                .order("sent_at", { ascending: true });
            if (error) {
                console.log("Admin messages error:", error);
                setConversations([]);
                setLoading(false);
                return;
            }
            console.log("ADMIN MESSAGES: query result", {
                data,
                error,
            });

            const messages = data || [];
            const undeliveredUserMessages = messages.filter(
                (message) =>
                    message.sender_type === "user" &&
                    !message.delivered_at
            );

            if (undeliveredUserMessages.length > 0) {
                const deliveredIds = undeliveredUserMessages.map(
                    (message) => message.id
                );

                const deliveredAt = new Date().toISOString();

                const { error: deliveredError } = await adminSupabase
                    .from("messages")
                    .update({
                        delivered_at: deliveredAt,
                    })
                    .in("id", deliveredIds);

                if (deliveredError) {
                    console.log(
                        "Mark messages as delivered error:",
                        deliveredError.message
                    );
                }
            }

            const grouped = messages.reduce((acc, message) => {
                const orderId = message.order_id;

                if (!acc[orderId]) {
                    acc[orderId] = {
                        order_id: orderId,
                        user_id: message.user_id,
                        order: message.orders,
                        messages: [],
                    };
                }

                acc[orderId].messages.push(message);

                return acc;
            }, {});
            const conversationList = Object.values(grouped).map(
                (conversation) => {
                    const lastMessage =
                        conversation.messages[
                        conversation.messages.length - 1
                        ];

                    const unreadCount = conversation.messages.filter(
                        (message) =>
                            message.sender_type === "user" &&
                            !message.read_at
                    ).length;

                    return {
                        ...conversation,
                        lastMessage,
                        unreadCount,
                    };
                }
            );
            conversationList.sort(
                (a, b) =>
                    new Date(b.lastMessage.sent_at) -
                    new Date(a.lastMessage.sent_at)
            );

            const totalUnread = conversationList.reduce(
                (total, conversation) =>
                    total + conversation.unreadCount,
                0
            );

            onUnreadCountChange(totalUnread);

            console.log("Unread messages:", {
                totalUnread,
                conversations: conversationList.map((conversation) => ({
                    order_id: conversation.order_id,
                    unreadCount: conversation.unreadCount,
                })),
            });

            setConversations(conversationList);



            setSelectedConversation(null);
            setLoading(false);
        };

        loadMessages();
    }, []);

    const filteredConversations =
        messageFilter === "unread"
            ? conversations.filter(
                (conversation) => conversation.unreadCount > 0
            )
            : conversations;

    useEffect(() => {
        const markUserMessagesAsRead = async () => {
            if (!selectedConversation) {
                return;
            }

            const unreadUserMessages =
                selectedConversation.messages.filter(
                    (message) =>
                        message.sender_type === "user" &&
                        !message.read_at
                );

            if (unreadUserMessages.length === 0) {
                return;
            }

            const unreadIds = unreadUserMessages.map(
                (message) => message.id
            );

            const readAt = new Date().toISOString();

            const { error } = await adminSupabase
                .from("messages")
                .update({
                    read_at: readAt,
                })
                .in("id", unreadIds);

            if (error) {
                console.log(
                    "Mark user messages as read error:",
                    error.message
                );
                return;
            }

            setSelectedConversation((prev) => {
                if (!prev) {
                    return prev;
                }

                return {
                    ...prev,
                    messages: prev.messages.map((message) =>
                        unreadIds.includes(message.id)
                            ? {
                                ...message,
                                read_at: readAt,
                            }
                            : message
                    ),
                };
            });

            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.order_id === selectedConversation.order_id
                        ? {
                            ...conversation,
                            unreadCount: 0,
                            messages: conversation.messages.map((message) =>
                                unreadIds.includes(message.id)
                                    ? {
                                        ...message,
                                        read_at: readAt,
                                    }
                                    : message
                            ),
                        }
                        : conversation
                )
            );
        };

        markUserMessagesAsRead();
    }, [selectedConversation]);
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    useEffect(() => {
        const totalUnread = conversations.reduce(
            (total, conversation) =>
                total + conversation.unreadCount,
            0
        );

        onUnreadCountChange(totalUnread);
    }, [conversations, onUnreadCountChange]);



    const sendMessage = async () => {
        if (
            !messageText.trim() ||
            !selectedConversation ||
            sending
        ) {
            return;
        }

        setSending(true);

        const { data: sessionData } =
            await adminSupabase.auth.getSession();
        const adminUser = sessionData?.session?.user;

        if (!adminUser) {
            toast.error("يجب تسجيل الدخول كإدارة");
            setSending(false);
            return;
        }

        const { data, error } = await adminSupabase
            .from("messages")
            .insert({
                order_id: selectedConversation.order_id,
                user_id: selectedConversation.user_id,
                sender_type: "admin",
                message: messageText.trim(),
            })
            .select()
            .single();
        if (error) {
            console.log("Admin send message error:", error);
            toast.error("حدث خطأ أثناء إرسال الرسالة");
            setSending(false);
            return;
        }

        const updatedConversation = {
            ...selectedConversation,
            messages: [
                ...selectedConversation.messages,
                data,
            ],
            lastMessage: data,
            messageCount:
                selectedConversation.messageCount + 1,
        };

        setSelectedConversation(updatedConversation);

        setConversations((prev) =>
            prev
                .map((conversation) =>
                    conversation.order_id ===
                        updatedConversation.order_id
                        ? updatedConversation
                        : conversation
                )
                .sort(
                    (a, b) =>
                        new Date(b.lastMessage.sent_at) -
                        new Date(a.lastMessage.sent_at)
                )
        );

        setMessageText("");
        setSending(false);
    };

    return (
        <div className="space-y-6">
            {/* العنوان */}
            <div>
                <h1 className="text-2xl font-bold text-[#5A3825]">
                    الرسائل
                </h1>

                <p className="mt-1 text-sm text-[#7A6254]">
                    إدارة المحادثات والرسائل مع العملاء
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* قائمة المحادثات */}
                <div
                    className={`lg:col-span-1 bg-white rounded-2xl border border-[#D8C9BC] overflow-hidden
        ${mobileView === "chat" ? "hidden lg:block" : "block"}
    `}
                >                    <div className="p-4 border-b border-[#D8C9BC]">
                        <h2 className="font-semibold text-[#5A3825]">
                            المحادثات
                        </h2>

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setMessageFilter("all")}
                                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${messageFilter === "all"
                                    ? "bg-[#5A3825] text-white"
                                    : "bg-[#F8F3EA] text-[#7A6254] hover:bg-[#EFE3D8]"
                                    }`}
                            >
                                الكل
                            </button>

                            <button
                                type="button"
                                onClick={() => setMessageFilter("unread")}
                                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${messageFilter === "unread"
                                    ? "bg-[#5A3825] text-white"
                                    : "bg-[#F8F3EA] text-[#7A6254] hover:bg-[#EFE3D8]"
                                    }`}
                            >
                                غير مقروءة
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-[#8A7568]">
                            جاري تحميل المحادثات...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-[#8A7568]">
                            <div className="text-4xl mb-3">
                                💬
                            </div>

                            <p className="text-sm">
                                لا توجد رسائل حاليًا
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                            {filteredConversations.map((conversation) => {
                                const isSelected =
                                    selectedConversation?.order_id ===
                                    conversation.order_id;

                                return (
                                    <button
                                        key={conversation.order_id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedConversation(conversation);
                                            setMobileView("chat");
                                        }}
                                        className={`w-full text-right p-4 border-b border-[#F0E7DE] transition ${isSelected
                                            ? "bg-[#F8F3EA]"
                                            : "hover:bg-[#FBF8F4]"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <p className="font-semibold text-[#5A3825]">
                                                            {conversation.order?.customer_name || "عميل"}
                                                        </p>

                                                        <p className="text-xs text-[#8A7568] mt-1">
                                                            طلب #
                                                            {conversation.order?.order_number ?? "-"}
                                                        </p>

                                                        <p className="text-xs text-[#8A7568] mt-1">
                                                            {new Date(
                                                                conversation.order?.created_at
                                                            ).toLocaleString("ar-EG", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="text-xs bg-[#5A3825] text-white px-2 py-0.5 rounded-full">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-[#7A6254] truncate mt-2">
                                                    {
                                                        conversation
                                                            .lastMessage
                                                            .message
                                                    }
                                                </p>
                                            </div>

                                            <span className="text-xs text-[#8A7568] whitespace-nowrap">
                                                {formatTime(
                                                    conversation
                                                        .lastMessage
                                                        .sent_at
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* المحادثة */}
                <div
                    className={`lg:col-span-2 bg-white rounded-2xl border border-[#D8C9BC] overflow-hidden min-h-[500px] max-h-[calc(100vh-220px)] flex flex-col
        ${mobileView === "conversations" ? "hidden lg:flex" : "flex"}
    `}
                >                    {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-[#8A7568]">
                        <div>
                            <div className="text-5xl mb-4">
                                💬
                            </div>

                            <p className="text-sm">
                                اختر محادثة لعرض الرسائل
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* رأس المحادثة */}
                        <div className="p-4 border-b border-[#D8C9BC] shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileView("conversations")}
                                    className="lg:hidden flex-shrink-0 w-9 h-9 rounded-xl bg-[#F8F3EA] text-[#5A3825] flex items-center justify-center text-xl hover:bg-[#EFE3D8] transition"
                                    aria-label="العودة إلى المحادثات"
                                >
                                    →
                                </button>

                                <div>
                                    <h2 className="font-semibold text-[#5A3825]">
                                        {selectedConversation.order?.customer_name || "عميل"}
                                    </h2>

                                    <p className="text-xs text-[#7A6254] mt-1">
                                        طلب #
                                        {selectedConversation.order?.order_number ?? "-"}
                                        {" · "}
                                        {new Date(
                                            selectedConversation.order?.created_at
                                        ).toLocaleString("ar-EG", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* الرسائل */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                            {selectedConversation.messages.map((message) => {
                                const isAdmin =
                                    message.sender_type === "admin";

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isAdmin
                                            ? "justify-start"
                                            : "justify-end"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${isAdmin
                                                ? "bg-[#5A3825] text-white rounded-br-md"
                                                : "bg-[#EFE3D8] text-[#5A3825] rounded-bl-md"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.message}
                                            </p>

                                            <div
                                                className={`text-[11px] mt-2 ${isAdmin
                                                    ? "text-white/70"
                                                    : "text-[#8A7568]"
                                                    }`}
                                            >
                                                {new Date(
                                                    message.sent_at
                                                ).toLocaleTimeString("ar-EG", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* كتابة الرسالة */}
                        <div className="p-4 border-t border-[#D8C9BC] shrink-0">
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={messageText}
                                    onChange={(e) =>
                                        setMessageText(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="اكتب رسالتك للعميل..."
                                    rows={2}
                                    disabled={sending}
                                    className="flex-1 resize-none rounded-xl border border-[#D8C9BC] bg-[#FCFAF7] px-4 py-3 text-sm text-[#2E1B12] outline-none focus:border-[#8A6250]"
                                />

                                <button
                                    type="button"
                                    onClick={sendMessage}
                                    disabled={
                                        sending ||
                                        !messageText.trim()
                                    }
                                    className="rounded-xl bg-[#5A3825] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {sending
                                        ? "جاري الإرسال..."
                                        : "إرسال"}
                                </button>
                            </div>

                            <p className="mt-2 text-[11px] text-[#9A887C] hidden lg:block">
                                اضغط Enter للإرسال، أو Shift + Enter لسطر جديد
                            </p>
                        </div>
                    </>
                )}
                </div>
            </div>
        </div>
    );
}