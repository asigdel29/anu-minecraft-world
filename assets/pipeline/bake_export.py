# Headless bake + export pipeline for the island world.
#
# Run from the repo root:
#   blender -b assets/island.blend -P assets/pipeline/bake_export.py -- <out_dir>
#
# Produces, in <out_dir>:
#   House.glb                 merged, baked house set-piece (node House,
#                             material MergedBake — the wrapper's contract)
#   IslandQ_<sx>_<sz>.glb     four baked terrain quadrants, each carrying a
#                             "colliders" subtree with a decimated proxy
#   PropsQ_<sx>_<sz>.glb      flat-color prop clusters per quadrant (trees,
#                             rocks); no colliders — decorative only
#   Water.glb                 the sea plane (collider: walk-on-water, matching
#                             the original lake behavior)
#
# Baked lighting convention (the engine's convertMaterial contract): every
# baked mesh exports ONE material with the bake wired into the Emission
# socket and base color black, which lands in glTF as emissiveTexture +
# baseColorFactor [0,0,0,1]. Props skip baking and export plain base colors;
# the engine falls back to a color-only unlit material for those.

import bpy
import bmesh
import os
import sys
import math

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/island-export"
os.makedirs(OUT, exist_ok=True)

BAKE_SAMPLES = 32
TERRAIN_ATLAS = 2048
HOUSE_ATLAS = 2048
PROP_PREFIXES = ("tree", "orchard_tree", "rock", "llama")

scene = bpy.context.scene


def log(*a):
    print("[bake_export]", *a, flush=True)


# ---------------------------------------------------------------- lighting
def setup_lighting():
    sun = bpy.data.objects.get("bake_sun")
    if sun is None:
        light = bpy.data.lights.new("bake_sun", "SUN")
        sun = bpy.data.objects.new("bake_sun", light)
        scene.collection.objects.link(sun)
    sun.data.energy = 2.0
    sun.data.color = (1.0, 0.95, 0.85)
    sun.data.angle = 0.35
    sun.rotation_euler = (math.radians(45), 0, math.radians(35))
    world = bpy.data.worlds["World"]
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    # Strong sky fill keeps shadowed faces saturated instead of near-black —
    # the stylized look wants soft, lifted shadows, not photoreal contrast.
    bg.inputs["Color"].default_value = (0.65, 0.78, 1.0, 1.0)
    bg.inputs["Strength"].default_value = 1.2


# ------------------------------------------------------------- mesh helpers
def apply_and_join(objects, name):
    """Duplicate objects, apply modifiers, join into one mesh named `name`."""
    bpy.ops.object.select_all(action="DESELECT")
    dups = []
    for src in objects:
        dup = src.copy()
        dup.data = src.data.copy()
        scene.collection.objects.link(dup)
        dups.append(dup)
    for dup in dups:
        bpy.context.view_layer.objects.active = dup
        for mod in list(dup.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)
        dup.select_set(True)
    bpy.context.view_layer.objects.active = dups[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    joined.data.name = name
    joined.hide_render = False  # sources may be render-hidden; dups must bake
    # Bake the object transform into the vertices: the engine's wrappers
    # render geometry without node transforms (gltfjsx style), so exported
    # meshes must be world-coordinate with an identity transform.
    bpy.ops.object.select_all(action="DESELECT")
    joined.select_set(True)
    bpy.context.view_layer.objects.active = joined
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return joined


def smart_uv(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.003)
    bpy.ops.object.mode_set(mode="OBJECT")


def planar_uv(obj):
    """Top-down UVs for heightfield terrain — seam-free by construction."""
    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv = mesh.uv_layers.active.data
    xs = [v.co.x for v in mesh.vertices]
    ys = [v.co.y for v in mesh.vertices]
    x0, x1 = min(xs), max(xs)
    y0, y1 = min(ys), max(ys)
    for loop in mesh.loops:
        co = mesh.vertices[loop.vertex_index].co
        uv[loop.index].uv = ((co.x - x0) / (x1 - x0), (co.y - y0) / (y1 - y0))


def bake_to_emissive(obj, size, image_name):
    """Bake diffuse (color+direct+indirect) to an image, then replace all of
    the object's materials with the single emissive-convention material."""
    img = bpy.data.images.new(image_name, size, size)
    # Boolean cuts can leave empty material slots behind; drop them (and make
    # sure every remaining material has a node tree) before wiring bake nodes.
    bpy.context.view_layer.objects.active = obj
    for i in reversed(range(len(obj.data.materials))):
        if obj.data.materials[i] is None:
            obj.data.materials.pop(index=i)
    for mat in obj.data.materials:
        if not mat.use_nodes:
            mat.use_nodes = True
    for mat in obj.data.materials:
        nt = mat.node_tree
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        nt.nodes.active = node
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    scene.render.engine = "CYCLES"
    scene.cycles.samples = BAKE_SAMPLES
    scene.cycles.use_denoising = True  # flat stylized colors denoise cleanly; interiors are indirect-lit and grainy without it
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_color = True
    scene.render.bake.margin = 6
    log("baking", obj.name, "->", image_name)
    bpy.ops.object.bake(type="DIFFUSE")

    baked = bpy.data.materials.new("MergedBake")
    baked.use_nodes = True
    bsdf = baked.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0, 0, 0, 1)
    tex = baked.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = img
    baked.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 1.0
    obj.data.materials.clear()
    obj.data.materials.append(baked)
    return obj


