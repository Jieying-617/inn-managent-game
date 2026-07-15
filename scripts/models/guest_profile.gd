class_name GuestProfile
extends RefCounted

var id: String
var budget: int
var weights: Dictionary

func _init(p_id: String, p_budget: int, p_weights: Dictionary) -> void:
	id = p_id
	budget = p_budget
	weights = p_weights
