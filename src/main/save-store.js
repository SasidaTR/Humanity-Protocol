const fs = require('node:fs')
const path = require('node:path')
const { app } = require('electron')

const SAVE_INDEX_FILENAME = 'saves-index.json'
const LEGACY_SAVE_FILENAME = 'saves.json'

function getSaveDirectoryPath(){
	return path.join(app.getPath('userData'), 'saves')
}

function getSaveIndexPath(){
	return path.join(getSaveDirectoryPath(), SAVE_INDEX_FILENAME)
}

function getLegacySavePath(){
	return path.join(app.getPath('userData'), LEGACY_SAVE_FILENAME)
}

function ensureSaveDirectory(){
	fs.mkdirSync(getSaveDirectoryPath(), { recursive: true })
}

function buildSaveFilePath(saveId){
	return path.join(getSaveDirectoryPath(), `${saveId}.json`)
}

function sanitizeSaveMetadata(save){
	return {
		id: save.id,
		label: save.label,
		screen: save.screen,
		updatedAt: Number(save.updatedAt) || Date.now()
	}
}

function readJsonFile(filePath, fallbackValue){
	try {
		const raw = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(raw)
	} catch {
		return fallbackValue
	}
}

function writeJsonFile(filePath, value){
	fs.writeFileSync(filePath, JSON.stringify(value, null, 2))
}

function loadSaveIndex(){
	ensureSaveDirectory()
	const index = readJsonFile(getSaveIndexPath(), [])
	return Array.isArray(index) ? index : []
}

function writeSaveIndex(entries){
	ensureSaveDirectory()
	writeJsonFile(getSaveIndexPath(), entries)
}

function loadSaveById(saveId){
	if (!saveId) {
		return null
	}

	ensureSaveDirectory()
	return readJsonFile(buildSaveFilePath(saveId), null)
}

function migrateLegacySavesIfNeeded(){
	ensureSaveDirectory()

	if (fs.existsSync(getSaveIndexPath())) {
		return
	}

	const legacySaves = readJsonFile(getLegacySavePath(), null)

	if (!Array.isArray(legacySaves) || legacySaves.length === 0) {
		writeSaveIndex([])
		return
	}

	const indexEntries = []

	legacySaves.forEach((save) => {
		if (!save?.id) {
			return
		}

		writeJsonFile(buildSaveFilePath(save.id), save)
		indexEntries.push(sanitizeSaveMetadata(save))
	})

	writeSaveIndex(indexEntries)
}

function listSaves(){
	migrateLegacySavesIfNeeded()
	return loadSaveIndex()
}

function loadLatestSave(){
	const latestSaveEntry = listSaves()
		.sort((left, right) => right.updatedAt - left.updatedAt)[0]

	if (!latestSaveEntry) {
		return null
	}

	return loadSaveById(latestSaveEntry.id)
}

function saveGame(nextSave){
	migrateLegacySavesIfNeeded()

	const save = {
		...nextSave,
		updatedAt: Date.now()
	}

	ensureSaveDirectory()
	writeJsonFile(buildSaveFilePath(save.id), save)

	const saveIndex = loadSaveIndex()
	const metadata = sanitizeSaveMetadata(save)
	const existingIndex = saveIndex.findIndex((entry) => entry.id === save.id)

	if (existingIndex >= 0) {
		saveIndex[existingIndex] = metadata
	} else {
		saveIndex.push(metadata)
	}

	writeSaveIndex(saveIndex)
	return save
}

function deleteSave(saveId){
	migrateLegacySavesIfNeeded()

	if (!saveId) {
		return listSaves()
	}

	const saveFilePath = buildSaveFilePath(saveId)

	try {
		fs.unlinkSync(saveFilePath)
	} catch {}

	const nextSaveIndex = loadSaveIndex().filter((entry) => entry.id !== saveId)
	writeSaveIndex(nextSaveIndex)
	return nextSaveIndex
}

module.exports = { deleteSave, listSaves, loadLatestSave, loadSaveById, saveGame }
