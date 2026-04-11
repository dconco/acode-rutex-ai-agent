declare module '*.svg' {
	const content: string
	export default content
}
declare module '*.html' {
	const content: string
	export default content
}

declare function clg(...messages: Array<string | boolean>)

declare global {
	interface Window {
		clg: clg
	}
}
