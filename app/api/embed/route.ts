import OpenAI from 'openai'
import pdfParse from 'pdf-parse'
import { supabase } from '@/lib/supabase'
import { chunkTextByWords } from '@/lib/chunker'


const ollama = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama'
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()

        const file = formData.get('document') as File

        if (!file) {
            return Response.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const pdfData = await pdfParse(buffer)

        const text = pdfData.text

        const chunks = chunkTextByWords(text)

        for (const chunk of chunks) {
            const response = await ollama.embeddings.create({
                model: 'nomic-embed-text',
                input: chunk
            })

            const embedding = response.data[0].embedding

            const { error } = await supabase
                .from('documents')
                .insert({
                    content: chunk,
                    embedding
                })

            if (error) {
                console.log(error)
            }
        }

        return Response.json({
            success: true,
            chunks: chunks.length
        })

    } catch (error) {
        console.log(error)

        return Response.json(
            { error: 'Failed to process PDF' },
            { status: 500 }
        )
    }
}

