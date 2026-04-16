import { RenameFileInfo } from "./types";

export default function({ path, new_path }: RenameFileInfo) {
	clg('RENAME_FILE_TRIGGERED:', { path, new_path })
}
