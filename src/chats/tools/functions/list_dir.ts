interface ListFilesInfo {
	path: string
}

export default function ({ path }: ListFilesInfo) {
	clg('LIST_DIRECTORY_TRIGGERED:', { path })
	const flist = acode.require('filelist')
	const entries = flist(path)

	return entries
		.map(
			(entry: Acode.Tree) => entry.path + (entry.children.length ? '/' : '')
		)
		.join(' | ')
}
