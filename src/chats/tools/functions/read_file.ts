import { ReadFileInfo, ToolsReturnType } from "./types"

export default async function* ({ path, start_line, end_line }: ReadFileInfo): AsyncGenerator<ToolsReturnType> {
	try {
      
      // --- SEND SIGNAL TO PANEL THAT FILE IS BEING READ ---
		let relativePath = path

		for (const folder of window.addedFolder || []) {
			if (path.startsWith(folder.url)) {
				relativePath = `[${folder.title}] /${path.slice(folder.url.length)}`
			}
		}

		const toolCalling = JSON.stringify({
			header: `READ: ${relativePath}:${start_line}-${end_line}`,
		})

		const toSave = `<tool_calling>${toolCalling}</tool_calling>`

      yield { type: 'toSave', toSave }


      // --- START FILE READ ---
		const fs = acode.require('fs')

      const exists = await fs(path).exists()

      if (!exists) {
         throw new Error('File does not exist.')
      }

		const content = await fs(path).readFile('utf-8')

      const lines = content.split("\n")

      const result = lines.slice(start_line - 1, end_line).join("\n")

		yield { type: 'result', result }

	} catch (error: any) {
		yield { type: 'result', result: error instanceof Error ? error.message : 'Unknown error occurred while listing directory.' }
	}
}
