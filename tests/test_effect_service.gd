extends RefCounted

func run_all() -> int:
	var data := preload("res://data/lan_shenli.gd").new().create()
	assert(data.facilities.size() >= 20)
	assert(data.combinations.size() >= 8)
	assert(data.guests.size() == 4)
	assert(data.region.rule_stats.neighborhood_quiet == 100)
	return 0
