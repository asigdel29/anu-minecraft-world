# Render the six sky cubemap faces for public/cubemap/ (as PNG; convert to
# webp with the sibling step in the docs). A pure Nishita sky — no geometry —
# so slight face-orientation differences are invisible by construction.
#
#   blender -b -P assets/pipeline/render_sky.py -- <out_dir>

import bpy
import math
import os
import sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/sky"
os.makedirs(OUT, exist_ok=True)

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

world = bpy.data.worlds["World"]
world.use_nodes = True
nt = world.node_tree
nt.nodes.clear()
sky = nt.nodes.new("ShaderNodeTexSky")
# Blender 5.x renamed the physical sky model (was NISHITA in 4.x).
for sky_type in ("MULTIPLE_SCATTERING", "NISHITA", "HOSEK_WILKIE"):
    try:
        sky.sky_type = sky_type
        break
    except TypeError:
        continue
for attr, value in (
    ("sun_elevation", math.radians(45)),
    ("sun_rotation", math.radians(35)),
    ("sun_intensity", 0.55),
    ("altitude", 300),
):
    if hasattr(sky, attr):
        try:
            setattr(sky, attr, value)
        except (TypeError, AttributeError):
            pass
bg = nt.nodes.new("ShaderNodeBackground")
out = nt.nodes.new("ShaderNodeOutputWorld")
nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

cam_data = bpy.data.cameras.new("skycam")
cam_data.angle = math.radians(90)
cam = bpy.data.objects.new("skycam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.image_settings.file_format = "PNG"

# three.js cube faces in Blender's z-up frame (three +y = Blender +z,
# three +z = Blender -y). Camera at origin looking down each axis.
FACES = {
    "px": (math.radians(90), 0, math.radians(-90)),
    "nx": (math.radians(90), 0, math.radians(90)),
    "py": (math.radians(180), 0, 0),
    "ny": (0, 0, 0),
    "pz": (math.radians(90), 0, math.radians(180)),
    "nz": (math.radians(90), 0, 0),
}
for name, rot in FACES.items():
    cam.rotation_euler = rot
    scene.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[render_sky] {name}.png", flush=True)
print("[render_sky] DONE", flush=True)
