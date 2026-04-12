import { ProviderModelMeta } from './types'

const openRouterModels: ProviderModelMeta[] = [
{
id: 'anthropic/claude-opus-4',
label: 'Anthropic / Claude Opus 4',
contextWindow: '200K tokens',
maxOutputTokens: '8K tokens',
bestFor: ['High-end reasoning', 'Long context tasks', 'Complex coding'],
notes: 'Premium model via OpenRouter.'
},
{
id: 'openai/gpt-4o',
label: 'OpenAI / GPT-4o',
contextWindow: '128K tokens',
maxOutputTokens: '16K tokens',
bestFor: ['General coding', 'Balanced quality/speed', 'Multimodal tasks'],
notes: 'Popular stable default.'
},
{
id: 'google/gemini-2.5-flash',
label: 'Google / Gemini 2.5 Flash',
contextWindow: '1M tokens',
maxOutputTokens: '64K tokens',
bestFor: ['Long context', 'Fast responses', 'Cost-aware workflows'],
notes: 'Fast and broad context model.'
}
]

export default openRouterModels
