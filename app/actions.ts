"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { getNewsContext, fetchNewsArticles, formatArticlesForContext } from "./services/news-service"

// Initialize the Google Generative AI model
const geminiModel = google("gemini-1.5-pro-latest")

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function sendMessage(message: string, previousMessages: Message[]): Promise<string> {
  try {
    // Check if the user is explicitly asking for news
    const isNewsQuery = /news|latest|update|recent|article/i.test(message)

    // Get relevant news context
    let newsContext = ""
    let usingFallbackData = false

    try {
      if (isNewsQuery) {
        // For news queries, use the user's message directly as the query
        // This allows the API to search based on the user's exact question
        const articles = await fetchNewsArticles(message)
        newsContext = await formatArticlesForContext(articles, 5) // Using await here

        // Check if we're using fallback data (this is a simple heuristic)
        usingFallbackData = articles.some(
          (article) => article.source.id === "sample" || article.url.includes("example.com"),
        )
      } else {
        // For regular queries, just get some potentially relevant news
        newsContext = await getNewsContext(message)
      }
    } catch (error) {
      console.error("Error processing news data:", error)
      // Continue without news context if there's an error
      newsContext = ""
      usingFallbackData = true
    }

    // Format messages for the conversation history
    const messages = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    messages.push({ role: "user", content: message })

    // Create a system prompt that includes the relevant news context
    let systemPrompt =
      "You are a helpful, friendly AI assistant with access to recent news. Provide accurate, concise, and helpful responses. Format your responses using markdown for better readability when appropriate."

    if (newsContext) {
      if (usingFallbackData) {
        systemPrompt +=
          "\n\nNote: I'm currently using sample news data as I couldn't access the latest news. The following information may not be current:"
      }

      systemPrompt += "\n\nHere are some news articles that might be relevant to the user's query:\n\n" + newsContext

      if (isNewsQuery) {
        systemPrompt +=
          "\n\nThe user is specifically asking for news information. Summarize the relevant news articles in your response. Always cite your sources by mentioning the news outlet name."

        if (usingFallbackData) {
          systemPrompt += " Make it clear that you're providing sample information rather than the latest news."
        }
      } else {
        systemPrompt +=
          "\n\nUse this information to answer the user's question if relevant. If the information doesn't help with the question, just respond based on your general knowledge. When using information from the articles, mention the source."
      }
    } else if (isNewsQuery) {
      // If we couldn't get news but the user asked for it
      systemPrompt +=
        "\n\nThe user is asking for news, but I couldn't retrieve the latest articles. Please provide general information about the topic and mention that it's not based on the very latest news."
    }

    // Generate response using Gemini with proper conversation history and news context
    const { text } = await generateText({
      model: geminiModel,
      messages: messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating response:", error)
    // Check for API key issues
    if (error instanceof Error && error.message.includes("API key")) {
      return "Error: API key issue. Please check your GOOGLE_GENERATIVE_AI_API_KEY environment variable."
    }
    return "I'm sorry, I encountered an error while processing your request. Please try again."
  }
}

