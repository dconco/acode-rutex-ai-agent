import { ProviderModelMeta } from './types'

const ollamaModels: ProviderModelMeta[] = [
{
id: 'llama3.1',
label: 'Llama 3.1',
contextWindow: 'Varies by local model build',
maxOutputTokens: 'Varies by local model build',
bestFor: ['Offline/local inference', 'Privacy-first workflows'],
notes: 'Local model info depends on what is installed in Ollama.'
}
]

export default ollamaModels
