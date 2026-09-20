/* ============================================================
 * Space Defender 3D - Mobile Landscape Edition
 * Max render resolution: 1920x1080 (Android 9 landscape)
 * Touch controls: left joystick move, right fire button
 * ============================================================ */

(function () {
  'use strict';

  // ---------- 常量：安卓9横屏最大渲染尺寸 ----------
  const MAX_RENDER_WIDTH = 1920;
  const MAX_RENDER_HEIGHT = 1080;

  // ---------- 全局状态 ----------
  let scene, camera, renderer;
  let player;
  const objects = { playerShip: null, enemyShip: null, bullet: null, star: null, asteroid: null };

  const bullets = [], enemies = [], stars = [], asteroids = [], explosions = [];
  const stars_bg = [];

  const keys = {};
  let touchMoveX = 0, touchMoveY = 0; // 摇杆输出 -1~1
  let mouseX = 0, mouseY = 0;
  let gameState = 'menu';
  let score = 0, lives = 3, level = 1;
  let shootCooldown = 0, spawnTimer = 0, starSpawnTimer = 0, asteroidSpawnTimer = 0;

  let PLAYER_SPEED = 0.25;
  const BULLET_SPEED = 0.6;
  const ENEMY_SPEED = 0.08;
  let BOUNDS_X = 12;
  let BOUNDS_Y = 7;

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const hud = $('hud');
  const scoreEl = $('score');
  const livesEl = $('lives');
  const levelEl = $('level');
  const joystickZone = $('joystick-zone');
  const joystickKnob = $('joystick-knob');
  const fireBtn = $('fire-btn');

  let isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // ============================================================
  // 初始化
  // ============================================================
  function init() {
    initThree();
    initLights();
    initBackground();
    bindEvents();
    loadModels().then(() => {
      createPlayer();
      animate();
    });
  }

  // 根据当前屏幕尺寸计算渲染分辨率（不超过安卓9横屏上限）
  function getRenderSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // 横屏优先：宽 >= 高
    if (w >= h) {
      // 横屏：限制 1920x1080
      let rw = w, rh = h;
      if (rw > MAX_RENDER_WIDTH) {
        rh = rh * (MAX_RENDER_WIDTH / rw);
        rw = MAX_RENDER_WIDTH;
      }
      if (rh > MAX_RENDER_HEIGHT) {
        rw = rw * (MAX_RENDER_HEIGHT / rh);
        rh = MAX_RENDER_HEIGHT;
      }
      return { w: rw, h: rh };
    } else {
      // 竖屏（理论上会被旋转提示挡住）：限制 1080x1920
      let rw = w, rh = h;
      if (rh > MAX_RENDER_HEIGHT) {
        rw = rw * (MAX_RENDER_HEIGHT / rh);
        rh = MAX_RENDER_HEIGHT;
      }
      if (rw > MAX_RENDER_WIDTH) {
        rh = rh * (MAX_RENDER_WIDTH / rw);
        rw = MAX_RENDER_WIDTH;
      }
      return { w: rw, h: rh };
    }
  }

  function updateGameBounds() {
    // 根据宽高比调整游戏世界边界
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect >= 1.5) {
      // 超宽横屏：加大X边界
      BOUNDS_X = 14;
      BOUNDS_Y = 6;
    } else {
      BOUNDS_X = 10;
      BOUNDS_Y = 7;
    }
  }

  function initThree() {
    const canvas = $('game-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000010, 30, 120);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, -18);
    camera.lookAt(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    applyRendererSize();
  }

  function applyRendererSize() {
    const size = getRenderSize();
    renderer.setSize(size.w, size.h, false);
    // canvas CSS 100% 撑满屏幕，实际渲染分辨率受限
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updateGameBounds();
  }

  function initLights() {
    scene.add(new THREE.AmbientLight(0x404060, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    const p1 = new THREE.PointLight(0x00ffff, 1.5, 50);
    p1.position.set(-10, 5, -5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xff4466, 1.0, 50);
    p2.position.set(10, -5, -5);
    scene.add(p2);
  }

  function initBackground() {
    const geo = new THREE.BufferGeometry();
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = Math.random() * 150;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
    stars_bg.push(new THREE.Points(geo, mat));
    scene.add(stars_bg[0]);
  }

  // ============================================================
  // 加载 OBJ
  // ============================================================
  function loadModels() {
    return new Promise((resolve) => {
      const loader = new THREE.OBJLoader();
      const tasks = [
        ['playerShip', 'models/player_ship.obj', 0x00aaff],
        ['enemyShip', 'models/enemy_ship.obj', 0xff4466],
        ['bullet', 'models/bullet.obj', 0xffff00],
        ['star', 'models/star.obj', 0xffdd00],
        ['asteroid', 'models/asteroid.obj', 0x888888],
      ];
      let loaded = 0;
      tasks.forEach(([key, url, color]) => {
        loader.load(url, (obj) => {
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color, emissive: color, emissiveIntensity: 0.4,
                metalness: 0.3, roughness: 0.5,
              });
            }
          });
          objects[key] = obj;
          if (++loaded === tasks.length) resolve();
        }, undefined, () => { if (++loaded === tasks.length) resolve(); });
      });
    });
  }

  function createPlayer() {
    player = objects.playerShip.clone();
    player.scale.set(1.2, 1.2, 1.2);
    player.position.set(0, 0, -10);
    scene.add(player);
  }

  // ============================================================
  // 生成
  // ============================================================
  function spawnEnemy() {
    const e = objects.enemyShip.clone();
    e.scale.set(1.0 + Math.random() * 0.5, 1.0 + Math.random() * 0.5, 1.0);
    e.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 14, 60 + Math.random() * 20);
    e.rotation.y = Math.PI;
    scene.add(e);
    enemies.push({ mesh: e, speed: ENEMY_SPEED + level * 0.02 + Math.random() * 0.05, drift: (Math.random() - 0.5) * 0.02 });
  }
  function spawnStar() {
    const s = objects.star.clone();
    s.scale.set(0.8, 0.8, 0.8);
    s.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 12, 50 + Math.random() * 15);
    scene.add(s);
    stars.push({ mesh: s, speed: 0.15 });
  }
  function spawnAsteroid() {
    const a = objects.asteroid.clone();
    const s = 0.8 + Math.random() * 1.5;
    a.scale.set(s, s, s);
    a.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 18, 70 + Math.random() * 20);
    a.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    scene.add(a);
    asteroids.push({ mesh: a, speed: 0.05 + Math.random() * 0.1, rotX: (Math.random() - 0.5) * 0.02, rotY: (Math.random() - 0.5) * 0.02 });
  }

  function shoot() {
    if (shootCooldown > 0) return;
    shootCooldown = 10;
    const b = objects.bullet.clone();
    b.scale.set(0.5, 0.5, 0.5);
    b.position.copy(player.position);
    b.position.z += 1.5;
    scene.add(b);
    bullets.push({ mesh: b, speed: BULLET_SPEED });
  }

  function spawnExplosion(position, color) {
    const count = 18;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: color || 0xffaa00, size: 0.3, transparent: true, opacity: 1 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    explosions.push({ points, velocities, life: 25 });
  }

  function dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ============================================================
  // 游戏更新
  // ============================================================
  function update() {
    if (gameState !== 'playing') return;

    // 玩家移动：键盘 + 摇杆
    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my += 1;
    if (keys['KeyS'] || keys['ArrowDown']) my -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    mx += touchMoveX;
    my += touchMoveY;
    // 鼠标瞄准偏移（PC端）
    mx += mouseX; my += mouseY;
    mouseX *= 0.9; mouseY *= 0.9;

    const mag = Math.sqrt(mx * mx + my * my);
    if (mag > 1) { mx /= mag; my /= mag; }

    player.position.x += mx * PLAYER_SPEED;
    player.position.y += my * PLAYER_SPEED;

    player.position.x = Math.max(-BOUNDS_X, Math.min(BOUNDS_X, player.position.x));
    player.position.y = Math.max(-BOUNDS_Y, Math.min(BOUNDS_Y, player.position.y));
    player.rotation.z = -player.position.x * 0.03;
    player.rotation.x = player.position.y * 0.03;

    if (shootCooldown > 0) shootCooldown--;
    if (keys['Space']) shoot();

    spawnTimer--;
    if (spawnTimer <= 0) { spawnEnemy(); spawnTimer = Math.max(30, 90 - level * 8); }
    starSpawnTimer--;
    if (starSpawnTimer <= 0) { spawnStar(); starSpawnTimer = 200 + Math.random() * 150; }
    asteroidSpawnTimer--;
    if (asteroidSpawnTimer <= 0) { spawnAsteroid(); asteroidSpawnTimer = 120 + Math.random() * 100; }

    // 子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].mesh.position.z += bullets[i].speed;
      if (bullets[i].mesh.position.z > 80) { scene.remove(bullets[i].mesh); bullets.splice(i, 1); }
    }

    // 敌人
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.mesh.position.z -= e.speed;
      e.mesh.position.x += e.drift;
      e.mesh.rotation.z += 0.02;
      if (e.mesh.position.z < player.position.z - 5) {
        scene.remove(e.mesh); enemies.splice(i, 1); damagePlayer(); continue;
      }
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (dist(bullets[j].mesh.position, e.mesh.position) < 1.5) {
          scene.remove(bullets[j].mesh); bullets.splice(j, 1);
          scene.remove(e.mesh); enemies.splice(i, 1);
          spawnExplosion(e.mesh.position, 0xff4466);
          score += 100; updateHUD(); break;
        }
      }
      if (dist(player.position, e.mesh.position) < 1.8) {
        scene.remove(e.mesh); enemies.splice(i, 1);
        spawnExplosion(player.position, 0xff0000); damagePlayer();
      }
    }

    // 星星
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.mesh.position.z -= s.speed;
      s.mesh.rotation.y += 0.05; s.mesh.rotation.x += 0.02;
      if (s.mesh.position.z < -20) { scene.remove(s.mesh); stars.splice(i, 1); continue; }
      if (dist(player.position, s.mesh.position) < 2.0) {
        scene.remove(s.mesh); stars.splice(i, 1);
        spawnExplosion(s.mesh.position, 0xffdd00);
        score += 50; updateHUD();
      }
    }

    // 陨石
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.mesh.position.z -= a.speed;
      a.mesh.rotation.x += a.rotX; a.mesh.rotation.y += a.rotY;
      if (a.mesh.position.z < -20) { scene.remove(a.mesh); asteroids.splice(i, 1); continue; }
      if (dist(player.position, a.mesh.position) < 1.5) {
        scene.remove(a.mesh); asteroids.splice(i, 1);
        spawnExplosion(a.mesh.position, 0x888888); damagePlayer();
      }
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (dist(bullets[j].mesh.position, a.mesh.position) < 1.2) {
          scene.remove(bullets[j].mesh); bullets.splice(j, 1); break;
        }
      }
    }

    // 爆炸粒子
    for (let i = explosions.length - 1; i >= 0; i--) {
      const ex = explosions[i];
      ex.life--;
      const pos = ex.points.geometry.attributes.position.array;
      for (let k = 0; k < ex.velocities.length; k++) {
        pos[k * 3] += ex.velocities[k].x;
        pos[k * 3 + 1] += ex.velocities[k].y;
        pos[k * 3 + 2] += ex.velocities[k].z;
      }
      ex.points.geometry.attributes.position.needsUpdate = true;
      ex.points.material.opacity = ex.life / 25;
      if (ex.life <= 0) { scene.remove(ex.points); explosions.splice(i, 1); }
    }

    // 背景星空
    const bg = stars_bg[0];
    const pos = bg.geometry.attributes.position.array;
    for (let k = 0; k < pos.length; k += 3) {
      pos[k + 2] -= 0.3;
      if (pos[k + 2] < -50) pos[k + 2] = 150;
    }
    bg.geometry.attributes.position.needsUpdate = true;

    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) { level = newLevel; updateHUD(); }
  }

  function damagePlayer() {
    lives--;
    updateHUD();
    if (lives <= 0) gameOver();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = '♥'.repeat(Math.max(0, lives)) || '—';
    levelEl.textContent = level;
  }

  // ============================================================
  // 流程
  // ============================================================
  function startGame() {
    [...bullets, ...enemies, ...stars, ...asteroids].forEach(o => scene.remove(o.mesh));
    bullets.length = enemies.length = stars.length = asteroids.length = 0;
    score = 0; lives = 3; level = 1;
    shootCooldown = 0; spawnTimer = 30; starSpawnTimer = 150; asteroidSpawnTimer = 100;
    player.position.set(0, 0, -10);
    updateHUD();
    gameState = 'playing';
    $('start-screen').classList.add('hidden');
    $('gameover-screen').classList.add('hidden');
    $('pause-screen').classList.add('hidden');
    hud.classList.remove('hidden');
    if (isTouchDevice) {
      joystickZone.classList.remove('hidden');
      fireBtn.classList.remove('hidden');
    }
  }

  function gameOver() {
    gameState = 'gameover';
    $('final-score').textContent = score;
    $('final-level').textContent = level;
    $('gameover-screen').classList.remove('hidden');
    hud.classList.add('hidden');
    joystickZone.classList.add('hidden');
    fireBtn.classList.add('hidden');
  }

  function togglePause() {
    if (gameState === 'playing') {
      gameState = 'paused';
      $('pause-screen').classList.remove('hidden');
    } else if (gameState === 'paused') {
      gameState = 'playing';
      $('pause-screen').classList.add('hidden');
    }
  }

  // ============================================================
  // 事件
  // ============================================================
  function bindEvents() {
    window.addEventListener('resize', applyRendererSize);
    window.addEventListener('orientationchange', () => setTimeout(applyRendererSize, 200));

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'KeyP') togglePause();
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // 鼠标（PC端）
    window.addEventListener('mousemove', (e) => {
      if (!isTouchDevice) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      }
    });

    // ----- 虚拟摇杆 -----
    let joystickId = null;
    const ZONE_RADIUS = 50;

    function joystickStart(e) {
      if (joystickId !== null) return;
      const t = e.changedTouches ? e.changedTouches[0] : e;
      joystickId = t.identifier !== undefined ? t.identifier : 'mouse';
      updateJoystick(t.clientX, t.clientY);
    }
    function joystickMove(e) {
      if (joystickId === null) return;
      const touches = e.changedTouches || [e];
      for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === joystickId || (joystickId === 'mouse' && touches[i].type === 'mousemove')) {
          updateJoystick(touches[i].clientX, touches[i].clientY);
          break;
        }
      }
    }
    function joystickEnd(e) {
      joystickId = null;
      touchMoveX = 0; touchMoveY = 0;
      joystickKnob.style.transform = 'translate(0px, 0px)';
    }
    function updateJoystick(cx, cy) {
      const rect = joystickZone.getBoundingClientRect();
      const cx0 = rect.left + rect.width / 2;
      const cy0 = rect.top + rect.height / 2;
      let dx = cx - cx0, dy = cy - cy0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ZONE_RADIUS) {
        dx = dx / dist * ZONE_RADIUS;
        dy = dy / dist * ZONE_RADIUS;
      }
      touchMoveX = dx / ZONE_RADIUS;
      touchMoveY = -dy / ZONE_RADIUS;
      joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    joystickZone.addEventListener('touchstart', (e) => { e.preventDefault(); joystickStart(e); });
    joystickZone.addEventListener('touchmove', (e) => { e.preventDefault(); joystickMove(e); });
    joystickZone.addEventListener('touchend', (e) => { e.preventDefault(); joystickEnd(e); });
    joystickZone.addEventListener('touchcancel', joystickEnd);

    // PC端鼠标也能用摇杆区（测试用）
    joystickZone.addEventListener('mousedown', joystickStart);
    window.addEventListener('mousemove', joystickMove);
    window.addEventListener('mouseup', joystickEnd);

    // ----- 射击按钮 -----
    function fireStart(e) { e.preventDefault(); keys['Space'] = true; }
    function fireEnd(e) { e.preventDefault(); keys['Space'] = false; }
    fireBtn.addEventListener('touchstart', fireStart);
    fireBtn.addEventListener('touchend', fireEnd);
    fireBtn.addEventListener('touchcancel', fireEnd);
    fireBtn.addEventListener('mousedown', fireStart);
    fireBtn.addEventListener('mouseup', fireEnd);

    // 暂停界面点击继续
    $('pause-screen').addEventListener('click', togglePause);

    $('start-btn').addEventListener('click', startGame);
    $('restart-btn').addEventListener('click', startGame);

    // 禁止双击缩放
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch < 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }

  // ============================================================
  function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
  }

  window.addEventListener('load', init);
})();
