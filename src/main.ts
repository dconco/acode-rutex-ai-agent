import { addIcon, removeIcon } from './addIcon'

class MainPlugin {
	async init() {
		addIcon()
	}

	async destroy() {
		removeIcon()
	}
}

if (window.acode) {
	const myPlugin = new MainPlugin()
	acode.setPluginInit(
		'hallofcodes.plugin.ai-agent',
		(baseUrl: string, $page: HTMLElement, { cacheFile, cacheFileUrl }) => {
			if (!baseUrl.endsWith('/')) {
				baseUrl += '/'
			}
			myPlugin.baseUrl = baseUrl
			myPlugin.init()
		}
	)
	acode.setPluginUnmount('hallofcodes.plugin.ai-agent', () => {
		myPlugin.destroy()
	})
}
