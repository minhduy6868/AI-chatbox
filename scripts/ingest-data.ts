import { addDocuments } from "../app/services/vector-service"
import { fetchExternalData } from "../app/services/data-service"

async function ingestData() {
  console.log("Fetching data from external API...")

  // You might need to modify this to fetch all your data
  // This is just an example
  const data = await fetchExternalData("")

  console.log(`Found ${data.length} documents to ingest.`)

  // Format the data for ingestion
  const documents = data.map((item) => ({
    id: item.id,
    content: item.content,
  }))

  // Add documents to the vector store
  await addDocuments(documents)

  console.log("Data ingestion complete!")
}

ingestData().catch(console.error)

