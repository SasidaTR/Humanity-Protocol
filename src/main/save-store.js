const fs = require('node:fs')
const path = require('node:path')
const { app } = require('electron')

function getSavePath(){
	return path.join(app.getPath('userData'), 'saves.json')
}

function loadSaves(){
	try {
		const raw = fs.readFileSync(getSavePath(), 'utf8')
		const saves = JSON.parse(raw)
		return Array.isArray(saves) ? saves : []
	} catch {
		return []
	}
}

function writeSaves(saves){
	fs.writeFileSync(getSavePath(), JSON.stringify(saves, null, 2))
}

function loadLatestSave(){
	const saves = loadSaves()
	return saves.sort((left, right) => right.updatedAt - left.updatedAt)[0] || null
}

function saveGame(nextSave){
	const saves = loadSaves()
	const save = {
		...nextSave,
		updatedAt: Date.now()
	}
	const existingIndex = saves.findIndex((entry) => entry.id === save.id)

	if (existingIndex >= 0) {
		saves[existingIndex] = {
			...saves[existingIndex],
			...save
		}
	} else {
		saves.push(save)
	}

	writeSaves(saves)
	return save
}

function deleteSave(saveId){
	const saves = loadSaves()
	const nextSaves = saves.filter((entry) => entry.id !== saveId)

	writeSaves(nextSaves)
	return nextSaves
}

module.exports = { loadSaves, loadLatestSave, saveGame, deleteSave }
