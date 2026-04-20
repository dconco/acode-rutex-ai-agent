import { CreateFileInfo } from './types'
import { getRelativePath } from './utils'

export default async function* ({ uri, content = '' }: CreateFileInfo) {
	// --- START FILE READ ---
	const fs = acode.require('fs')

	const exists = await fs(uri)?.exists()

	if (!exists) {
		throw new Error('Specified path does not exists.')
	}

	const fileInfo = await fs(uri).stat()

	// --- SEND SIGNAL TO PANEL THAT FILE IS BEING READ ---
	const relativePath = getRelativePath(uri)

	const result = `${
		fileInfo.isFile ? 'FILE' : 'DIRECTORY'
	} DELETED: ${relativePath}`

	const toolCalling = JSON.stringify({
		header: result
	})
	const toSave = `<display_old_task_ui>${toolCalling}</display_old_task_ui>`

	await fs(uri).delete()

	yield { result, toSave }
}
