import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    const { data, error } = await supabase
        .from('uploaded_files')
        .select('file_name, document_id')

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data, { status: 200 })
}
