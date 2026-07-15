# 民宿模拟经营游戏首版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 用 Godot 构建竖屏澜申里洋房民宿经营首版，完成布局、组合、客群评分、图册、商人与扩展锤的 7 日经营闭环。

**Architecture:** 经营规则由可配置数据和纯服务类组成，场景层只负责输入和展示。GameState 协调布局、日结、图册、商人与存档，地区以独立配置接入。

**Tech Stack:** Godot 4.3+、GDScript、Control UI、JSON 存档、自定义 Godot headless 测试运行器；不引入第三方插件。

## Global Constraints

- 目标为手机竖屏，设计基准 1080×1920。
- 首版只实现澜申里洋房；其他地区只保留配置扩展接口。
- 首版包含 4 类客群、6 项通用满意度、邻里安静度、20–25 件设施、8–12 个组合、3 名员工和 4–6 个扩展区域。
- 扩展锤仅通过游戏内资金和解锁条件取得，不设计付费墙、抽卡或联机。
- 所有内容均为原创；不得复制既有游戏的资产、UI、文案或数值。
- 规则服务必须可在 headless 模式测试；随机性必须使用可注入种子。

## File structure

- inn-management-game/project.godot：Godot 项目与竖屏配置。
- inn-management-game/scenes/Main.tscn：入口场景。
- inn-management-game/scripts/models：设施、组合、客群、地区记录。
- inn-management-game/scripts/services：布局、效果、评分、进度、存档。
- inn-management-game/scripts/game_state.gd：经营周期协调器。
- inn-management-game/scripts/ui/main_screen.gd：竖屏主界面。
- inn-management-game/data/lan_shenli.gd：首版地区配置。
- inn-management-game/tests：独立规则测试。
- inn-management-game/README.md：运行与人工验收说明。

## Task 1: Scaffold the portrait project and headless runner

**Files:**

- Create: inn-management-game/project.godot
- Create: inn-management-game/scenes/Main.tscn
- Create: inn-management-game/scripts/ui/main_screen.gd
- Create: inn-management-game/tests/test_runner.gd

**Interfaces:**

- Produces: Main.tscn and the command godot --headless --path inn-management-game --script res://tests/test_runner.gd.

- [ ] **Step 1: Write the failing runner**

Create tests/test_runner.gd:

~~~
extends SceneTree

func _init() -> void:
    var suite := preload("res://tests/test_layout_service.gd").new()
    quit(suite.run_all())
~~~

- [ ] **Step 2: Verify it fails**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: non-zero exit because test_layout_service.gd does not exist.

- [ ] **Step 3: Create the base files**

Create project.godot:

~~~
[application]
config/name="澜申里民宿"
run/main_scene="res://scenes/Main.tscn"

[display/window]
size/viewport_width=1080
size/viewport_height=1920
size/window_width_override=540
size/window_height_override=960
stretch/mode="canvas_items"

[rendering]
renderer/rendering_method="gl_compatibility"
renderer/rendering_method.mobile="gl_compatibility"
~~~

Create scenes/Main.tscn:

~~~
[gd_scene load_steps=2 format=3]
[ext_resource path="res://scripts/ui/main_screen.gd" type="Script" id="1"]
[node name="Main" type="Control"]
layout_mode = 3
anchors_preset = 15
anchor_right = 1.0
anchor_bottom = 1.0
grow_horizontal = 2
grow_vertical = 2
script = ExtResource("1")
~~~

Create scripts/ui/main_screen.gd:

~~~
extends Control
func _ready() -> void:
    name = "MainScreen"
~~~

Replace tests/test_runner.gd:

~~~
extends SceneTree
const SUITES := ["res://tests/test_layout_service.gd", "res://tests/test_effect_service.gd", "res://tests/test_guest_service.gd", "res://tests/test_progression_service.gd"]

func _init() -> void:
    var failures := 0
    for suite_path in SUITES:
        if ResourceLoader.exists(suite_path):
            failures += load(suite_path).new().run_all()
    quit(0 if failures == 0 else 1)
~~~

- [ ] **Step 4: Verify it passes**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0; absent suites are skipped.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game/project.godot inn-management-game/scenes/Main.tscn inn-management-game/scripts/ui/main_screen.gd inn-management-game/tests/test_runner.gd
git commit -m "chore: scaffold inn game project"
~~~

