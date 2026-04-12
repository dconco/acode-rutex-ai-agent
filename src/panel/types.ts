export type MessageRole = 'user' | 'ai'

export interface ChatMessage {
	role: MessageRole
	text: string
	ctxName?: string | null
}

export interface ContextFile {
	/**
	 * File unique id.
	 */
	id: string
	filename: string
	previewName: string
	previewUri: string
	location: string
	uri: string
}

export interface AIPanelAPI {
	addContext: (file: ContextFile) => void
	clearContext: () => void
	clear: () => void
}
