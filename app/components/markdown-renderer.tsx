interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parsing for common elements
  const formatMarkdown = (text: string) => {
    // Convert markdown to HTML
    let formattedText = text

    // Handle bold text
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Handle italic text
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Handle code blocks
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

    // Handle inline code
    formattedText = formattedText.replace(/`(.*?)`/g, "<code>$1</code>")

    // Handle lists
    formattedText = formattedText.replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>")
    formattedText = formattedText.replace(/<li>(.*?)<\/li>/g, "<ul><li>$1</li></ul>")

    // Handle headers
    formattedText = formattedText.replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    formattedText = formattedText.replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    formattedText = formattedText.replace(/^# (.*?)$/gm, "<h1>$1</h1>")

    // Handle links
    formattedText = formattedText.replace(
      /\[(.*?)\]$$(.*?)$$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // Handle paragraphs
    formattedText = formattedText.replace(/\n\n/g, "</p><p>")

    return formattedText
  }

  return <div className="markdown-content text-sm" dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }} />
}

