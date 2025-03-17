"use server"

// This is a mock news service that generates synthetic news articles
// It's useful as a fallback when the real News API is unavailable

import type { NewsArticle } from "./news-service"

// List of companies and topics we can generate news about
const TOPICS = [
  {
    name: "Tesla",
    sources: ["TechCrunch", "Bloomberg", "Reuters", "CNBC", "The Verge"],
    headlines: [
      "Tesla Reports Record Quarterly Deliveries",
      "Tesla Expands Supercharger Network in Europe",
      "Tesla's New Battery Technology Promises Longer Range",
      "Tesla Stock Rises on Strong Sales in China",
      "Tesla Announces New Factory Location",
    ],
    content: [
      "Tesla has reported record quarterly deliveries, exceeding analyst expectations despite ongoing supply chain challenges. The electric vehicle maker delivered over 300,000 vehicles in the last quarter, representing a significant increase year-over-year.",
      "Tesla continues its aggressive expansion of Supercharger stations across Europe, with plans to double the network size by the end of the year. This expansion aims to address range anxiety and support the growing fleet of Tesla vehicles in the region.",
      "Tesla has unveiled a new battery technology that promises to increase range by up to 20% while reducing costs. The new cells are expected to enter production next year.",
      "Tesla's stock rose following reports of strong sales in China, where the company has been gaining market share despite increased competition from local manufacturers.",
      "Tesla has announced plans for a new factory that will focus on producing the company's energy products, including solar panels and battery storage systems.",
    ],
  },
  {
    name: "Apple",
    sources: ["9to5Mac", "Bloomberg", "CNBC", "The Verge", "Reuters"],
    headlines: [
      "Apple Unveils New iPhone with Revolutionary Camera",
      "Apple's Services Revenue Hits All-Time High",
      "Apple Announces Major Update to MacOS",
      "Apple's AR Headset Development Progressing Rapidly",
      "Apple Opens New Campus in Europe",
    ],
    content: [
      "Apple has unveiled its latest iPhone model featuring a revolutionary camera system that uses computational photography to deliver unprecedented image quality in low light conditions.",
      "Apple's services revenue has hit an all-time high, accounting for over 20% of the company's total revenue. The growth is driven by strong performance across Apple Music, iCloud, and the App Store.",
      "Apple has announced a major update to MacOS that includes new productivity features, enhanced privacy protections, and improved integration with iOS devices.",
      "Development of Apple's augmented reality headset is progressing rapidly, with sources suggesting a potential launch within the next 12 months. The device is expected to feature advanced eye and hand tracking.",
      "Apple has opened a new campus in Europe that will focus on chip design and artificial intelligence research. The facility represents a significant investment in the region.",
    ],
  },
  {
    name: "AI",
    sources: ["MIT Technology Review", "Wired", "TechCrunch", "VentureBeat", "The Verge"],
    headlines: [
      "New AI Model Achieves Human-Level Performance on Complex Tasks",
      "AI Ethics Board Proposes New Guidelines for Responsible Development",
      "AI-Powered Drug Discovery Platform Identifies Promising Cancer Treatment",
      "Open Source AI Framework Gains Widespread Adoption",
      "AI Researchers Make Breakthrough in Natural Language Understanding",
    ],
    content: [
      "A new AI model has achieved human-level performance on a range of complex tasks, including reasoning, planning, and creative problem-solving. The breakthrough represents a significant step toward more general artificial intelligence.",
      "An international AI ethics board has proposed new guidelines for responsible AI development, emphasizing transparency, fairness, and accountability. The guidelines aim to address growing concerns about AI bias and misuse.",
      "An AI-powered drug discovery platform has identified a promising new treatment for certain types of cancer. The system analyzed millions of potential compounds to identify candidates that target specific cancer cell mechanisms.",
      "An open source AI framework has gained widespread adoption among researchers and developers, with contributions from major tech companies and academic institutions. The platform aims to democratize access to advanced AI capabilities.",
      "AI researchers have made a breakthrough in natural language understanding, developing a system that can grasp nuanced meanings, cultural references, and implicit knowledge in text. The advance could lead to more sophisticated AI assistants and translation systems.",
    ],
  },
]

// Generate a random date within the last week
async function getRecentRandomDate(): Promise<string> {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 7) // 0-6 days ago
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Generate a mock news article
async function generateMockArticle(topic: string): Promise<NewsArticle> {
  // Find a matching topic or use a random one
  const topicData =
    TOPICS.find((t) => t.name.toLowerCase().includes(topic.toLowerCase())) ||
    TOPICS[Math.floor(Math.random() * TOPICS.length)]

  // Pick random elements
  const headlineIndex = Math.floor(Math.random() * topicData.headlines.length)
  const sourceIndex = Math.floor(Math.random() * topicData.sources.length)

  return {
    source: {
      id: null,
      name: topicData.sources[sourceIndex],
    },
    author: `${["John", "Jane", "Michael", "Sarah", "David"][Math.floor(Math.random() * 5)]} ${["Smith", "Johnson", "Williams", "Brown", "Jones"][Math.floor(Math.random() * 5)]}`,
    title: topicData.headlines[headlineIndex],
    description: topicData.content[headlineIndex].substring(0, 100) + "...",
    url: `https://example.com/news/${topicData.name.toLowerCase()}-${headlineIndex}`,
    urlToImage: null,
    publishedAt: await getRecentRandomDate(),
    content: topicData.content[headlineIndex],
  }
}

// Generate multiple mock articles for a query
export async function generateMockNewsArticles(query: string, count = 5): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = []

  // Extract key terms from the query
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)

  // Find matching topics
  const matchingTopics = TOPICS.filter((topic) => terms.some((term) => topic.name.toLowerCase().includes(term)))

  // If we have matching topics, use them; otherwise use random topics
  const topicsToUse = matchingTopics.length > 0 ? matchingTopics : TOPICS

  // Generate articles
  for (let i = 0; i < count; i++) {
    const topicIndex = i % topicsToUse.length
    articles.push(await generateMockArticle(topicsToUse[topicIndex].name))
  }

  return articles
}

