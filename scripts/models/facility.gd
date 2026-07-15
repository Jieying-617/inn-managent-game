class_name Facility
extends RefCounted

var id: String
var tags: PackedStringArray
var base_stats: Dictionary
var price: int

func _init(p_id: String, p_tags: PackedStringArray, p_stats: Dictionary, p_price: int) -> void:
	id = p_id
	tags = p_tags
	base_stats = p_stats
	price = p_price
