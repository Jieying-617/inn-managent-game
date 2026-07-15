extends SceneTree
const SUITES := ["res://tests/test_layout_service.gd", "res://tests/test_effect_service.gd", "res://tests/test_guest_service.gd", "res://tests/test_progression_service.gd"]

func _init() -> void:
    var failures := 0
    for suite_path in SUITES:
        if ResourceLoader.exists(suite_path):
            failures += load(suite_path).new().run_all()
    quit(0 if failures == 0 else 1)
