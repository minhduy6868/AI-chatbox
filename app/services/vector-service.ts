"use server"

import { google } from "@ai-sdk/google"
import { generateEmbedding } from "ai"

// Initialize the embedding model
const embeddingModel = google("embedding-001")

interface Document {
  id: string
  content: string
  embedding: number[]
}

// In-memory storage for documents and their embeddings
// In a real application, you would use a vector database
const documents: Document[] = []

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// Add a document to the vector store
export async function addDocument(id: string, content: string): Promise<void> {
  try {
    // Generate embedding for the document
    const { embedding } = await generateEmbedding({
      model: embeddingModel,
      input: content,
    })

    // Store the document with its embedding
    documents.push({ id, content, embedding })
  } catch (error) {
    console.error("Error adding document:", error)
  }
}

// Search for relevant documents based on a query
export async function searchDocuments(query: string, topK = 3): Promise<string[]> {
  try {
    // Generate embedding for the query
    const { embedding } = await generateEmbedding({
      model: embeddingModel,
      input: query,
    })

    // Calculate similarity scores
    const scoredDocuments = documents.map((doc) => ({
      ...doc,
      score: cosineSimilarity(embedding, doc.embedding),
    }))

    // Sort by similarity score (descending)
    scoredDocuments.sort((a, b) => b.score - a.score)

    // Return the top K documents
    return scoredDocuments.slice(0, topK).map((doc) => doc.content)
  } catch (error) {
    console.error("Error searching documents:", error)
    return []
  }
}

// Bulk add documents (useful for initialization)
export async function addDocuments(docs: { id: string; content: string }[]): Promise<void> {
  for (const doc of docs) {
    await addDocument(doc.id, doc.content)
  }
}