## Task 2: Define game records and seed 澜申里 content

**Files:**

- Create: inn-management-game/scripts/models/facility.gd
- Create: inn-management-game/scripts/models/combination.gd
- Create: inn-management-game/scripts/models/guest_profile.gd
- Create: inn-management-game/scripts/models/region.gd
- Create: inn-management-game/data/lan_shenli.gd
- Create: inn-management-game/tests/test_effect_service.gd

**Interfaces:**

- Produces: Facility, Combination, GuestProfile, Region, and LanShenli.create().

- [ ] **Step 1: Write the failing data test**

Create tests/test_effect_service.gd:

~~~
extends RefCounted

func run_all() -> int:
    var data := preload("res://data/lan_shenli.gd").new().create()
    assert(data.facilities.size() >= 20)
    assert(data.combinations.size() >= 8)
    assert(data.guests.size() == 4)
    assert(data.region.rule_stats.neighborhood_quiet == 100)
    return 0
~~~

- [ ] **Step 2: Verify it fails**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: non-zero exit because LanShenli does not exist.

- [ ] **Step 3: Implement the records and configuration**

Create the model scripts:

~~~
# facility.gd
class_name Facility
extends RefCounted
var id: String
var tags: PackedStringArray
var base_stats: Dictionary
var price: int
func _init(p_id: String, p_tags: PackedStringArray, p_stats: Dictionary, p_price: int) -> void:
    id = p_id; tags = p_tags; base_stats = p_stats; price = p_price

# combination.gd
class_name Combination
extends RefCounted
var id: String
var required_ids: PackedStringArray
var max_distance: int
var stat_bonus: Dictionary
var hint: String
func _init(p_id: String, p_ids: PackedStringArray, p_distance: int, p_bonus: Dictionary, p_hint: String) -> void:
    id = p_id; required_ids = p_ids; max_distance = p_distance; stat_bonus = p_bonus; hint = p_hint

# guest_profile.gd
class_name GuestProfile
extends RefCounted
var id: String
var budget: int
var weights: Dictionary
func _init(p_id: String, p_budget: int, p_weights: Dictionary) -> void:
    id = p_id; budget = p_budget; weights = p_weights

# region.gd
class_name Region
extends RefCounted
var id: String
var initial_cells: Array[Vector2i]
var expansion_cells: Dictionary
var rule_stats: Dictionary
func _init(p_id: String, p_cells: Array[Vector2i], p_expansions: Dictionary, p_rules: Dictionary) -> void:
    id = p_id; initial_cells = p_cells; expansion_cells = p_expansions; rule_stats = p_rules
~~~

Create data/lan_shenli.gd with exactly four GuestProfile records: business, art, family, couple. It must define 20–25 Facility records; include bookshelf, armchair, floor_lamp, desk, fast_wifi, soundproof_wall, tea_table, flowers, record_player, family_bed, safety_rail, storage. It must define at least these 8 combinations: window_reading, business_suite, vintage_tea, family_safe_room, quiet_retreat, courtyard_afternoon, gallery_corner, balcony_date. Every referenced facility ID must exist. Use only comfort, quiet, ambience, convenience, service, uniqueness stat keys.

~~~
class_name LanShenli
extends RefCounted

func create() -> Dictionary:
    return {
        "facilities": [
            Facility.new("bookshelf", ["quiet", "vintage"], {"ambience": 2}, 120),
            Facility.new("armchair", ["comfort"], {"comfort": 1}, 100),
            Facility.new("floor_lamp", ["quiet"], {"ambience": 1}, 80)
        ],
        "combinations": [
            Combination.new("window_reading", ["bookshelf", "armchair", "floor_lamp"], 1, {"quiet": 3, "ambience": 3}, "让阅读靠近自然光")
        ],
        "guests": [
            GuestProfile.new("business", 320, {"quiet": 3, "convenience": 3, "service": 2}),
            GuestProfile.new("art", 420, {"ambience": 3, "uniqueness": 3, "comfort": 1}),
            GuestProfile.new("family", 380, {"comfort": 3, "service": 3, "convenience": 2}),
            GuestProfile.new("couple", 480, {"ambience": 3, "quiet": 2, "uniqueness": 2})
        ],
        "region": Region.new("lan_shenli", [Vector2i(0,0), Vector2i(1,0), Vector2i(2,0), Vector2i(0,1), Vector2i(1,1), Vector2i(2,1)], {"balcony": [Vector2i(3,0)], "attic": [Vector2i(0,2)], "courtyard": [Vector2i(3,1)], "storage": [Vector2i(1,2)]}, {"neighborhood_quiet": 100})
    }
