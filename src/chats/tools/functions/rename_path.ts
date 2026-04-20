import { RenameFileInfo } from './types'
import { getRelativePath } from './utils'

export default async function* ({ uri, new_name }: RenameFileInfo) {
	// --- SEND SIGNAL TO PANEL THAT FILE IS BEING READ ---
	const relativePath = getRelativePath(uri)

	const toolCalling = JSON.stringify({
		header: `RENAMED: ${relativePath} -> ${new_name}`
	})
	const toSave = `<display_old_task_ui>${toolCalling}</display_old_task_ui>`

	// --- START FILE READ ---
	const fs = acode.require('fs')

	const exists = await fs(uri)?.exists()

	if (!exists) {
		throw new Error('Specified path does not exist.')
	}

	const result = await fs(uri).renameTo(new_name)

	yield { result, toSave }
}
