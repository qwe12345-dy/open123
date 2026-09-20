#!/usr/bin/env python3
"""
Space Defender 3D - OBJ Model Generator (v2 refined)
All models hand-crafted, higher polygon count, better silhouettes.
Run: python3 generate_models.py
"""
import math
import os
import random

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def write_obj(filename, vertices, faces):
    path = os.path.join(MODELS_DIR, filename)
    with open(path, "w") as f:
        f.write(f"# {filename} - refined hand-crafted model\n")
        f.write(f"# Vertices: {len(vertices)}, Faces: {len(faces)}\n")
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            idx = " ".join(str(i + 1) for i in face)
            f.write(f"f {idx}\n")
    print(f"  -> {path}  ({len(vertices)} verts, {len(faces)} faces)")


# ---------------------------------------------------------------------------
# 1. Player Ship - refined fighter with nose cone, swept wings, tail fins
# ---------------------------------------------------------------------------
def gen_player_ship():
    verts = []
    faces = []

    # Nose tip (Z+ direction = forward)
    verts.append((0, 0, 3.5))                      # 0 nose
    # Nose ring
    verts.append((0, 0.35, 1.5))                   # 1 top
    verts.append((0.35, 0, 1.5))                   # 2 right
    verts.append((0, -0.35, 1.5))                  # 3 bottom
    verts.append((-0.35, 0, 1.5))                  # 4 left
    # Mid fuselage ring (wider)
    verts.append((0, 0.5, 0.0))                    # 5 top
    verts.append((0.6, 0, 0.0))                   # 6 right
    verts.append((0, -0.5, 0.0))                   # 7 bottom
    verts.append((-0.6, 0, 0.0))                   # 8 left
    # Wing roots (rear)
    verts.append((0, 0.3, -1.2))                    # 9 top
    verts.append((0.8, 0, -1.2))                   # 10 right root
    verts.append((0, -0.3, -1.2))                  # 11 bottom
    verts.append((-0.8, 0, -1.2))                  # 12 left root
    # Wing tips
    verts.append((2.2, 0, -2.0))                   # 13 right tip
    verts.append((-2.2, 0, -2.0))                  # 14 left tip
    # Tail fins
    verts.append((0, 1.0, -2.0))                   # 15 top fin
    verts.append((0, -0.6, -2.0))                  # 16 bottom fin
    # Engine nozzles
    verts.append((0.35, 0, -2.5))                  # 17 right engine
    verts.append((-0.35, 0, -2.5))                 # 18 left engine

    # Nose cone
    faces.extend([
        (0, 1, 2), (0, 2, 3), (0, 3, 4), (0, 4, 1),
    ])
    # Nose ring -> mid fuselage
    faces.extend([
        (1, 5, 2), (2, 6, 3), (3, 7, 4), (4, 8, 1),
        (1, 2, 5), (2, 3, 6), (3, 4, 7), (4, 1, 8),
    ])
    # Mid fuselage -> wing roots
    faces.extend([
        (5, 9, 6), (6, 10, 7), (7, 11, 8), (8, 12, 5),
        (5, 6, 9), (6, 7, 10), (7, 8, 11), (8, 5, 12),
    ])
    # Right wing
    faces.extend([
        (10, 13, 9),
        (10, 11, 13),
        (9, 13, 11),
    ])
    # Left wing
    faces.extend([
        (12, 14, 9),
        (12, 11, 14),
        (9, 14, 11),
    ])
    # Top tail fin
    faces.extend([
        (9, 15, 12),
        (10, 15, 13),
    ])
    # Bottom tail fin
    faces.extend([
        (11, 16, 10),
        (11, 12, 16),
    ])
    # Engine nozzles
    faces.extend([
        (10, 17, 11),
        (12, 18, 11),
        (10, 12, 17),
        (12, 17, 18),
        (17, 18, 11),
    ])

    write_obj("player_ship.obj", verts, faces)


# ---------------------------------------------------------------------------
# 2. Enemy Ship - aggressive delta-wing fighter
# ---------------------------------------------------------------------------
def gen_enemy_ship():
    verts = []
    faces = []

    # Nose
    verts.append((0, 0.2, 2.5))                   # 0 nose top
    verts.append((0, -0.2, 2.5))                 # 1 nose bottom
    # Mid body
    verts.append((0, 0.5, 0.5))                  # 2 top
    verts.append((0.8, 0, 0.5))                   # 3 right
    verts.append((0, -0.5, 0.5))                  # 4 bottom
    verts.append((-0.8, 0, 0.5))                 # 5 left
    # Rear wide wing base
    verts.append((0, 0.3, -1.0))                 # 6 top
    verts.append((1.8, 0, -1.5))                  # 7 right wing tip
    verts.append((0, -0.3, -1.0))                # 8 bottom
    verts.append((-1.8, 0, -1.5))                # 9 left wing tip
    # Rear center
    verts.append((0, 0, -2.0))                    # 10 rear

    # Nose cone
    faces.extend([
        (0, 2, 3), (0, 3, 4), (0, 4, 5), (0, 5, 2),
        (1, 3, 2), (1, 4, 3), (1, 5, 4), (1, 2, 5),
    ])
    # Body to wing base
    faces.extend([
        (2, 6, 3), (3, 7, 4), (4, 8, 5), (5, 9, 2),
        (2, 3, 6), (3, 4, 7), (4, 5, 8), (5, 2, 9),
    ])
    # Right wing
    faces.extend([
        (6, 7, 8),
        (3, 7, 6),
        (4, 8, 7),
    ])
    # Left wing
    faces.extend([
        (6, 9, 8),
        (2, 9, 6),
        (5, 8, 9),
    ])
    # Rear point
    faces.extend([
        (7, 10, 9),
        (9, 10, 8),
        (8, 10, 7),
    ])

    write_obj("enemy_ship.obj", verts, faces)


# ---------------------------------------------------------------------------
# 3. Bullet - elongated glowing capsule
# ---------------------------------------------------------------------------
def gen_bullet():
    verts = []
    faces = []

    verts.append((0, 0, 1.5))    # 0
    verts.append((0, 0, -1.5))  # 1
    r = 0.18
    verts.extend([(r, 0, 0.5), (0, r, 0.5), (-r, 0, 0.5), (0, -r, 0.5)])
    verts.extend([(r, 0, -0.5), (0, r, -0.5), (-r, 0, -0.5), (0, -r, -0.5)])

    faces = [
        (0, 2, 3), (0, 3, 4), (0, 4, 5), (0, 5, 2),
        (2, 6, 3), (3, 7, 4), (4, 8, 5), (5, 9, 2),
        (2, 3, 6), (3, 4, 7), (4, 5, 8), (5, 2, 9),
        (1, 3, 6), (1, 4, 7), (1, 5, 8), (1, 2, 9),
    ]
    write_obj("bullet.obj", verts, faces)


# ---------------------------------------------------------------------------
# 4. Star - plump 3D five-pointed star
# ---------------------------------------------------------------------------
def gen_star():
    verts = []
    faces = []

    outer_r = 1.0
    inner_r = 0.42
    thickness = 0.3
    points = 5

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
        a = i
        b = (i + 1) % n
        faces.append((a, b, n + b))
        faces.append((a, n + b, n + a))

    write_obj("star.obj", verts, faces)


# ---------------------------------------------------------------------------
# 5. Asteroid - irregular polyhedral rock
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
    print("Generating refined OBJ models...")
    gen_player_ship()
    gen_enemy_ship()
    gen_bullet()
    gen_star()
    gen_asteroid()
    print("Done!")