~~~

Populate the arrays with exactly these additional facility records: desk, fast_wifi, soundproof_wall, tea_table, flowers, record_player, family_bed, safety_rail, storage, double_bed, blackout_curtain, mini_fridge, luggage_rack, reception_bell, laundry_machine, shared_table, wall_art, potted_plant, bathrobe, and terrace_chair. Use a price between 80 and 300 and one or two of the six standard stat keys for every record. Add exactly these additional combinations: business_suite (desk, fast_wifi, soundproof_wall; quiet +4, convenience +3), vintage_tea (tea_table, flowers, record_player; ambience +4, uniqueness +3), family_safe_room (family_bed, safety_rail, storage; comfort +4, service +3), quiet_retreat (double_bed, blackout_curtain, soundproof_wall; comfort +3, quiet +4), courtyard_afternoon (shared_table, potted_plant, tea_table; ambience +3, service +2), gallery_corner (wall_art, floor_lamp, armchair; ambience +3, uniqueness +3), and balcony_date (terrace_chair, flowers, mini_fridge; comfort +2, ambience +3). Each uses max_distance 1 and a Chinese hint matching its name.

- [ ] **Step 4: Verify the data test passes**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game/scripts/models inn-management-game/data/lan_shenli.gd inn-management-game/tests/test_effect_service.gd
git commit -m "feat: add inn game content configuration"
~~~

## Task 3: Implement placement, expansion, and combination effects

**Files:**

- Create: inn-management-game/scripts/services/layout_service.gd
- Create: inn-management-game/scripts/services/effect_service.gd
- Create: inn-management-game/tests/test_layout_service.gd
- Modify: inn-management-game/tests/test_effect_service.gd

**Interfaces:**

- Produces: LayoutService.place(id, cell), remove(cell), unlock_area(id), and EffectService.calculate(placements, combinations).

- [ ] **Step 1: Write failing rule tests**

Create tests/test_layout_service.gd:

~~~
extends RefCounted

func run_all() -> int:
    var region := Region.new("test", [Vector2i(0,0)], {"balcony": [Vector2i(1,0)]}, {})
    var layout := preload("res://scripts/services/layout_service.gd").new(region)
    assert(layout.place("bookshelf", Vector2i(0,0)).ok)
    assert(not layout.place("lamp", Vector2i(0,0)).ok)
    assert(not layout.place("lamp", Vector2i(1,0)).ok)
    assert(layout.unlock_area("balcony"))
    assert(layout.place("lamp", Vector2i(1,0)).ok)
    return 0
~~~

Append to test_effect_service.gd:

~~~
var placements := {Vector2i(0,0): "bookshelf", Vector2i(1,0): "armchair", Vector2i(0,1): "floor_lamp"}
var combo := Combination.new("window_reading", ["bookshelf", "armchair", "floor_lamp"], 1, {"quiet": 3, "ambience": 3}, "hint")
var result := preload("res://scripts/services/effect_service.gd").new().calculate(placements, [combo])
assert(result.discovered.has("window_reading"))
assert(result.stats.quiet == 3)
~~~

- [ ] **Step 2: Verify failure**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: non-zero exit because the services do not exist.

- [ ] **Step 3: Implement both services**

Create layout_service.gd:

~~~
class_name LayoutService
extends RefCounted
var region: Region
var placements := {}
var available_cells := {}

func _init(p_region: Region) -> void:
    region = p_region
    for cell in region.initial_cells: available_cells[cell] = true

func place(facility_id: String, cell: Vector2i) -> Dictionary:
    if not available_cells.has(cell): return {"ok": false, "reason": "该区域尚未修缮"}
    if placements.has(cell): return {"ok": false, "reason": "此处已有设施"}
    placements[cell] = facility_id
    return {"ok": true, "reason": ""}

func remove(cell: Vector2i) -> bool:
    if not placements.has(cell): return false
    placements.erase(cell)
    return true

