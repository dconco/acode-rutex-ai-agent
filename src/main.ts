import { addIcon, removeIcon } from './sidebar'
import { PLUGIN_ID } from './configs/constants'

function clg(...messages: unknown[]) {
	alert(messages.join(' '))
}
window.clg = clg

class MainPlugin {
	static baseUrl: string = ''

	async init() {
		alert('sup')
		addIcon()
	}

	async destroy() {
		removeIcon()
	}
}

if (window.acode) {
	const myPlugin = new MainPlugin()

	acode.setPluginInit(
		PLUGIN_ID,
		async (
			baseUrl: string,
			$page: Acode.WCPage,
			options: Acode.PluginInitOptions
		) => {
			const { cacheFile, cacheFileUrl } = options

			if (!baseUrl.endsWith('/')) {
				baseUrl += '/'
			}

			MainPlugin.baseUrl = baseUrl
			await myPlugin.init()
		}
	)

	acode.setPluginUnmount(PLUGIN_ID, () => {
		myPlugin.destroy()
	})
}
