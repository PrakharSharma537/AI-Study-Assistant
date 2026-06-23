# PYQ Analyzer – AI Study Assistant 🎯

An AI-powered study assistant that helps students analyze previous year question (PYQ) papers for DSA using a RAG (Retrieval-Augmented Generation) pipeline — eliminating manual paper review.

---

## 🚀 Features

- 📄 Ingests 4 years of previous year DSA question papers
- 🔍 Semantic vector search scoped per subject using Pinecone
- 🤖 Context-aware answers powered by Google Gemini API
- 🧠 Full RAG pipeline built with LangChain.js
- ⚡ Real-time student interaction via React.js frontend

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| AI / LLM | Google Gemini API, LangChain.js |
| Vector DB | Pinecone |
| Language | JavaScript (ES6+) |

---

## ⚙️ How It Works

```
PDF Question Papers
       ↓
Document Loading (LangChain.js)
       ↓
Text Splitting
       ↓
Embedding Generation (Gemini)
       ↓
Vector Storage (Pinecone)
       ↓
User Query → Semantic Search → Context Retrieval → LLM Answer
```

---
## 🧠 RAG Pipeline Details

- **Document Loading** — LangChain.js PDF loaders parse question papers
- **Text Splitting** — Chunks documents for optimal retrieval
- **Embedding** — Gemini generates semantic embeddings
- **Storage** — Pinecone stores vectors, scoped per subject
- **Retrieval** — Semantic search fetches relevant context
- **Generation** — Gemini generates context-aware answers

---
