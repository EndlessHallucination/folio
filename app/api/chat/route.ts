import OpenAI from "openai";
import { supabase } from '@/lib/supabase'

const ollama = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama'
})

export async function POST(request: Request) {

    const { text, documentId } = await request.json()


    const response = await ollama.embeddings.create({
        model: 'nomic-embed-text',
        input: text,
    })

    const result = await supabase.rpc('match_documents', {
        query_embedding: response.data[0].embedding, filter_document_id: documentId
    })

    const contextString = result.data?.map((c: any) => c.content).join('\n\n')


    const userMessage = text

    const chatCompletion = await ollama.chat.completions.create({
        model: "llama3.2",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant. Answer the user's question using only the context below. If the answer isn't in the context say so.\n\nContext: ${contextString}`,
            },
            {
                role: "user",
                content: userMessage,
            },
        ],

    });


    return Response.json({ answer: chatCompletion.choices[0].message.content })
}