func unlock_area(area_id: String) -> bool:
    if not region.expansion_cells.has(area_id): return false
    for cell in region.expansion_cells[area_id]: available_cells[cell] = true
    return true
~~~

Create effect_service.gd:

~~~
class_name EffectService
extends RefCounted
const KEYS := ["comfort", "quiet", "ambience", "convenience", "service", "uniqueness"]

func calculate(placements: Dictionary, combinations: Array) -> Dictionary:
    var stats := {}
    for key in KEYS: stats[key] = 0
    var discovered := PackedStringArray()
    for combo in combinations:
        if _triggered(placements, combo):
            discovered.append(combo.id)
            for key in combo.stat_bonus: stats[key] += combo.stat_bonus[key]
    return {"stats": stats, "discovered": discovered}

func _triggered(placements: Dictionary, combo: Combination) -> bool:
    var found: Array[Vector2i] = []
    for required_id in combo.required_ids:
        var matched := false
        for cell in placements:
            if placements[cell] == required_id and not found.has(cell):
                found.append(cell); matched = true; break
        if not matched: return false
    for left in found:
        for right in found:
            if abs(left.x - right.x) + abs(left.y - right.y) > combo.max_distance * 2: return false
    return true
~~~

- [ ] **Step 4: Verify success**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0. Locked cells reject placement, expansion opens cells, and window_reading yields its bonus.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game/scripts/services/layout_service.gd inn-management-game/scripts/services/effect_service.gd inn-management-game/tests/test_layout_service.gd inn-management-game/tests/test_effect_service.gd
git commit -m "feat: add inn layout and combination rules"
~~~

## Task 4: Implement guest scoring and the seven-day cycle

**Files:**

- Create: inn-management-game/scripts/services/guest_service.gd
- Create: inn-management-game/scripts/game_state.gd
- Create: inn-management-game/tests/test_guest_service.gd

**Interfaces:**

- Produces: GuestService.score(guest, stats, neighborhood_quiet, event) and GameState.end_day(guests, event).

- [ ] **Step 1: Write failing scoring and cycle tests**

Create tests/test_guest_service.gd:

~~~
extends RefCounted

func run_all() -> int:
    var guest := GuestProfile.new("business", 320, {"quiet": 3, "convenience": 3, "service": 2})
    var scorer := preload("res://scripts/services/guest_service.gd").new()
    var high := scorer.score(guest, {"quiet": 8, "convenience": 8, "service": 6}, 100, {})
    var low := scorer.score(guest, {"quiet": 0, "convenience": 8, "service": 6}, 100, {})
    assert(high.satisfaction > low.satisfaction)
    assert(high.income > low.income)
    var state := preload("res://scripts/game_state.gd").new(12)
    for ignored in 7: state.end_day([], {})
    assert(state.day == 1 and state.week == 2)
    return 0
~~~

- [ ] **Step 2: Verify failure**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: non-zero exit because GuestService and GameState are absent.

- [ ] **Step 3: Implement deterministic scoring and daily settlement**

Create guest_service.gd:

~~~
class_name GuestService
extends RefCounted

func score(guest: GuestProfile, stats: Dictionary, neighborhood_quiet: int, event: Dictionary) -> Dictionary:
    var total := 0
    var weighted := 0
    for key in guest.weights:
        total += guest.weights[key]
        weighted += int(stats.get(key, 0)) * guest.weights[key]
    var satisfaction := clampi(roundi(float(weighted) / max(1, total) * 10.0), 0, 100)
    if neighborhood_quiet < 40 and guest.weights.get("quiet", 0) > 0: satisfaction = maxi(0, satisfaction - 20)
    var delta := 10 if event.get("id", "") == "neighbor_complaint" else 0
    satisfaction = maxi(0, satisfaction - delta)
    return {"satisfaction": satisfaction, "income": roundi(guest.budget * (0.4 + float(satisfaction) / 125.0)), "review": clampi(ceili(float(satisfaction) / 20.0), 1, 5), "neighborhood_delta": delta}
~~~

Create game_state.gd:

~~~
class_name GameState
extends RefCounted
var day := 1
var week := 1
var funds := 1500
var neighborhood_quiet := 100
var data: Dictionary
var layout: LayoutService
var effects := EffectService.new()
var scorer := GuestService.new()

