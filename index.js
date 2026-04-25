import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as dotenv from 'dotenv';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import cors from 'cors';

dotenv.config();

const GEMINI_API_KEY      = "YOUR GEMINI API_KEY";
const PINECONE_API_KEY    = "YOUR PINECONE_KEY";
const PINECONE_INDEX_NAME = "YOUR PINECONE INDEX_NAME";
const INITIAL_UPLOAD    = false;

const genAI       = new GoogleGenerativeAI(GEMINI_API_KEY);
const pinecone    = new Pinecone({ apiKey: PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  modelName: "gemini-embedding-2-preview",
  outputDimensionality: 768,
});

if (INITIAL_UPLOAD) {
  console.log("📄 Loading PDF and uploading to Pinecone...");
  const loader = new PDFLoader("./dsa.pdf");
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const chunkedDocs = await splitter.splitDocuments(docs);
  await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    textKey: 'text',
  });
  console.log("✅ Data indexed successfully!");
} else {
  console.log("🚀 Skipping upload — using existing Pinecone data.");
}

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {

    const queryVector = await embeddings.embedQuery(question);
    const searchResults = await pineconeIndex.query({
      topK: 3,
      vector: queryVector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .map(m => m.metadata?.text || "")
      .filter(Boolean)
      .join("\n\n---\n\n");
    const validHistory = (history || []).filter(
      m => m.role === "user" || m.role === "model"
    );

    const contents = [
      ...validHistory,
      { role: "user", parts: [{ text: question }] }
    ];
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are a DSA Expert. Use this context to answer:\n\n${context}`,
    });

    const result = await model.generateContent({ contents });
    const answer = result.response.text();
    res.json({ answer });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Backend running on http://localhost:3000"));

