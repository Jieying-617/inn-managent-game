extends RefCounted

const CombinationModel = preload("res://scripts/models/combination.gd")

func run_all() -> int:
	var data := preload("res://data/lan_shenli.gd").new().create()
	assert(data.facilities.size() >= 20)
	assert(data.combinations.size() >= 8)
	assert(data.guests.size() == 4)
	assert(data.region.rule_stats.neighborhood_quiet == 100)
	var placements := {Vector2i(0, 0): "bookshelf", Vector2i(1, 0): "armchair", Vector2i(0, 1): "floor_lamp"}
	var combo := CombinationModel.new("window_reading", ["bookshelf", "armchair", "floor_lamp"], 1, {"quiet": 3, "ambience": 3}, "hint")
	var result := preload("res://scripts/services/effect_service.gd").new().calculate(placements, [combo])
	assert(result.discovered.has("window_reading"))
	assert(result.stats.quiet == 3)
	var duplicate_placements := {
		Vector2i(10, 0): "bookshelf",
		Vector2i(0, 0): "bookshelf",
		Vector2i(1, 0): "armchair",
		Vector2i(0, 1): "floor_lamp"
	}
	var duplicate_result := preload("res://scripts/services/effect_service.gd").new().calculate(duplicate_placements, [combo])
	assert(duplicate_result.discovered.has("window_reading"))
	var distant_placements := {
		Vector2i(0, 0): "bookshelf",
		Vector2i(3, 0): "armchair",
		Vector2i(0, 1): "floor_lamp"
	}
	var distant_result := preload("res://scripts/services/effect_service.gd").new().calculate(distant_placements, [combo])
	assert(not distant_result.discovered.has("window_reading"))
	return 0
