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
	var candidates_by_id := {}
	for required_id in combo.required_ids:
		if candidates_by_id.has(required_id):
			continue
		var candidates: Array[Vector2i] = []
		for cell in placements:
			if placements[cell] == required_id:
				candidates.append(cell)
		if candidates.is_empty():
			return false
		candidates.sort_custom(_cell_precedes)
		candidates_by_id[required_id] = candidates
	return _has_valid_assignment(combo.required_ids, candidates_by_id, combo.max_distance * 2, [], 0)

func _has_valid_assignment(required_ids: PackedStringArray, candidates_by_id: Dictionary, max_pair_distance: int, selected_cells: Array[Vector2i], required_index: int) -> bool:
	if required_index == required_ids.size():
		return true
	var candidates: Array[Vector2i] = candidates_by_id[required_ids[required_index]]
	for candidate in candidates:
		if selected_cells.has(candidate) or not _within_distance(candidate, selected_cells, max_pair_distance):
			continue
		selected_cells.append(candidate)
		if _has_valid_assignment(required_ids, candidates_by_id, max_pair_distance, selected_cells, required_index + 1):
			return true
		selected_cells.pop_back()
	return false

func _within_distance(candidate: Vector2i, selected_cells: Array[Vector2i], max_pair_distance: int) -> bool:
	for selected in selected_cells:
		if abs(candidate.x - selected.x) + abs(candidate.y - selected.y) > max_pair_distance:
			return false
	return true

func _cell_precedes(left: Vector2i, right: Vector2i) -> bool:
	return left.x < right.x or (left.x == right.x and left.y < right.y)
