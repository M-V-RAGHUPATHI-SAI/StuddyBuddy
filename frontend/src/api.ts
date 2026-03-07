// src/api.ts

const API_BASE = "http://127.0.0.1:5000"; // Flask backend URL

// Upload PDF
export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("pdf", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload PDF");
  return res.json();
}

// Ask Question
export async function askQuestion(query: string) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error("Failed to get response");
  return res.json();
}
