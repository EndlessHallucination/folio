'use client'
import { useState } from "react";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<
    { question: string; answer: string }[]
  >([]);

  async function handleUpload(e: any) {
    e.preventDefault();

    setIsUploading(true);

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        body: formData,
      });


      if (response.ok) {
        setIsReady(true);
      }
    } catch (error) {
      console.log(error);
    }

    setIsUploading(false);
  }

  async function handleChat(e: any) {
    e.preventDefault();

    if (!question.trim()) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: question,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            question,
            answer: data.answer,
          },
        ]);

        setQuestion("");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>FOLIO</h1>

      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <label htmlFor="pdf-upload">Upload PDF</label>

        <input
          id="pdf-upload"
          name="document"
          type="file"
          accept="application/pdf"
          required
        />

        <button type="submit">Upload</button>

        {isUploading && <p>Uploading PDF...</p>}

        {isReady && <p>Ready to chat ✅</p>}
      </form>
      {isReady && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "400px",
          }}
        >
          <form
            onSubmit={handleChat}
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
              }}
            />

            <button type="submit">Send</button>
          </form>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>Question:</strong> {message.question}
                </p>

                <p>
                  <strong>Answer:</strong> {message.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}