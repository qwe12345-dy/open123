#!/usr/bin/env python3
"""
Space Defender 3D - OBJ Model Generator (v3)
- Player ship: white sleek fighter + separate blue cockpit dome
- Enemy: round spherical asteroid rock
- All hand-crafted OBJ
"""
import math
import os
import random

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def write_obj(filename, vertices, faces):
    path = os.path.join(MODELS_DIR, filename)
    with open(path, "w") as f:
        f.write(f"# {filename}\n")
        f.write(f"# Vertices: {len(vertices)}, Faces: {len(faces)}\n")
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            idx = " ".join(str(i + 1) for i in face)
            f.write(f"f {idx}\n")
    print(f"  -> {path}  ({len(vertices)} verts, {len(faces)} faces)")


# ---------------------------------------------------------------------------
# 1. Player Ship - sleek white fighter body
# ---------------------------------------------------------------------------
def gen_player_ship():
    verts = []
    faces = []

    # Nose tip
    verts.append((0, 0.1, 4.0))                   # 0
    # Nose ring
    verts.append((0, 0.4, 2.0))                   # 1 top
    verts.append((0.35, 0.1, 2.0))                # 2 right
    verts.append((0, -0.2, 2.0))                   # 3 bottom
    verts.append((-0.35, 0.1, 2.0))               # 4 left
    # Mid body
    verts.append((0, 0.5, 0.5))                   # 5 top (cockpit base)
    verts.append((0.55, 0.1, 0.5))                # 6 right
    verts.append((0, -0.3, 0.5))                   # 7 bottom
    verts.append((-0.55, 0.1, 0.5))               # 8 left
    # Rear body
    verts.append((0, 0.3, -1.0))                  # 9 top
    verts.append((0.7, 0, -1.0))                  # 10 right root
    verts.append((0, -0.25, -1.0))                # 11 bottom
    verts.append((-0.7, 0, -1.0))                 # 12 left root
    # Wing tips
    verts.append((2.0, -0.1, -1.8))               # 13 right tip
    verts.append((-2.0, -0.1, -1.8))              # 14 left tip
    # Tail fins
    verts.append((0, 0.9, -1.8))                  # 15 top fin
    verts.append((0, -0.5, -1.8))                 # 16 bottom fin
    # Engines
    verts.append((0.3, -0.1, -2.3))               # 17 right eng
    verts.append((-0.3, -0.1, -2.3))              # 18 left eng

    faces = [
        # Nose cone
        (0, 1, 2), (0, 2, 3), (0, 3, 4), (0, 4, 1),
        # Nose to mid
        (1, 5, 2), (2, 6, 3), (3, 7, 4), (4, 8, 1),
        (1, 2, 5), (2, 3, 6), (3, 4, 7), (4, 1, 8),
        # Mid to rear
        (5, 9, 6), (6, 10, 7), (7, 11, 8), (8, 12, 5),
        (5, 6, 9), (6, 7, 10), (7, 8, 11), (8, 5, 12),
        # Wings
        (10, 13, 9), (10, 11, 13), (9, 13, 11),
        (12, 14, 9), (12, 11, 14), (9, 14, 11),
        # Tail fins
        (9, 15, 12), (10, 15, 13),
        (11, 16, 10), (11, 12, 16),
        # Engines
        (10, 17, 11), (12, 18, 11),
        (10, 12, 17), (12, 17, 18), (17, 18, 11),
    ]
    write_obj("player_ship.obj", verts, faces)


# ---------------------------------------------------------------------------
# 2. Cockpit Dome - blue transparent canopy (placed on top of ship)
# ---------------------------------------------------------------------------
def gen_cockpit_dome():
    verts = []
    faces = []

    # Base ring (ellipse on top of fuselage)
    n = 8
    for i in range(n):
        angle = (i / n) * 2 * math.pi
        verts.append((0.25 * math.cos(angle), 0, 0.5 * math.sin(angle)))
    # 0..7 base ring, center at (0,0,0)
    # Top apex
    apex = len(verts)
    verts.append((0, 0.4, 0))
    # Bottom center
    bottom = len(verts)
    verts.append((0, -0.05, 0))

    # Dome upper surface
    for i in range(n):
        faces.append((apex, i, (i + 1) % n))
    # Bottom cap
    for i in range(n):
        faces.append((bottom, (i + 1) % n, i))

    write_obj("cockpit_dome.obj", verts, faces)


