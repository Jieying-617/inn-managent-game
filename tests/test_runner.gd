extends SceneTree
const SUITES := ["res://tests/test_layout_service.gd", "res://tests/test_effect_service.gd", "res://tests/test_guest_service.gd", "res://tests/test_progression_service.gd"]

func _init() -> void:
    var failures := 0
    for suite_path in _suite_paths():
        if not ResourceLoader.exists(suite_path):
            push_error("Test suite is missing: %s" % suite_path)
            failures += 1
            continue

        var suite_script = load(suite_path)
        if suite_script == null or not (suite_script is Script) or not suite_script.can_instantiate():
            push_error("Test suite could not be loaded: %s" % suite_path)
            failures += 1
            continue

        var suite = suite_script.new()
        if suite == null or not suite.has_method("run_all"):
            push_error("Test suite is invalid: %s" % suite_path)
            failures += 1
            continue

        failures += suite.run_all()
    quit(0 if failures == 0 else 1)

func _suite_paths() -> PackedStringArray:
    var requested_suites := PackedStringArray()
    for argument in OS.get_cmdline_user_args():
        if argument.begins_with("--suite="):
            requested_suites.append(argument.trim_prefix("--suite="))
    return requested_suites if not requested_suites.is_empty() else SUITES
