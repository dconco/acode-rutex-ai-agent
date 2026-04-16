import { EditFileInfo } from './types'

export default function* ({ path, lines }: AsyncGenerator<EditFileInfo>) {
	try {
		const newLines: any[] = lines

		clg('EDIT_FILE_TRIGGERED:', { path, lines })

		const fs = acode.require('fs')
		const fsPath = fs(path)

		const exists = await fsPath.exists()

		if (!exists) {
			throw new Error('File does not exist.')
		}

		const content = await fsPath.readFile('utf-8')

		const contentLines = content.split('\n')

		// --- 1. Sort so the highest line numbers come first ---
		lines.sort((a, b) => b.line - a.line)

		for (let index = 0; index < lines.length; index++) {
			const { line, text } = lines[index]

			const buildOldContentLines = {
				line,
				text: contentLines[line],
				isAdded: false,
				revertable: true
			}
			newLines.push(buildOldContentLines)

			if (text === '') {
				// delete, so only one line object shows which is removed line
				delete newLines[index]

				// Because we sorted descending, deleting this line
				// doesn't shift the indices of the lines we still need to process.
				contentLines.splice(line.line + 1, 1)
				continue
			}
			newLines[index].isAdded = true

			contentLines[line.line] = line.text
		}
		clg('Edited file', newLines)

		yield {
			type: 'result',
			result: 'Edited!'
		}
	} catch (error: any) {
		yield {
			type: 'result',
			result:
				error instanceof Error
					? error.message
					: 'Unknown error occurred while editing file.'
		}
	}
}
