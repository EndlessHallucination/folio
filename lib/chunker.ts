export function chunkTextByWords(text: string, chunkSize = 500, overlap = 50) {

    const words = text.trim().split(/\s+/)
    const chunks: string[] = [];

    if (words.length === 0 || words[0] === '') return chunks

    let startIndex = 0;

    while (startIndex < words.length) {
        const endIndex = startIndex + chunkSize;

        const chunkWords = words.slice(startIndex, endIndex);

        chunks.push(chunkWords.join(' '))


        startIndex += (chunkSize - overlap)

        if (chunkSize <= overlap) break;
    }
    return chunks
}
