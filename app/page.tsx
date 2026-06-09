'use client'
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "duplicate" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [chatError, setChatError] = useState("");
  const [currentPDF, setCurrentPDF] = useState('')

  const isReady = uploadStatus === "success" || uploadStatus === "duplicate";

  async function handleUpload(e: any) {
    e.preventDefault();
    setUploadStatus("uploading");
    setUploadMessage("");
    setChatError("");
    const formData = new FormData(e.target);
    try {
      const response = await fetch("/api/embed", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setDocumentId(data.documentId);
      setMessages([])
      setCurrentPDF(data.fileName)
      if (data.alreadyExists) {
        setUploadStatus("duplicate");
        setUploadMessage("Already indexed — connected to existing document.");
      } else {
        setUploadStatus("success");
        setUploadMessage(`Processed · ${data.chunks} chunks indexed`);
      }
    } catch (error: any) {
      setUploadStatus("error");
      setUploadMessage(error.message || "Something went wrong");
    }
  }

  async function handleChat(e: any) {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);
    setChatError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question, documentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get answer");
      setMessages((prev) => [...prev, { question, answer: data.answer }]);
      setQuestion("");
    } catch (error: any) {
      setChatError(error.message || "Chat failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 flex flex-col items-center py-14 px-4">

      {/* Wordmark */}
      <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-zinc-900 font-medium mb-10">
        Folio
      </span>

      {/* Upload card */}
      <div className="w-full max-w-[420px] bg-white border border-zinc-200">

        <div className="px-5 py-3.5 border-b border-zinc-100">
          <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400">
            Document
          </span>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-3.5 p-5">
          <label
            htmlFor="pdf-upload"
            className="border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 py-6 cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[13px] text-zinc-500">
              Drop a PDF or click to browse
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Single document · PDF only
            </span>
            <input
              id="pdf-upload"
              name="document"
              type="file"
              accept="application/pdf"
              required
              disabled={uploadStatus === "uploading"}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={uploadStatus === "uploading"}
            className="bg-zinc-900 text-zinc-50 text-[13px] py-2.5 w-full hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploadStatus === "uploading" ? "Processing…" : "Process document"}
          </button>
        </form>

        {/* Status bar */}
        {uploadStatus !== "idle" && (
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isReady ? "bg-blue-600" :
              uploadStatus === "uploading" ? "bg-zinc-400 animate-pulse" :
                "bg-red-500"
              }`} />
            <span className="font-mono text-[11px] text-zinc-500">
              {uploadMessage || "Processing…"}
            </span>
          </div>
        )}
      </div>

      {/* Chat card — only shown when ready */}
      {isReady && (
        <div className="w-full max-w-[420px] bg-white border border-zinc-200 border-t-0">

          <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400">
              {currentPDF}
            </span>
            {messages.length > 0 && (
              <span className="font-mono text-[10px] text-zinc-400">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex flex-col divide-y divide-zinc-50">
            {messages.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <span className="font-mono text-[11px] text-zinc-400">
                  Ask a question about your document
                </span>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="px-5 py-4">
                  <p className="font-mono text-[11px] text-zinc-400 mb-1.5">
                    <span className="text-zinc-500">Q —</span> {msg.question}
                  </p>
                  <p className="text-[13px] text-zinc-700 leading-relaxed">
                    {msg.answer}
                  </p>
                </div>
              ))
            )}
          </div>

          {chatError && (
            <div className="px-5 py-3 border-t border-zinc-100 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="font-mono text-[11px] text-red-600">{chatError}</span>
            </div>
          )}

          {/* Input row */}
          <form
            onSubmit={handleChat}
            className="flex border-t border-zinc-100"
          >
            <input
              type="text"
              placeholder="Ask about your document…"
              value={question}
              disabled={isLoading}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-3 text-[13px] text-zinc-800 placeholder:text-zinc-400 bg-transparent outline-none border-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-3 border-l border-zinc-100 font-mono text-[10px] tracking-widest uppercase text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40"
            >
              {isLoading ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}