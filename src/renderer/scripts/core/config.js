(function(){
	window.humanityProtocolConfig = {
		population: {
			initialWorldPopulation: 8_000_000_000,
			initialSatisfaction: 60,
			femaleShareOscillationRange: 0.008,
			workerShareOscillationRange: 0.08,
			hoursPerYear: 365.25 * 24,
			lifeExpectancyYears: 80,
			targetEventsPerMinute: 180,
			eventBalanceVariation: 0.25,
			ageGroups: {
				age0To17: {
					durationYears: 18,
					initialShare: 0.215
				},
				age18To34: {
					durationYears: 17,
					initialShare: 0.235
				},
				age35To64: {
					durationYears: 30,
					initialShare: 0.37
				},
				age65Plus: {
					durationYears: 15,
					initialShare: 0.18
				}
			},
			activity: {
				workers: 0.6,
				nonWorkers: 0.4
			},
			incomeLevel: {
				veryPoor: 0.1,
				poor: 0.51,
				middleIncome: 0.17,
				comfortableIncome: 0.15,
				highIncome: 0.07
			},
			authorityRelation: {
				supportive: 0.27,
				neutral: 0.46,
				defiant: 0.27
			},
			education: {
				low: 0.34,
				medium: 0.46,
				high: 0.2
			},
			health: {
				healthy: 0.75,
				mentalFragile: 0.09,
				physicalFragile: 0.11,
				dualFragile: 0.05
			},
			sex: {
				female: 0.5,
				male: 0.5
			}
		},
		funds: {
			initialAvailableFunds: 1_000_000_000_000
		},
		survey: {
			initialTurnoutRate: 0.62,
			initialWorldSatisfaction: 60,
			activeVoteDurationHours: 24,
			initialActiveVoteGroups: 12,
			turnoutRateRange: {
				min: 0.3,
				max: 1
			},
			satisfactionRateRange: {
				min: 0.12,
				max: 0.92
			},
			voteWindowHours: 24,
			cohortVoteIntervalHours: {
				min: 24,
				max: 72
			},
			ageVoterProfiles: {
				age18To34: {
					turnoutRate: 0.55,
					satisfactionRate: 0.56
				},
				age35To64: {
					turnoutRate: 0.72,
					satisfactionRate: 0.6
				},
				age65Plus: {
					turnoutRate: 0.78,
					satisfactionRate: 0.62
				}
			},
			activityVoterModifiers: {
				workers: {
					turnoutRate: 0.05,
					satisfactionRate: 0.04
				},
				nonWorkers: {
					turnoutRate: -0.05,
					satisfactionRate: -0.06
				},
				none: {
					turnoutRate: 0,
					satisfactionRate: 0
				}
			},
			incomeLevelModifiers: {
				veryPoor: {
					turnoutRate: -0.1,
					satisfactionRate: -0.18
				},
				poor: {
					turnoutRate: -0.05,
					satisfactionRate: -0.1
				},
				middleIncome: {
					turnoutRate: 0,
					satisfactionRate: 0
				},
				comfortableIncome: {
					turnoutRate: 0.05,
					satisfactionRate: 0.08
				},
				highIncome: {
					turnoutRate: 0.08,
					satisfactionRate: 0.14
				}
			},
			authorityRelationModifiers: {
				supportive: {
					turnoutRate: 0.05,
					satisfactionRate: 0.01
				},
				neutral: {
					turnoutRate: 0,
					satisfactionRate: 0
				},
				defiant: {
					turnoutRate: -0.08,
					satisfactionRate: -0.02
				}
			},
			educationModifiers: {
				low: {
					turnoutRate: -0.09,
					satisfactionRate: -0.02
				},
				medium: {
					turnoutRate: 0,
					satisfactionRate: 0
				},
				high: {
					turnoutRate: 0.07,
					satisfactionRate: 0.01
				}
			},
			healthModifiers: {
				healthy: {
					votingCapacityRate: 1,
					turnoutRate: 0.01,
					satisfactionRate: 0.02
				},
				mentalFragile: {
					votingCapacityRate: 0.95,
					turnoutRate: -0.06,
					satisfactionRate: -0.1
				},
				physicalFragile: {
					votingCapacityRate: 0.88,
					turnoutRate: -0.09,
					satisfactionRate: -0.11
				},
				dualFragile: {
					votingCapacityRate: 0.76,
					turnoutRate: -0.14,
					satisfactionRate: -0.18
				}
			},
			opinionNoise: {
				turnoutRate: 0.025,
				satisfactionRate: 0.04
			}
		},
		livingConditions: {
			escalatingExponent: 1.6,
			diminishingExponent: 0.7,
			satisfactionScale: 0.002,
			sensitivityRange: {
				min: 0.2,
				max: 3
			},
			axes: {
				liberty: {
					authorityRelation: { supportive: 0.45, neutral: 1, defiant: 2.2 },
					education: { low: 0.85, medium: 1, high: 1.3 },
					age: { age18To34: 1.2, age35To64: 1, age65Plus: 0.8 }
				},
				security: {
					age: { age18To34: 0.7, age35To64: 1, age65Plus: 1.6 },
					authorityRelation: { supportive: 1.4, neutral: 1, defiant: 0.55 },
					health: { healthy: 0.9, mentalFragile: 1.3, physicalFragile: 1.3, dualFragile: 1.5 }
				},
				ease: {
					health: { healthy: 0.75, mentalFragile: 1.5, physicalFragile: 1.7, dualFragile: 2.1 },
					age: { age18To34: 0.85, age35To64: 1, age65Plus: 1.4 },
					activity: { workers: 1.25, nonWorkers: 0.85, none: 1 }
				},
				income: {
					income: { veryPoor: 2.5, poor: 1.8, middleIncome: 1, comfortableIncome: 0.55, highIncome: 0.3 }
				},
				comfort: {
					income: { veryPoor: 0.7, poor: 0.85, middleIncome: 1, comfortableIncome: 1.2, highIncome: 1.35 }
				},
				privacy: {
					education: { low: 0.7, medium: 1, high: 1.5 },
					authorityRelation: { supportive: 0.5, neutral: 1, defiant: 1.8 }
				},
				predictability: {
					activity: { workers: 1.2, nonWorkers: 0.85, none: 1 },
					age: { age18To34: 0.85, age35To64: 1, age65Plus: 1.25 },
					income: { veryPoor: 1.3, poor: 1.15, middleIncome: 1, comfortableIncome: 0.9, highIncome: 0.8 }
				}
			},
			voice: {
				complianceCeiling: 0.98,
				obstructionScale: 0.09,
				compulsionResistance: {
					base: 0.1,
					authorityRelation: { supportive: 0, neutral: 0.08, defiant: 0.25 },
					income: { veryPoor: 0.12, poor: 0.07, middleIncome: 0, comfortableIncome: -0.03, highIncome: -0.05 },
					health: { healthy: 0, mentalFragile: 0.08, physicalFragile: 0.12, dualFragile: 0.22 },
					education: { low: 0.06, medium: 0, high: -0.02 },
					age: { age18To34: 0.06, age35To64: 0, age65Plus: -0.03 }
				}
			}
		},
		laws: {
			fixedVoteHour: {
				defaultHour: 12,
				maxHourDistance: 12,
				distanceWeight: 0.55,
				strainWeight: 0.45,
				hourStrain: [
					1, 1, 1, 0.98, 0.92, 0.78,
					0.55, 0.34, 0.2, 0.12, 0.08, 0.06,
					0.06, 0.06, 0.06, 0.06, 0.05, 0.03,
					0, 0, 0.04, 0.16, 0.42, 0.74
				],
				naturalVoteHour: {
					activity: {
						workers: 19,
						nonWorkers: 14,
						none: 16
					},
					ageOffset: {
						age18To34: 2,
						age35To64: 0,
						age65Plus: -3
					}
				},
				conditions: {
					liberty: -1.5,
					predictability: 1.2
				},
				pressureConditions: {
					ease: -3.5,
					liberty: -1.8
				},
				voice: {
					obstruction: 2
				}
			},
			mandatoryVote: {
				fineAmount: 35,
				fineRatePerWindow: 0.012,
				conditions: {
					liberty: -3,
					ease: -1.2
				},
				sanctionConditions: {
					fine: {
						income: -1.4
					}
				},
				voice: {
					compulsion: 1
				}
			}
		}
	}
})()
