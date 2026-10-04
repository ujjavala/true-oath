import fs from 'node:fs'

function loadEnv() {
  if (!fs.existsSync('.env')) return
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator < 1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnv()

const projectId = process.env.SANITY_PROJECT_ID === 'oqf9m6vy6' ? 'wak4l160' : (process.env.SANITY_PROJECT_ID || 'wak4l160')
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN
if (!token) throw new Error('SANITY_TOKEN or SANITY_API_TOKEN is required')

const documents = JSON.parse(fs.readFileSync('data/australia.json', 'utf8'))
const url = `https://${projectId}.api.sanity.io/v2025-02-19/data/mutate/${dataset}`
const batchSize = 100

for (let offset = 0; offset < documents.length; offset += batchSize) {
  const batch = documents.slice(offset, offset + batchSize)
  const response = await fetch(url, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations: batch.map((document) => ({createOrReplace: document}))}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.message || `Sanity mutation failed (${response.status})`)
  console.log(`Synced ${Math.min(offset + batch.length, documents.length)}/${documents.length} documents`)
}
