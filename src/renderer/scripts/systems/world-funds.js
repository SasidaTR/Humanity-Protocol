const INITIAL_AVAILABLE_FUNDS = 1_000_000_000_000

const fundsListeners = new Set()

const fundsState = {
	available: INITIAL_AVAILABLE_FUNDS,
	lastUpdatedAt: Date.now()
}

function buildFundsSnapshot(){
	return {
		version: 1,
		available: fundsState.available,
		lastUpdatedAt: fundsState.lastUpdatedAt
	}
}

function notifyFundsListeners(){
	const snapshot = buildFundsSnapshot()
	fundsListeners.forEach((listener) => {
		listener(snapshot)
	})
}

function resetFunds(){
	fundsState.available = INITIAL_AVAILABLE_FUNDS
	fundsState.lastUpdatedAt = Date.now()
	notifyFundsListeners()
	return buildFundsSnapshot()
}

function restoreFunds(save){
	const savedFunds = save?.funds

	if (!savedFunds) {
		return resetFunds()
	}

	fundsState.available = Math.max(0, Math.round(Number(savedFunds.available) || INITIAL_AVAILABLE_FUNDS))
	fundsState.lastUpdatedAt = Number(savedFunds.lastUpdatedAt) || Date.now()
	notifyFundsListeners()
	return buildFundsSnapshot()
}

function subscribe(listener){
	fundsListeners.add(listener)
	return () => {
		fundsListeners.delete(listener)
	}
}

window.humanityProtocolFunds = {
	buildFundsSnapshot,
	getFundsSummary: buildFundsSnapshot,
	resetFunds,
	restoreFunds,
	subscribe
}

resetFunds()
