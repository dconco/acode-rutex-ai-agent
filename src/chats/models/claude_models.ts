import { ProviderModelMeta } from './types'

const claudeModels: ProviderModelMeta[] = [
	{
		id: 'claude-sonnet-4-6',
		label: 'Claude Sonnet 4.6',
		contextWindow: '200K tokens',
		maxOutputTokens: '8K tokens',
		bestFor: ['Coding tasks', 'Analysis', 'Agentic workflows'],
		notes: 'Default high-quality Claude option.'
	},
	{
		id: 'claude-opus-4-6',
		label: 'Claude Opus 4.6',
		contextWindow: '200K tokens',
		maxOutputTokens: '8K tokens',
		bestFor: ['Deep reasoning', 'Complex planning', 'Long-form output'],
		notes: 'Highest quality Claude model.'
	},
	{
		id: 'claude-haiku-4-5',
		label: 'Claude Haiku 4.5',
		contextWindow: '200K tokens',
		maxOutputTokens: '8K tokens',
		bestFor: ['Fast responses', 'Low-latency tasks', 'Lightweight chats'],
		notes: 'Best speed/cost profile in Claude family.'
	}
]

export default claudeModels
