import { supabase } from "./supabase";

export async function testMessageDeletionRLS() {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    console.log("Current user:", user);

    if (userError || !user) {
        console.log("No logged-in user");
        return;
    }

    // اختبار مسموح: المستخدم يحذف الرسالة لنفسه
    const { data: allowedData, error: allowedError } =
        await supabase
            .from("message_deletions")
            .insert({
                message_id: 1,
                user_id: user.id,
            })
            .select()
            .single();

    console.log("Allowed insert:", {
        data: allowedData,
        error: allowedError,
    });

    // اختبار ممنوع: محاولة استخدام user_id مختلف
    const { data: blockedData, error: blockedError } =
        await supabase
            .from("message_deletions")
            .insert({
                message_id: 1,
                user_id: "00000000-0000-0000-0000-000000000001",
            })
            .select()
            .single();

    console.log("Blocked insert:", {
        data: blockedData,
        error: blockedError,
    });
}