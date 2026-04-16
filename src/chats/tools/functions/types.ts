
export interface ReadFileInfo {
   path: string
   start_line: number
   end_line: number
}

export interface ListDirInfo {
	path: string
}

export interface EditFileInfo {
   path: string
	lines: {
		line: number,
		text: string,
	}[]
}

export interface RenameFileInfo {
   path: string
   new_path: string
}

export type ToolsReturnType = { type: 'toSave'; toSave: string } | { type: 'result'; result: string }

export type ToolsFunction = (args: ReadFileInfo | ListDirInfo) => AsyncGenerator<ToolsReturnType>


