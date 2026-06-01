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
		laws: {
			mandatoryVote: {
				fineAmount: 35,
				fineRatePerWindow: 0.012,
				baseTurnoutBonus: 0.12,
				turnoutModifiers: {
					age: {
						age18To34: 0.03,
						age35To64: 0,
						age65Plus: -0.02
					},
					activity: {
						workers: -0.01,
						nonWorkers: 0.03,
						none: 0
					},
					income: {
						veryPoor: 0.05,
						poor: 0.03,
						middleIncome: 0,
						comfortableIncome: -0.01,
						highIncome: -0.03
					},
					authorityRelation: {
						supportive: -0.04,
						neutral: 0,
						defiant: 0.06
					},
					education: {
						low: 0.03,
						medium: 0,
						high: -0.02
					},
					health: {
						healthy: 0,
						mentalFragile: -0.02,
						physicalFragile: -0.03,
						dualFragile: -0.06
					}
				},
				satisfactionModifiers: {
					age: {
						age18To34: -0.015,
						age35To64: -0.004,
						age65Plus: 0.006
					},
					activity: {
						workers: 0,
						nonWorkers: -0.01,
						none: 0
					},
					income: {
						veryPoor: -0.04,
						poor: -0.025,
						middleIncome: -0.005,
						comfortableIncome: 0,
						highIncome: 0.005
					},
					authorityRelation: {
						supportive: 0.01,
						neutral: -0.004,
						defiant: -0.06
					},
					education: {
						low: -0.012,
						medium: 0,
						high: -0.004
					},
					health: {
						healthy: 0,
						mentalFragile: -0.02,
						physicalFragile: -0.02,
						dualFragile: -0.035
					}
				}
			}
		}
	}
})()
