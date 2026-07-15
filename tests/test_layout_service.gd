extends RefCounted

const RegionModel = preload("res://scripts/models/region.gd")

func run_all() -> int:
	var region := RegionModel.new("test", [Vector2i(0, 0)], {"balcony": [Vector2i(1, 0)]}, {})
	var layout := preload("res://scripts/services/layout_service.gd").new(region)
	assert(layout.place("bookshelf", Vector2i(0, 0)).ok)
	assert(not layout.place("lamp", Vector2i(0, 0)).ok)
	assert(not layout.place("lamp", Vector2i(1, 0)).ok)
	assert(not layout.unlock_area("missing"))
	assert(layout.unlock_area("balcony"))
	assert(layout.place("lamp", Vector2i(1, 0)).ok)
	assert(layout.remove(Vector2i(1, 0)))
	assert(not layout.remove(Vector2i(1, 0)))
	return 0
