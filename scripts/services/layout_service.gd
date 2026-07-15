class_name LayoutService
extends RefCounted

var region
var placements := {}
var available_cells := {}

func _init(p_region) -> void:
	region = p_region
	for cell in region.initial_cells:
		available_cells[cell] = true

func place(facility_id: String, cell: Vector2i) -> Dictionary:
	if not available_cells.has(cell):
		return {"ok": false, "reason": "该区域尚未修缮"}
	if placements.has(cell):
		return {"ok": false, "reason": "此处已有设施"}
	placements[cell] = facility_id
	return {"ok": true, "reason": ""}

func remove(cell: Vector2i) -> bool:
	if not placements.has(cell):
		return false
	placements.erase(cell)
	return true

func unlock_area(area_id: String) -> bool:
	if not region.expansion_cells.has(area_id):
		return false
	for cell in region.expansion_cells[area_id]:
		available_cells[cell] = true
	return true
