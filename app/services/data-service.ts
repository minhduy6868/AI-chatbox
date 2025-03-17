"use server"

// This is a placeholder for your actual API endpoint
const EXTERNAL_API_URL = "https://your-api-endpoint.com/data"

export interface ExternalData {
  id: string
  content: string
  // Add other fields as needed
}

export async function fetchExternalData(query: string): Promise<ExternalData[]> {
  try {
    // You can modify this to include query parameters or other options
    const response = await fetch(`${EXTERNAL_API_URL}?query=${encodeURIComponent(query)}`, {
      headers: {
        // Add any required headers for your API
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${process.env.YOUR_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data as ExternalData[]
  } catch (error) {
    console.error("Error fetching external data:", error)
    return []
  }
}

// This function extracts the most relevant information from your data
// based on the user's query
export async function getRelevantContext(query: string): Promise<string> {
  const data = await fetchExternalData(query)

  if (data.length === 0) {
    return ""
  }

  // Simple approach: concatenate all content
  // In a production app, you might want to:
  // 1. Use embeddings to find the most relevant pieces
  // 2. Limit the total context length
  // 3. Format the data in a structured way

  const context = data.map((item) => item.content).join("\n\n")

  return context
}

