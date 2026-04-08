export type MessageRole = 'user' | 'ai'

export interface ChatMessage {
	role: MessageRole
	text: string
	ctxName?: string | null
}

export interface ContextFile {
	name: string
	content: string
	path?: string
}

export interface FileLike {
	name?: string
	filename?: string
	path?: string
	uri?: string
	url?: string
	location?: string
	fullPath?: string
	content?: string
	file?: FileLike
	session?: {
		getValue?: () => string
	}
	editor?: {
		getValue?: () => string
	}
}

export interface EditorManagerLike {
	files?: FileLike[]
	openFiles?: FileLike[]
	editorFiles?: FileLike[]
	activeFile?: FileLike
}

export interface AIPanelAPI {
	addContext: (name: string, content: string) => void
	clearContext: () => void
	setModel: (model: string) => void
	clear: () => void
}
