import { ProviderModelMeta } from './types'

const openaiModels: ProviderModelMeta[] = [
{
id: 'gpt-4o',
label: 'GPT-4o',
contextWindow: '128K tokens',
maxOutputTokens: '16K tokens',
bestFor: ['General chat', 'Code generation', 'Multimodal workflows'],
notes: 'Balanced speed and quality.'
},
{
id: 'gpt-4.1',
label: 'GPT-4.1',
contextWindow: '1M tokens',
maxOutputTokens: '32K tokens',
bestFor: ['Long-context coding', 'Complex reasoning', 'Tool use'],
notes: 'Great for large codebase understanding.'
},
{
id: 'o4-mini',
label: 'o4-mini',
contextWindow: '200K tokens',
maxOutputTokens: '100K tokens',
bestFor: ['Fast reasoning', 'Lower-cost automation', 'Structured tasks'],
notes: 'Reasoning optimized with lower latency.'
}
]

export default openaiModels
