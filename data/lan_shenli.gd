class_name LanShenli
extends RefCounted

const FacilityRecord = preload("res://scripts/models/facility.gd")
const CombinationRecord = preload("res://scripts/models/combination.gd")
const GuestProfileRecord = preload("res://scripts/models/guest_profile.gd")
const RegionRecord = preload("res://scripts/models/region.gd")

func create() -> Dictionary:
	return {
		"facilities": [
			FacilityRecord.new("bookshelf", ["quiet", "vintage"], {"ambience": 2}, 120),
			FacilityRecord.new("armchair", ["comfort"], {"comfort": 1}, 100),
			FacilityRecord.new("floor_lamp", ["quiet"], {"ambience": 1}, 80),
			FacilityRecord.new("desk", ["work"], {"convenience": 2}, 180),
			FacilityRecord.new("fast_wifi", ["work", "modern"], {"convenience": 2, "service": 1}, 220),
			FacilityRecord.new("soundproof_wall", ["quiet"], {"quiet": 2}, 300),
			FacilityRecord.new("tea_table", ["vintage", "social"], {"ambience": 2}, 160),
			FacilityRecord.new("flowers", ["natural"], {"ambience": 1, "uniqueness": 1}, 100),
			FacilityRecord.new("record_player", ["vintage"], {"ambience": 2, "uniqueness": 1}, 240),
			FacilityRecord.new("family_bed", ["family", "comfort"], {"comfort": 2}, 280),
			FacilityRecord.new("safety_rail", ["family", "safe"], {"service": 2}, 110),
			FacilityRecord.new("storage", ["family", "utility"], {"convenience": 2}, 140),
			FacilityRecord.new("double_bed", ["comfort"], {"comfort": 2}, 260),
			FacilityRecord.new("blackout_curtain", ["quiet"], {"quiet": 2, "comfort": 1}, 130),
			FacilityRecord.new("mini_fridge", ["convenient"], {"convenience": 1, "service": 1}, 170),
			FacilityRecord.new("luggage_rack", ["convenient"], {"convenience": 1}, 90),
			FacilityRecord.new("reception_bell", ["service"], {"service": 2}, 80),
			FacilityRecord.new("laundry_machine", ["service", "utility"], {"service": 2, "convenience": 1}, 290),
			FacilityRecord.new("shared_table", ["social"], {"service": 1, "ambience": 1}, 150),
			FacilityRecord.new("wall_art", ["art"], {"ambience": 2, "uniqueness": 1}, 200),
			FacilityRecord.new("potted_plant", ["natural"], {"ambience": 1}, 90),
			FacilityRecord.new("bathrobe", ["comfort"], {"comfort": 1, "service": 1}, 120),
			FacilityRecord.new("terrace_chair", ["view", "comfort"], {"comfort": 1, "ambience": 1}, 180)
		],
		"combinations": [
			CombinationRecord.new("window_reading", ["bookshelf", "armchair", "floor_lamp"], 1, {"quiet": 3, "ambience": 3}, "让阅读靠近自然光"),
			CombinationRecord.new("business_suite", ["desk", "fast_wifi", "soundproof_wall"], 1, {"quiet": 4, "convenience": 3}, "打造安静高效的商务套房"),
			CombinationRecord.new("vintage_tea", ["tea_table", "flowers", "record_player"], 1, {"ambience": 4, "uniqueness": 3}, "布置复古下午茶角"),
			CombinationRecord.new("family_safe_room", ["family_bed", "safety_rail", "storage"], 1, {"comfort": 4, "service": 3}, "打造安心亲子房"),
			CombinationRecord.new("quiet_retreat", ["double_bed", "blackout_curtain", "soundproof_wall"], 1, {"comfort": 3, "quiet": 4}, "营造静谧休憩空间"),
			CombinationRecord.new("courtyard_afternoon", ["shared_table", "potted_plant", "tea_table"], 1, {"ambience": 3, "service": 2}, "布置庭院午后茶席"),
			CombinationRecord.new("gallery_corner", ["wall_art", "floor_lamp", "armchair"], 1, {"ambience": 3, "uniqueness": 3}, "设置画廊一角"),
			CombinationRecord.new("balcony_date", ["terrace_chair", "flowers", "mini_fridge"], 1, {"comfort": 2, "ambience": 3}, "布置阳台约会角")
		],
		"guests": [
			GuestProfileRecord.new("business", 320, {"quiet": 3, "convenience": 3, "service": 2}),
			GuestProfileRecord.new("art", 420, {"ambience": 3, "uniqueness": 3, "comfort": 1}),
			GuestProfileRecord.new("family", 380, {"comfort": 3, "service": 3, "convenience": 2}),
			GuestProfileRecord.new("couple", 480, {"ambience": 3, "quiet": 2, "uniqueness": 2})
		],
		"region": RegionRecord.new(
			"lan_shenli",
			[Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0), Vector2i(0, 1), Vector2i(1, 1), Vector2i(2, 1)],
			{"balcony": [Vector2i(3, 0)], "attic": [Vector2i(0, 2)], "courtyard": [Vector2i(3, 1)], "storage": [Vector2i(1, 2)]},
			{"neighborhood_quiet": 100}
		)
	}
