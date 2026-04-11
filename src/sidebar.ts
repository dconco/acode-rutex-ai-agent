import Icon from './icons/icon.svg'
import { renderPanel } from './panel'
import { PLUGIN_ID } from './configs/constants'

const sideBarApps = acode.require('sidebarApps')

const addIcon = () => {
	acode.addIcon('ai-agent-icon', Icon)

	sideBarApps.add(
		'ai-agent-icon',
		PLUGIN_ID,
		'Rutex AI Agent',
		(container: HTMLElement) => renderPanel(container),
		false,
		() => {
			// Optional: logic to run whenever the sidebar is toggled open
		}
	)
}

const removeIcon = () => {
	sideBarApps.remove(PLUGIN_ID)
}

export { addIcon, removeIcon }
