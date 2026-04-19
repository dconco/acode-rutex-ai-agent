import { MoveFileInfo } from './types'
import { getRelativePath } from './utils'

export default async function* ({ uri, new_uri }: MoveFileInfo) {
	// --- SEND SIGNAL TO PANEL THAT FILE IS BEING READ ---
	const relativePath = getRelativePath(uri)
	const relativeNewPath = getRelativePath(new_uri)

	const toolCalling = JSON.stringify({
		header: `MOVED: ${relativePath} -> ${relativeNewPath}`
	})
	const toSave = `<display_ui>${toolCalling}</display_ui>`

	// --- START FILE READ ---
	const fs = acode.require('fs')

	const exists = await fs(uri)?.exists()

	if (!exists) {
		throw new Error('Specified path does not exist.')
	}

	const result = await fs(uri).moveTo(new_uri)

	yield { result, toSave }
}
