import Icon from './icons/icon.svg'
import { renderPanel } from './panel'
import { PLUGIN_ID } from './configs/constants'

const sideBarApps = acode.require('sidebarApps')
let scrollBottom: undefined | (() => void) = undefined

const addIcon = () => {
	acode.addIcon('ai-agent-icon', Icon)

	// Remove first in case plugin is reloading/updating
	sideBarApps.remove(PLUGIN_ID)

	sideBarApps.add(
		'ai-agent-icon',
		PLUGIN_ID,
		'Rutex AI Agent',
		(container: HTMLElement) => {
			scrollBottom = renderPanel(container)
		},
		false,
		() => {
			// Optional: logic to run whenever the sidebar is toggled open
			if (scrollBottom) scrollBottom()
		}
	)
}

const removeIcon = () => {
	sideBarApps.remove(PLUGIN_ID)
}

export { addIcon, removeIcon }