def export_glb(objects, path):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
        for child in o.children_recursive:
            child.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_animations=False,
    )
    log("exported", path)


def hide_for_export(obj):
    obj.hide_render = True
    obj.hide_viewport = True


# -------------------------------------------------------------------- house
def build_house():
    build = bpy.data.collections["BUILD"]
    parts = [o for o in build.objects
             if o.type == "MESH" and o.name.startswith("hb_")]
    house = apply_and_join(parts, "House")
    # The originals occupy exactly the same space as the joined duplicate;
    # left renderable they entomb every face of the bake target in coincident
    # geometry and the whole bake comes out black. Hide them from Cycles.
    for src in parts:
        src.hide_render = True
    smart_uv(house)
    # Interiors see the sun only through openings; without direct light the
    # bake is indirect-only and grainy (bake results are never denoised).
    # Warm ceiling lights per storey give clean, bright rooms; removed after.
    interior_lights = []
    for cz in (70.4, 75.9, 80.4):
        light = bpy.data.lights.new(f"bake_room_{cz}", "AREA")
        light.energy = 900
        light.color = (1.0, 0.96, 0.88)
        light.size = 14
        lamp = bpy.data.objects.new(f"bake_room_{cz}", light)
        lamp.location = (-5.5, -2.0, cz)
        scene.collection.objects.link(lamp)
        interior_lights.append(lamp)
    bake_to_emissive(house, HOUSE_ATLAS, "bake_house")
    for lamp in interior_lights:
        bpy.data.objects.remove(lamp, do_unlink=True)
    house.data.materials[0].name = "MergedBake"
    export_glb([house], os.path.join(OUT, "House.glb"))
    # Keep the baked house renderable: it casts the yard shadow during the
    # terrain bakes and is hidden afterwards.
    return house


# ------------------------------------------------------------------ terrain
def split_quadrant(terrain, sx, sz):
    """Duplicate the terrain and delete every face outside the quadrant.
    sx/sz are -1 or +1 in Blender x/y."""
    dup = terrain.copy()
    dup.data = terrain.data.copy()
    dup.hide_render = False  # source is render-hidden; the dup must bake
    scene.collection.objects.link(dup)
    bm = bmesh.new()
    bm.from_mesh(dup.data)
    doomed = []
    for f in bm.faces:
        cx = sum(v.co.x for v in f.verts) / len(f.verts)
        cy = sum(v.co.y for v in f.verts) / len(f.verts)
        if (cx * sx < 0) or (cy * sz < 0):
            doomed.append(f)
    bmesh.ops.delete(bm, geom=doomed, context="FACES")
    bm.to_mesh(dup.data)
    bm.free()
    dup.name = f"IslandQ_{'p' if sx > 0 else 'n'}_{'p' if sz > 0 else 'n'}"
    return dup


