function sortSaves(saves){
	return [...saves].sort((left, right) => right.updatedAt - left.updatedAt)
}

async function loadSaveById(saveId){
	if (!saveId) {
		return null
	}

	return window.humanityProtocol.loadSave(saveId)
}

async function refreshSaveAvailability({ setHasSaves, updateMenuButtons }){
	const saves = await window.humanityProtocol.listSaves()
	setHasSaves(saves.length > 0)
	updateMenuButtons()
	return saves
}

async function continueSavedRun({ loadSave }){
	const save = await window.humanityProtocol.loadLatestSave()

	if (!save) {
		return
	}

	await loadSave(save)
}

async function deleteSaveEntry({
	saveId,
	currentSaveId,
	onDeleteCurrentSave,
	refreshSaveAvailability,
	isLoadScreenVisible,
	renderSaveList
}){
	if (!saveId) {
		return
	}

	await window.humanityProtocol.deleteSave(saveId)

	if (currentSaveId === saveId) {
		onDeleteCurrentSave()
	}

	await refreshSaveAvailability()

	if (isLoadScreenVisible()) {
		await renderSaveList()
	}
}

async function renderSaveList({ language, saveList, loadSave, deleteSave }){
	const saves = sortSaves(await window.humanityProtocol.listSaves())
	saveList.replaceChildren()

	if (saves.length === 0) {
		const emptyState = document.createElement('p')
		emptyState.textContent = window.humanityProtocolI18n.getTranslation(language, 'load.empty')
		saveList.append(emptyState)
		return
	}

	saves.forEach((save) => {
		const row = document.createElement('div')
		const loadButton = document.createElement('button')
		const deleteButton = document.createElement('button')

		loadButton.type = 'button'
		loadButton.textContent = `${save.label} - ${new Date(save.updatedAt).toLocaleString(language)}`
		loadButton.addEventListener('click', async () => {
			const fullSave = await loadSaveById(save.id)

			if (!fullSave) {
				return
			}

			loadSave(fullSave)
		})

		deleteButton.type = 'button'
		deleteButton.textContent = window.humanityProtocolI18n.getTranslation(language, 'load.delete')
		deleteButton.addEventListener('click', () => {
			deleteSave(save.id)
		})

		row.append(loadButton, deleteButton)
		saveList.append(row)
	})
}

window.humanityProtocolSaves = {
	continueSavedRun,
	deleteSaveEntry,
	loadSaveById,
	refreshSaveAvailability,
	renderSaveList
}
