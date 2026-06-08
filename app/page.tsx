'use client'
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<
    { question: string; answer: string }[]
  >([]);

  const [documentId, setDocumentId] = useState<string | null>(null);

  const [uploadStatus, setUploadStatus] = useState<
    "idle" |
    "uploading" |
    "success" |
    "duplicate" |
    "error"
  >("idle");

  const [uploadMessage, setUploadMessage] = useState("");

  const [chatError, setChatError] = useState("");

  const isReady = uploadStatus === "success" || uploadStatus === "duplicate"

  async function handleUpload(e: any) {
    e.preventDefault();

    setUploadStatus("uploading");
    setUploadMessage("");
    setChatError("");

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setDocumentId(data.documentId);

      if (data.alreadyExists) {
        setUploadStatus("duplicate");
        setUploadMessage(
          `PDF already exists. Connected to existing document.`
        );
      } else {
        setUploadStatus("success");
        setUploadMessage(
          `PDF processed successfully. ${data.chunks} chunks embedded.`
        );
      }
    } catch (error: any) {
      console.log(error);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: question,
          documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      setMessages((prev) => [
        ...prev,
        {
          question,
          answer: data.answer,
        },
      ]);

      setQuestion("");
    } catch (error: any) {
      console.log(error);

      setChatError(error.message || "Chat failed");
    } finally {
      setIsLoading(false);
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
          disabled={uploadStatus === "uploading"}
        />

        <button type="submit">Upload</button>

        {uploadStatus === "uploading" && (
          <p>Uploading and processing PDF...</p>
        )}

        {uploadStatus === "success" && (
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            {uploadMessage}
          </div>
        )}

        {uploadStatus === "duplicate" && (
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#fff8e1",
              color: "#ef6c00",
            }}
          >
            {uploadMessage}
          </div>
        )}

        {uploadStatus === "error" && (
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#ffebee",
              color: "#c62828",
            }}
          >
            {uploadMessage}
          </div>
        )}

        {isReady && (
          <p
            style={{
              color: "#4caf50",
              fontWeight: "bold",
            }}
          >
            Ready to chat ✅
          </p>
        )}
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
              disabled={isLoading}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
              }}
            />

            <button disabled={isLoading} type="submit">
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </form>

          {chatError && (
            <div
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: "#ffebee",
                color: "#c62828",
              }}
            >
              {chatError}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  border: "1px dashed #ccc",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                Ask questions about your PDF.
              </div>
            )}
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