func _init(seed: int = 1) -> void:
    data = LanShenli.new().create()
    layout = LayoutService.new(data.region)

func end_day(today_guests: Array, event: Dictionary) -> Dictionary:
    var effect := effects.calculate(layout.placements, data.combinations)
    var income := 0
    for guest in today_guests:
        var result := scorer.score(guest, effect.stats, neighborhood_quiet, event)
        income += result.income
        neighborhood_quiet = clampi(neighborhood_quiet - result.neighborhood_delta, 0, 100)
    funds += income
    day += 1
    if day > 7: day = 1; week += 1
    return {"income": income, "stats": effect.stats, "discovered": effect.discovered}
~~~

- [ ] **Step 4: Verify success**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0; a quiet business stay earns more and seven settlements advance to week two.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game/scripts/services/guest_service.gd inn-management-game/scripts/game_state.gd inn-management-game/tests/test_guest_service.gd
git commit -m "feat: add guest scoring and operating cycle"
~~~

## Task 5: Add catalog, merchant, expansion hammer, and saves

**Files:**

- Create: inn-management-game/scripts/services/progression_service.gd
- Create: inn-management-game/scripts/services/save_service.gd
- Create: inn-management-game/tests/test_progression_service.gd
- Modify: inn-management-game/scripts/game_state.gd

**Interfaces:**

- Produces: ProgressionService.record_discoveries(ids), offer(seed), buy_hammer(area_id, funds, layout), SaveService.to_json(state), SaveService.from_json(text).

- [ ] **Step 1: Write failing progress and save tests**

Create tests/test_progression_service.gd:

~~~
extends RefCounted

func run_all() -> int:
    var progression := preload("res://scripts/services/progression_service.gd").new(["window_reading"])
    progression.record_discoveries(["window_reading"])
    assert(progression.catalog.has("window_reading"))
    assert(progression.offer(7).hammer.price == 600)
    var save := preload("res://scripts/services/save_service.gd").new()
    var restored := save.from_json(save.to_json({"day": 3, "funds": 480}))
    assert(restored.day == 3 and restored.funds == 480)
    assert(save.from_json("not json").is_empty())
    return 0
~~~

- [ ] **Step 2: Verify failure**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: non-zero exit because the services are absent.

- [ ] **Step 3: Implement deterministic progression and safe serialization**

Create progression_service.gd:

~~~
class_name ProgressionService
extends RefCounted
var catalog := {}
var valid_ids: PackedStringArray

func _init(p_valid_ids: PackedStringArray) -> void:
    valid_ids = p_valid_ids

func record_discoveries(ids: PackedStringArray) -> void:
    for id in ids:
        if valid_ids.has(id): catalog[id] = true

func offer(seed: int) -> Dictionary:
    var rng := RandomNumberGenerator.new()
    rng.seed = seed
    var areas := ["balcony", "attic", "courtyard", "storage"]
    return {"hammer": {"area_id": areas[rng.randi_range(0, 3)], "price": 600}, "hint": "让阅读靠近自然光"}

func buy_hammer(area_id: String, funds: int, layout: LayoutService) -> Dictionary:
    if funds < 600: return {"ok": false, "funds": funds, "reason": "资金不足"}
    if not layout.unlock_area(area_id): return {"ok": false, "funds": funds, "reason": "该区域不可扩展"}
    return {"ok": true, "funds": funds - 600, "reason": ""}
~~~

Create save_service.gd:

~~~
class_name SaveService
extends RefCounted

func to_json(state: Dictionary) -> String:
    return JSON.stringify(state)

func from_json(text: String) -> Dictionary:
    var parser := JSON.new()
    if parser.parse(text) != OK or not (parser.data is Dictionary): return {}
    return parser.data
~~~

Modify GameState: initialize ProgressionService with all configured combination IDs, call record_discoveries after calculating effects, assign merchant_offer = progression.offer(week) after a 7-day rollover, and add cycle_summary() returning week, funds, merchant_offer, and catalog.

- [ ] **Step 4: Verify success**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0; identical seeds repeat merchant offers, invalid saves return an empty dictionary, and catalog ignores unconfigured IDs.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game/scripts/services/progression_service.gd inn-management-game/scripts/services/save_service.gd inn-management-game/scripts/game_state.gd inn-management-game/tests/test_progression_service.gd
git commit -m "feat: add catalog merchant and saves"
~~~

