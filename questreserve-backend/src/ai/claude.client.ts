const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: unknown,
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

interface CallClaudeOptions {
  system: string;
  user: string;
  model?: string;
}

export async function callClaude({ system, user, model = DEFAULT_MODEL }: CallClaudeOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClaudeApiError('ANTHROPIC_API_KEY is not configured', 0, null);
  }

  const response = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ClaudeApiError(
      `Anthropic API error ${response.status}: ${response.statusText}`,
      response.status,
      errorBody,
    );
  }

  const data = await response.json().catch(() => {
    throw new ClaudeApiError('Malformed response from Anthropic API', 0, null);
  });

  const text = (data as any)?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new ClaudeApiError('Unexpected response shape from Anthropic API', 0, data);
  }

  return text;
}
