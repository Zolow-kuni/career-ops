import Anthropic from '@anthropic-ai/sdk'

export function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY not set — add it to web/.env.local')
  return new Anthropic({ apiKey: key })
}

export async function ask(system: string, user: string): Promise<string> {
  const client = getClient()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}
