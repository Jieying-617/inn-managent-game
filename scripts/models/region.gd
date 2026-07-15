class_name Region
extends RefCounted

var id: String
var initial_cells: Array[Vector2i]
var expansion_cells: Dictionary
var rule_stats: Dictionary

func _init(p_id: String, p_cells: Array[Vector2i], p_expansions: Dictionary, p_rules: Dictionary) -> void:
	id = p_id
	initial_cells = p_cells
	expansion_cells = p_expansions
	rule_stats = p_rules
