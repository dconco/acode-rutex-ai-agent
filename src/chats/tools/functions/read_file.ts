interface ReadFileInfo {
   path: string
   start_line: number
   end_line: number
}

export default async function({ path, start_line, end_line }: ReadFileInfo) {
	return 'READ_FILE_TRIGGERED (STILL IN DEVLOPMENT): ' + JSON.stringify({ path, start_line, end_line })
}