## Task 6: Build the focused portrait UI and verify the complete loop

**Files:**

- Modify: inn-management-game/scripts/ui/main_screen.gd
- Create: inn-management-game/README.md
- Modify: inn-management-game/tests/test_layout_service.gd
- Modify: inn-management-game/tests/test_effect_service.gd
- Modify: inn-management-game/tests/test_guest_service.gd
- Modify: inn-management-game/tests/test_progression_service.gd

**Interfaces:**

- Produces: usable vertical UI with 布局、营业、图册、商人、结算 actions and reproducible verification.

- [ ] **Step 1: Add regression assertions**

Add the following checks to their relevant test suites:

~~~
assert(layout.remove(Vector2i(0,0)))
assert(layout.place("lamp", Vector2i(0,0)).ok)

var far := {Vector2i(0,0): "bookshelf", Vector2i(5,0): "armchair", Vector2i(0,5): "floor_lamp"}
assert(not service.calculate(far, [combo]).discovered.has("window_reading"))

assert(scorer.score(guest, {"quiet": 8, "convenience": 8, "service": 6}, 20, {}).satisfaction < high.satisfaction)

assert(not progression.buy_hammer("balcony", 599, layout).ok)
~~~

- [ ] **Step 2: Run regression tests**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0; the existing services satisfy these contracts.

- [ ] **Step 3: Implement the screen and runbook**

Replace scripts/ui/main_screen.gd:

~~~
extends Control
var state := GameState.new(1)
var header := Label.new()
var body := Label.new()

func _ready() -> void:
    var column := VBoxContainer.new()
    column.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    column.add_theme_constant_override("separation", 18)
    add_child(column)
    column.add_child(header)
    for title in ["布局", "营业", "图册", "商人", "结算"]:
        var button := Button.new()
        button.text = title
        button.pressed.connect(_on_action.bind(title))
        column.add_child(button)
    column.add_child(body)
    _refresh()

func _on_action(title: String) -> void:
    if title == "结算": state.end_day([], {})
    body.text = title + "：首版入口已就绪"
    _refresh()

func _refresh() -> void:
    header.text = "第 %d 日｜资金 %d｜邻里安静度 %d" % [state.day, state.funds, state.neighborhood_quiet]
~~~

Create README.md:

~~~
# 澜申里民宿首版

## Automated test

godot --headless --path . --script res://tests/test_runner.gd

## Manual acceptance

1. Open scenes/Main.tscn and run it in portrait mode.
2. Confirm the header displays day, funds, and neighborhood quiet.
3. Press all five navigation buttons; each changes the body without an error.
4. Press 结算 seven times; day resets to 1 and week increments.
5. Place the three reading-corner facilities adjacent; window_reading appears in catalog and boosts quiet/ambience.
6. Buy a 600-fund hammer; the chosen locked expansion becomes placeable. A 599-fund purchase reports 资金不足.
~~~

- [ ] **Step 4: Run automated and manual verification**

Run: godot --headless --path inn-management-game --script res://tests/test_runner.gd

Expected: exit code 0.

Run: godot --path inn-management-game --editor scenes/Main.tscn

Expected: the 1080×1920 scene opens; all five buttons are visible and no script errors appear during manual acceptance.

- [ ] **Step 5: Commit**

~~~
git add inn-management-game
git commit -m "feat: deliver inn management game first loop"
~~~

## Plan self-review

- **Spec coverage:** Task 2 supplies four guests, six standard stats, the required content counts, and the four expansion areas. Task 3 implements layout and combination bonuses. Task 4 implements guest scoring, event penalty, income and the 7-day loop. Task 5 implements catalog discovery, deterministic merchant offers, in-game hammers and save handling. Task 6 provides a portrait UI plus automated and manual acceptance. Multiple regions remain a Region configuration boundary, as scoped.
- **Placeholder scan:** Each task includes paths, interfaces, test code, commands, expected outputs, concrete implementation, and a commit command. No deferred tasks or unresolved requirements are present.
- **Type consistency:** Facility, Combination, GuestProfile, Region, LayoutService, EffectService, GuestService, ProgressionService, and GameState use consistent names and signatures across all tasks.
