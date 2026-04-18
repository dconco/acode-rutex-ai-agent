import { GoogleGenAI } from '@google/genai'
import { aiSettings } from '../settings'
import { ToolsFunction } from '../tools/functions/types'
import { tools as ollamaTools } from '../tools/ollama_tools'
import { Usage, StreamChunk, ChatMessage } from '../types'

// ─────────────────────────────────────────────
// Gemini
// ─────────────────────────────────────────────

export default async function* (
	model: string,
	messages: ChatMessage[],
	signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
	const ai = new GoogleGenAI({ apiKey: aiSettings.apiKeys.gemini })

	const contents: any[] = messages.map(m => {
		if (m.role === 'assistant') {
			const parts: any[] = []
			if (m.content) parts.push({ text: m.content })

			if (m.tool_calls?.length) {
				for (const tc of m.tool_calls) {
					if (!tc?.function?.name) continue
					parts.push({
						functionCall: {
							id: tc.id,
							name: tc.function.name,
							args: tc.function.arguments ?? {}
						}
					})
				}
			}

			return { role: 'model', parts: parts.length ? parts : [{ text: '' }] }
		}

		if (m.role === 'tool') {
			return {
				role: 'user',
				parts: [
					{
						functionResponse: {
							name: m.tool_name || 'unknown_tool',
							response: { result: m.content }
						}
					}
				]
			}
		}

		return { role: 'user', parts: [{ text: m.content }] }
	})

	const functionDeclarations = ollamaTools.map(tool => ({
		name: tool.function.name,
		description: tool.function.description,
		parameters: tool.function.parameters
	}))

	const config: any = {
		systemInstruction: aiSettings.systemInstruction,
		temperature: aiSettings.temperature,
		maxOutputTokens: aiSettings.maxTokens,
		tools: [{ functionDeclarations }]
	}

	let fullText = ''
	let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }

	while (true) {
		if (signal?.aborted) break

		const stream = await ai.models.generateContentStream({
			model,
			contents,
			config
		})

		const toolCalls: any[] = []
		const seenToolCallIds = new Set<string>()
		let turnText = ''

		for await (const chunk of stream) {
			if (signal?.aborted) break

			const functionCalls = (chunk as any).functionCalls as any[] | undefined
			if (functionCalls?.length) {
				for (const call of functionCalls) {
					const id = call?.id ?? `${call?.name}:${JSON.stringify(call?.args ?? {})}`
					if (seenToolCallIds.has(id)) continue
					seenToolCallIds.add(id)
					toolCalls.push(call)
				}
			}

			const delta = chunk.text ?? ''
			if (delta) {
				turnText += delta
				fullText += delta
				yield { type: 'text', delta, model }
			}

			const meta = (
				chunk as unknown as {
					usageMetadata?: {
						promptTokenCount?: number
						candidatesTokenCount?: number
						totalTokenCount?: number
					}
				}
			).usageMetadata

			if (meta) {
				usage = {
					inputTokens: meta.promptTokenCount ?? 0,
					outputTokens: meta.candidatesTokenCount ?? 0,
					totalTokens: meta.totalTokenCount ?? 0
				}
			}
		}

		if (!toolCalls.length) break

		const modelParts: any[] = []
		if (turnText) modelParts.push({ text: turnText })

		for (const call of toolCalls) {
			modelParts.push({
				functionCall: {
					id: call.id,
					name: call.name,
					args: call.args ?? {}
				}
			})
		}

		contents.push({
			role: 'model',
			parts: modelParts.length ? modelParts : [{ text: '' }]
		})

		const functionResponses: any[] = []

		for (const call of toolCalls) {
			if (!call?.name) continue

			try {
				const toolFunction: ToolsFunction = (
					await require(`../tools/functions/${call.name}`)
				).default

				const args = call.args ?? {}
				const chunkedResult = toolFunction(args)

				let resultContent = ''

				for await (const toolChunk of chunkedResult) {
					if (toolChunk.toSave) {
						yield { type: 'tool', delta: toolChunk.toSave }
					}

					if (toolChunk.result) {
						resultContent = toolChunk.result
						break
					}
				}

				functionResponses.push({
					id: call.id,
					name: call.name,
					response: { result: resultContent || '[NO RESULT]' }
				})
			} catch (e: any) {
				const errorMessage = e instanceof Error ? e.message : 'Unknown error'
				clg(errorMessage)

				functionResponses.push({
					id: call.id,
					name: call.name,
					response: { result: `[ERROR] ${errorMessage}` }
				})
			}
		}

		contents.push({
			role: 'user',
			parts: functionResponses.map(functionResponse => ({ functionResponse }))
		})
	}

	yield { type: 'done', text: fullText, provider: 'gemini', model, usage }
}
