import { ProviderModelMeta } from './types'

const geminiModels: ProviderModelMeta[] = [
	{
		id: 'gemini-2.5-flash',
		label: 'Gemini 2.5 Flash',
		contextWindow: '1M tokens',
		maxOutputTokens: '64K tokens',
		bestFor: ['Fast coding help', 'General chat', 'Tool-heavy apps'],
		notes: 'Great default for speed and cost.'
	},
	{
		id: 'gemini-2.5-pro',
		label: 'Gemini 2.5 Pro',
		contextWindow: '1M tokens',
		maxOutputTokens: '64K tokens',
		bestFor: ['Complex reasoning', 'Architecture decisions', 'Long contexts'],
		notes: 'Higher quality than Flash for hard tasks.'
	},
	{
		id: 'gemini-2.0-flash',
		label: 'Gemini 2.0 Flash',
		contextWindow: '1M tokens',
		maxOutputTokens: '8K tokens',
		bestFor: ['Low-latency requests', 'Basic edits', 'Interactive sessions'],
		notes: 'Reliable low-latency model.'
	}
]

export default geminiModels
