import { EditFileInfo } from "./types";


export default function({ path, lines }: EditFileInfo) {
	clg('EDIT_FILE_TRIGGERED:', { path, lines })
}
