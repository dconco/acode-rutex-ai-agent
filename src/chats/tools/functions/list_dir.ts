
interface ListFilesInfo {
	path: string
}

export default async function ({ path }: ListFilesInfo) {
	try {
		const fs = acode.require('fs')
		const entries = await fs(path).lsDir()

		if (!entries) {
			throw new Error('Directory path is invalid or inaccessible.')
		}

		return entries.map((entry: Acode.File) => {
			if (entry.url.startsWith(path)) {
				return entry.url.slice(path.length)
			}

			return entry.url
		}).join(' | ')

	} catch (error: any) {
		return error instanceof Error ? error.message : 'Unknown error occurred while listing directory.'
	}
}
