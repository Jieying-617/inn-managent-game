class_name EffectService
extends RefCounted

const KEYS := ["comfort", "quiet", "ambience", "convenience", "service", "uniqueness"]

func calculate(placements: Dictionary, combinations: Array) -> Dictionary:
	var stats := {}
	for key in KEYS:
		stats[key] = 0
	var discovered := PackedStringArray()
	for combo in combinations:
		if _triggered(placements, combo):
			discovered.append(combo.id)
			for key in combo.stat_bonus:
				stats[key] += combo.stat_bonus[key]
	return {"stats": stats, "discovered": discovered}

func _triggered(placements: Dictionary, combo) -> bool:
	var found: Array[Vector2i] = []
	for required_id in combo.required_ids:
		var matched := false
		for cell in placements:
			if placements[cell] == required_id and not found.has(cell):
				found.append(cell)
				matched = true
				break
		if not matched:
			return false
	for left in found:
		for right in found:
			if abs(left.x - right.x) + abs(left.y - right.y) > combo.max_distance * 2:
				return false
	return true
