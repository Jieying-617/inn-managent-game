class_name Combination
extends RefCounted

var id: String
var required_ids: PackedStringArray
var max_distance: int
var stat_bonus: Dictionary
var hint: String

func _init(p_id: String, p_ids: PackedStringArray, p_distance: int, p_bonus: Dictionary, p_hint: String) -> void:
	id = p_id
	required_ids = p_ids
	max_distance = p_distance
	stat_bonus = p_bonus
	hint = p_hint
