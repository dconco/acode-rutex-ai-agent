import { hasLocalStorage } from '../settings'
import { ChatMessage } from '../../panel/types'
import {
	CHAT_HISTORY_PREFIX,
	LAST_ACTIVE_CHAT_HISTORY_KEY
} from '../../configs/constants'

let currentChatID: string = ''

const CHAT_HISTORY_DB_NAME = 'rutex_ai_agent_chat_history'
const CHAT_HISTORY_DB_VERSION = 1
const CHAT_HISTORY_STORE = 'chat_histories'

type ChatHistoryRecord = {
	id: string
	messages: ChatMessage[]
}

export type HistoryList = Record<string, string>

const supportsIndexedDB = (): boolean => typeof indexedDB !== 'undefined'

const openChatHistoryDB = (): Promise<IDBDatabase> =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open(CHAT_HISTORY_DB_NAME, CHAT_HISTORY_DB_VERSION)

		request.onupgradeneeded = () => {
			const db = request.result
			if (!db.objectStoreNames.contains(CHAT_HISTORY_STORE)) {
				db.createObjectStore(CHAT_HISTORY_STORE, { keyPath: 'id' })
			}
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})

const withStore = async <T>(
	mode: IDBTransactionMode,
	handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
	const db = await openChatHistoryDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(CHAT_HISTORY_STORE, mode)
		const store = tx.objectStore(CHAT_HISTORY_STORE)
		const request = handler(store)

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
		tx.oncomplete = () => db.close()
		tx.onerror = () => reject(tx.error)
		tx.onabort = () => reject(tx.error)
	})
}

const getLocalStorageChat = (chatID: string): ChatMessage[] => {
	try {
		return JSON.parse(
			localStorage.getItem(CHAT_HISTORY_PREFIX + chatID) || '[]'
		) as ChatMessage[]
	} catch {
		return []
	}
}

export const getHistoryList = (): HistoryList => {
	if (!hasLocalStorage()) return {} as HistoryList

	try {
		return JSON.parse(
			localStorage.getItem(CHAT_HISTORY_PREFIX) || '{}'
		) as HistoryList
	} catch {
		return {} as HistoryList
	}
}

export function editChatHistoryList(historyList: (lists: HistoryList) => void) {
	if (!hasLocalStorage()) return

	const history = getHistoryList()
	historyList(history)
	localStorage.setItem(CHAT_HISTORY_PREFIX, JSON.stringify(history))
}

export const newChatHistory = () => {
	currentChatID = ''
}

export const saveChatHistory = async (messages: ChatMessage[]) => {
	if (currentChatID === '') {
		const chatName = messages[0]?.text.substring(0, 25)
		currentChatID = crypto.randomUUID()

		if (hasLocalStorage()) {
			localStorage.setItem(LAST_ACTIVE_CHAT_HISTORY_KEY, currentChatID)
			editChatHistoryList(lists => (lists[currentChatID] = chatName))
		}
	}

	if (supportsIndexedDB()) {
		await withStore('readwrite', store =>
			store.put({ id: currentChatID, messages } as ChatHistoryRecord)
		)
		return
	}

	if (hasLocalStorage()) {
		localStorage.setItem(
			CHAT_HISTORY_PREFIX + currentChatID,
			JSON.stringify(messages)
		)
	}
}

export const retrieveChatHistory = async (): Promise<ChatMessage[]> => {
	if (currentChatID == '') {
		if (hasLocalStorage()) {
			currentChatID = localStorage.getItem(LAST_ACTIVE_CHAT_HISTORY_KEY) || ''
		}
	}

	if (currentChatID === '') return []

	if (supportsIndexedDB()) {
		try {
			const record = await withStore('readonly', store =>
				store.get(currentChatID)
			)
			return (record as ChatHistoryRecord | undefined)?.messages || []
		} catch {
			return [] as ChatMessage[]
		}
	}

	if (!hasLocalStorage()) return [] as ChatMessage[]
	return getLocalStorageChat(currentChatID)
}

export const deleteChatHistory = async (chatID: string | null = null) => {
	if (!chatID) chatID = currentChatID
	if (chatID == '') return

	if (chatID === currentChatID) currentChatID = ''

	if (supportsIndexedDB()) {
		try {
			await withStore('readwrite', store => store.delete(chatID))
		} catch {
			// Ignore IndexedDB deletion errors and continue with fallback cleanup.
		}
	}

	if (hasLocalStorage()) {
		editChatHistoryList(lists => delete lists[chatID])
		localStorage.removeItem(CHAT_HISTORY_PREFIX + chatID)
	}
}

export const deleteAllChatHistory = async () => {
	if (supportsIndexedDB()) {
		try {
			await withStore('readwrite', store => store.clear())
		} catch {
			// no-op fallback: localStorage cleanup below handles legacy entries.
		}
	}
	
	if (hasLocalStorage()) {
		editChatHistoryList(lists => {
			for (const chatID in lists) {
				localStorage.removeItem(CHAT_HISTORY_PREFIX + chatID)
			}
			Object.keys(lists).forEach(chatID => delete lists[chatID])
		})
	}

	currentChatID = ''
}
