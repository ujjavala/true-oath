const endpoint = process.env.TRUE_OATH_MCP_URL
const token = process.env.SANITY_ORG_TOKEN

if (!endpoint) throw new Error('TRUE_OATH_MCP_URL is required')
if (!token) throw new Error('SANITY_ORG_TOKEN is required')

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json, text/event-stream',
  'Content-Type': 'application/json',
}

let nextId = 1
let sessionId = ''

async function call(method, params = {}) {
  const requestHeaders = {...headers}
  if (sessionId) requestHeaders['Mcp-Session-Id'] = sessionId
  const response = await fetch(`${endpoint}?embeddings=true`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({jsonrpc: '2.0', id: nextId++, method, params}),
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`MCP ${response.status}: ${body.slice(0, 500)}`)
  sessionId = response.headers.get('mcp-session-id') || sessionId
  const line = body.split(/\r?\n/).find((value) => value.startsWith('data:'))
  return JSON.parse(line ? line.slice(5).trim() : body)
}

async function main() {
  const initialized = await call('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {name: 'true-oath-agent', version: '1.0.0'},
  })
  if (initialized.error) throw new Error(initialized.error.message)
  const tools = await call('tools/list')
  if (tools.error) throw new Error(tools.error.message)

  const available = tools.result?.tools?.map((tool) => tool.name) || []
  if (!available.includes('groq_query')) throw new Error(`Expected groq_query, received: ${available.join(', ')}`)

  const query = `*[_type in ["source", "promise", "evidence", "manifesto", "government"]] | order(_type asc, title asc) {
    _type, title, party, category, status, confidence, summary, finding,
    publisher, url, publishedAt, observedAt,
    "sourceTitle": source->title,
    "sourceUrl": source->url,
    "promiseTitle": relatedPromise->title
  }`
  const result = await call('tools/call', {name: 'groq_query', arguments: {query}})
  if (result.error) throw new Error(result.error.message)

  console.log(JSON.stringify({
    agent: 'true-oath-agent',
    question: 'What Australian commitments are supported by official evidence, and where is the record incomplete?',
    endpoint,
    tools: available,
    result: result.result,
  }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