# ---------------------------------------------------------------------------
# 3. Enemy Rock - round spherical asteroid (the red things)
# ---------------------------------------------------------------------------
def gen_enemy_rock():
    verts = []
    faces = []
    random.seed(99)

    # Icosahedron base (spherical rock)
    t = (1.0 + math.sqrt(5.0)) / 2.0
    raw = [
        (-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0),
        (0, -1, t), (0, 1, t), (0, -1, -t), (0, 1, -t),
        (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1),
    ]
    # Subdivide once for rounder shape
    verts = []
    midpoints = {}

    def get_mid(a, b):
        key = (min(a, b), max(a, b))
        if key in midpoints:
            return midpoints[key]
        va = raw[a]
        vb = raw[b]
        mx = (va[0] + vb[0]) / 2
        my = (va[1] + vb[1]) / 2
        mz = (va[2] + vb[2]) / 2
        # jitter for rocky look
        jitter = 0.08
        mx *= 1 + random.uniform(-jitter, jitter)
        my *= 1 + random.uniform(-jitter, jitter)
        mz *= 1 + random.uniform(-jitter, jitter)
        idx = len(verts)
        verts.append((mx, my, mz))
        midpoints[key] = idx
        return idx

    # Scale original vertices into verts
    for v in raw:
        length = math.sqrt(sum(c * c for c in v))
        scale = 0.9 / length * random.uniform(0.9, 1.1)
        verts.append((v[0] * scale, v[1] * scale, v[2] * scale))

    # Original icosa faces
    original_faces = [
        (0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
        (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
        (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
        (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1),
    ]

    # Subdivide each face into 4
    for (a, b, c) in original_faces:
        ab = get_mid(a, b)
        bc = get_mid(b, c)
        ca = get_mid(c, a)
        faces.append((a, ab, ca))
        faces.append((b, bc, ab))
        faces.append((c, ca, bc))
        faces.append((ab, bc, ca))

    write_obj("enemy_rock.obj", verts, faces)


# ---------------------------------------------------------------------------
# 4. Bullet
# ---------------------------------------------------------------------------
def gen_bullet():
    verts = [
        (0, 0, 1.5), (0, 0, -1.5),
        (0.18, 0, 0.5), (0, 0.18, 0.5), (-0.18, 0, 0.5), (0, -0.18, 0.5),
        (0.18, 0, -0.5), (0, 0.18, -0.5), (-0.18, 0, -0.5), (0, -0.18, -0.5),
    ]
    faces = [
        (0, 2, 3), (0, 3, 4), (0, 4, 5), (0, 5, 2),
        (2, 6, 3), (3, 7, 4), (4, 8, 5), (5, 9, 2),
        (2, 3, 6), (3, 4, 7), (4, 5, 8), (5, 2, 9),
        (1, 3, 6), (1, 4, 7), (1, 5, 8), (1, 2, 9),
    ]
    write_obj("bullet.obj", verts, faces)


# ---------------------------------------------------------------------------
# 5. Star
# ---------------------------------------------------------------------------
def gen_star():
    verts = []
    faces = []
    outer_r, inner_r, thickness, points = 1.0, 0.42, 0.3, 5
    for i in range(points * 2):
        angle = math.pi / 2 + i * math.pi / points
        r = outer_r if i % 2 == 0 else inner_r
        verts.append((r * math.cos(angle), r * math.sin(angle), thickness / 2))
    for i in range(points * 2):
        angle = math.pi / 2 + i * math.pi / points
        r = outer_r if i % 2 == 0 else inner_r
        verts.append((r * math.cos(angle), r * math.sin(angle), -thickness / 2))
    n = points * 2
    for i in range(1, n - 1):
        faces.append((0, i, i + 1))
    for i in range(1, n - 1):
        faces.append((n, n + i + 1, n + i))
    for i in range(n):
        a, b = i, (i + 1) % n
        faces.append((a, b, n + b))
        faces.append((a, n + b, n + a))
    write_obj("star.obj", verts, faces)


# ---------------------------------------------------------------------------
# 6. Background asteroid
# ---------------------------------------------------------------------------
def gen_asteroid():
    verts = []
    faces = []
    random.seed(7)
    t = (1.0 + math.sqrt(5.0)) / 2.0
    raw = [
        (-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0),
        (0, -1, t), (0, 1, t), (0, -1, -t), (0, 1, -t),
        (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1),
    ]
    for v in raw:
        length = math.sqrt(sum(c * c for c in v))
        scale = 0.7 / length * random.uniform(0.75, 1.25)
        verts.append((v[0] * scale, v[1] * scale, v[2] * scale))
    faces = [
        (0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
        (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
        (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
        (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1),
    ]
    write_obj("asteroid.obj", verts, faces)


if __name__ == "__main__":
    print("Generating v3 models...")
    gen_player_ship()
    gen_cockpit_dome()
    gen_enemy_rock()
    gen_bullet()
    gen_star()
    gen_asteroid()
    print("Done!")
