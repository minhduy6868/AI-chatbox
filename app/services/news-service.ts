"use server"

import newsCache from "./cache-service";
import { generateMockNewsArticles } from "./mock-news-service"

const NEWS_API_BASE_URL = "https://newsapi.org/v2/everything"
const NEWS_API_KEY =  "a24d8e820ab644649dac2dd34138a59e"

// The earliest date we can fetch from according to the API constraints
const EARLIEST_ALLOWED_DATE = "2025-02-17"

export interface NewsArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string
}

export interface NewsResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

export async function fetchNewsArticles(query: string): Promise<NewsArticle[]> {
  try {
    // Check cache first
    const cacheKey = `news:${query}`
    const cachedData = newsCache.get(cacheKey)

    if (cachedData) {
      console.log(`Using cached news data for query: ${query}`)
      return cachedData
    }

    // Build the API URL with the specific structure requested
    // Using the fixed date from the earliest allowed date
    const url = `${NEWS_API_BASE_URL}?q=${encodeURIComponent(query)}&from=${EARLIEST_ALLOWED_DATE}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`

    console.log(`Fetching news with URL: ${url}`)

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`News API request failed with status ${response.status}: ${errorText}`)
        // Use mock news service instead
        throw new Error(`News API request failed: ${errorText}`)
      }

      const data: NewsResponse = await response.json()

      if (data.status !== "ok") {
        console.error(`News API returned status: ${data.status}`)
        throw new Error(`News API returned status: ${data.status}`)
      }

      // Cache the results
      newsCache.set(cacheKey, data.articles)

      return data.articles
    } catch (error) {
      console.log("Falling back to mock news service")
      // Use our mock news service as a fallback
      const mockArticles = await generateMockNewsArticles(query)

      // Cache the mock results too
      newsCache.set(cacheKey, mockArticles)

      return mockArticles
    }
  } catch (error) {
    console.error("Error in fetchNewsArticles:", error)
    // Final fallback - generate mock news
    return await generateMockNewsArticles(query)
  }
}

// Function to format articles into a context string
export async function formatArticlesForContext(articles: NewsArticle[], maxArticles = 5): Promise<string> {
  if (articles.length === 0) {
    return ""
  }

  // Take only the most recent articles up to maxArticles
  const recentArticles = articles.slice(0, maxArticles)

  // Format each article
  const formattedArticles = recentArticles.map((article, index) => {
    return `ARTICLE ${index + 1}:
Title: ${article.title}
Date: ${new Date(article.publishedAt).toLocaleDateString()}
Source: ${article.source.name}${article.author ? ` | Author: ${article.author}` : ""}
Summary: ${article.description || "No description available"}
Content: ${article.content?.replace(/\[\+\d+ chars\]$/, "") || article.description || "No content available"}
URL: ${article.url}
---`
  })

  return formattedArticles.join("\n\n")
}

// Function to get relevant news context based on a query
export async function getNewsContext(query: string): Promise<string> {
  try {
    // Extract key terms from the query for better news search
    const searchTerms = extractSearchTerms(query)

    // Fetch articles related to the search terms
    const articles = await fetchNewsArticles(searchTerms)

    // Format the articles for context
    return await formatArticlesForContext(articles)
  } catch (error) {
    console.error("Error getting news context:", error)
    return "" // Return empty string on error to avoid breaking the chat
  }
}

// Helper function to extract key search terms from a query
// Not exported, so doesn't need to be async
function extractSearchTerms(query: string): string {
  // Remove common words and punctuation
  const stopWords = [
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "like",
    "through",
    "over",
    "before",
    "between",
    "after",
    "since",
    "without",
    "under",
    "within",
    "along",
    "following",
    "across",
    "behind",
    "beyond",
    "plus",
    "except",
    "but",
    "up",
    "out",
    "around",
    "down",
    "off",
    "above",
    "near",
    "and",
    "or",
    "but",
    "if",
    "then",
    "else",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
    "should",
    "now",
    "what",
    "get",
    "tell",
    "me",
    "about",
    "give",
    "information",
  ]

  // Split the query into words, convert to lowercase, and filter out stop words
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word))

  // If no significant words found, return a default term or the original query
  if (words.length === 0) {
    // Try to extract any proper nouns or capitalized words from the original query
    const properNouns = query
      .split(/\s+/)
      .filter((word) => word.length > 1 && word[0] === word[0].toUpperCase() && word[1] === word[1].toLowerCase())

    if (properNouns.length > 0) {
      return properNouns.join(" ")
    }

    // If still nothing, just return the first few words of the query
    return query.split(/\s+/).slice(0, 3).join(" ")
  }

  // Join the most relevant words (up to 5) for the search query
  return words.slice(0, 5).join(" ")
}

