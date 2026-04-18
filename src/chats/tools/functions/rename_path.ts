import { RenameFileInfo } from "./types";
import { getRelativePath, refreshFolder } from "./utils";

export default async function* ({ path, new_name }: RenameFileInfo) {
	
		// --- SEND SIGNAL TO PANEL THAT FILE IS BEING READ ---
		const relativePath = getRelativePath(path)

		const toolCalling = JSON.stringify({
			header: `RENAMED00: ${relativePath} -> ${new_name}`
		})
		const toSave = `<tool_calling_used>${toolCalling}</tool_calling_used>`

		// --- START FILE READ ---
		const fs = acode.require('fs')
	
		const exists = await fs(path).exists()
	
		if (!exists) {
			throw new Error('Specified path does not exist.')
		}
	
		const result = await fs(path).renameTo(new_name)

		refreshFolder(path)

		yield { result, toSave }
}
