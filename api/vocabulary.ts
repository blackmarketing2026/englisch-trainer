const owner = process.env.GITHUB_OWNER ?? 'blackmarketing2026'
const repo = process.env.GITHUB_REPO ?? 'englisch-trainer'
const branch = process.env.GITHUB_BRANCH ?? 'main'
const filePath = process.env.GITHUB_VOCABULARY_PATH ?? 'data/vocabulary.json'
const token = process.env.VOCABULARY_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN

interface GitHubContentResponse {
  content?: string
  sha?: string
}

interface GitHubErrorResponse {
  message?: string
  documentation_url?: string
}

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

function send(response: ApiResponse, body: unknown, status = 200) {
  response.setHeader('cache-control', 'no-store')
  response.status(status).json(body)
}

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64')
}

function decodeBase64(value: string) {
  return Buffer.from(value.replace(/\n/g, ''), 'base64').toString('utf8')
}

async function readGitHubError(response: Response) {
  try {
    const payload = (await response.json()) as GitHubErrorResponse
    return payload.message ? `${payload.message}${payload.documentation_url ? ` (${payload.documentation_url})` : ''}` : response.statusText
  } catch {
    return response.statusText
  }
}

async function getVocabularyFile(): Promise<{ items: unknown[]; sha?: string }> {
  if (!token) throw new Error('VOCABULARY_GITHUB_TOKEN is missing')

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
  })

  if (response.status === 404) return { items: [] }
  if (!response.ok) throw new Error(`GitHub read failed: ${response.status} - ${await readGitHubError(response)}`)

  const payload = (await response.json()) as GitHubContentResponse
  const content = payload.content ? decodeBase64(payload.content) : '[]'
  const parsed = JSON.parse(content) as unknown
  return { items: Array.isArray(parsed) ? parsed : [], sha: payload.sha }
}

async function saveVocabularyFile(items: unknown[]) {
  if (!token) throw new Error('VOCABULARY_GITHUB_TOKEN is missing')

  const current = await getVocabularyFile()
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify({
      message: 'Update online vocabulary',
      content: encodeBase64(`${JSON.stringify(items, null, 2)}\n`),
      branch,
      sha: current.sha,
    }),
  })

  if (!response.ok) throw new Error(`GitHub write failed: ${response.status} - ${await readGitHubError(response)}`)
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    if (request.method === 'GET') {
      const file = await getVocabularyFile()
      send(response, { items: file.items })
      return
    }

    if (request.method === 'PUT') {
      const payload = typeof request.body === 'string'
        ? (JSON.parse(request.body) as { items?: unknown[] })
        : (request.body as { items?: unknown[] })
      if (!Array.isArray(payload.items)) {
        send(response, { error: 'items must be an array' }, 400)
        return
      }
      await saveVocabularyFile(payload.items)
      send(response, { ok: true })
      return
    }

    send(response, { error: 'Method not allowed' }, 405)
  } catch (error) {
    send(response, { error: error instanceof Error ? error.message : 'Unknown error' }, 503)
  }
}