def add_collider_proxy(chunk_obj):
    proxy = chunk_obj.copy()
    proxy.data = chunk_obj.data.copy()
    scene.collection.objects.link(proxy)
    mod = proxy.modifiers.new("dec", "DECIMATE")
    mod.ratio = 0.12
    bpy.context.view_layer.objects.active = proxy
    bpy.ops.object.select_all(action="DESELECT")
    proxy.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    proxy.data.materials.clear()
    root = bpy.data.objects.new("colliders", None)
    scene.collection.objects.link(root)
    proxy.parent = root
    proxy.name = chunk_obj.name + "_proxy"
    root.name = "colliders"
    return root


def build_terrain():
    terrain = bpy.data.objects["island_terrain"]
    # Same coincidence rule as the house: the original terrain (and the water
    # plane, which would entomb the seafloor in shadow) must not render while
    # the quadrant duplicates bake. The quadrants themselves are disjoint.
    terrain.hide_render = True
    water = bpy.data.objects.get("island_water")
    if water:
        water.hide_render = True
    props = bpy.data.collections["PROPS"]
    dock = [o for o in props.objects if o.name.startswith("dock")]
    exported = []
    for sx in (-1, 1):
        for sz in (-1, 1):
            quad = split_quadrant(terrain, sx, sz)
            # The dock lives in the south (Blender -y) half; merge it into
            # its quadrant so it is baked and collidable with the ground.
            if sz < 0 and sx < 0:
                pass  # dock straddles x=0; attach to the +x south quadrant
            if sz < 0 and sx > 0 and dock:
                quad = apply_and_join([quad] + dock, quad.name)
            planar_uv(quad)
            bake_to_emissive(quad, TERRAIN_ATLAS, f"bake_{quad.name}")
            colliders = add_collider_proxy(quad)
            name = f"IslandQ_{'e' if sx > 0 else 'w'}{'s' if sz < 0 else 'n'}"
            quad.name = name
            path = os.path.join(OUT, f"{name}.glb")
            export_glb([quad, colliders], path)
            for o in (quad,):
                hide_for_export(o)
            exported.append(name)
    return exported


# -------------------------------------------------------------------- props
def build_props():
    props = bpy.data.collections["PROPS"]
    groups = {"en": [], "es": [], "wn": [], "ws": []}
    for o in props.objects:
        if not any(o.name.startswith(p) for p in PROP_PREFIXES):
            continue
        key = ("e" if o.location.x >= 0 else "w") + ("n" if o.location.y >= 0 else "s")
        groups[key].append(o)
    for key, objs in groups.items():
        if not objs:
            continue
        merged = apply_and_join(objs, f"PropsQ_{key}")
        export_glb([merged], os.path.join(OUT, f"PropsQ_{key}.glb"))
        hide_for_export(merged)


# -------------------------------------------------------------------- water
def build_water():
    water = bpy.data.objects["island_water"]
    dup = water.copy()
    dup.data = water.data.copy()
    dup.name = "Water"
    scene.collection.objects.link(dup)
    export_glb([dup], os.path.join(OUT, "Water.glb"))


setup_lighting()
# Delete the reference world outright (this headless copy is never saved):
# hidden objects still shadow bakes in some paths, and their names ("House",
# "MergedBake") would force Blender to .001-suffix the export names.
ref = bpy.data.collections.get("REFERENCE")
if ref:
    for o in list(ref.objects):
        bpy.data.objects.remove(o, do_unlink=True)

# Second CLI arg "props" exports only the (unbaked) prop clusters — used
# when dressing changes without touching the baked terrain or house.
if len(argv) > 1 and argv[1] == "props":
    build_props()
elif len(argv) > 1 and argv[1] == "house":
    build_house()
else:
    house = build_house()
    build_terrain()
    hide_for_export(house)
    build_props()
    build_water()
log("DONE")
