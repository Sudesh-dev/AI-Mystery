import * as THREE from 'three';

/** Small procedural 3D case desk; no downloaded model or tracking dependency. */
export function mountEvidenceScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, .1, 100);
  camera.position.set(0, 4.2, 9.6);
  camera.lookAt(0, .3, 0);
  scene.add(new THREE.HemisphereLight(0xe9ddc7, 0x111820, 1.55));
  const key = new THREE.DirectionalLight(0xf5d49a, 3.2);
  key.position.set(-3.8, 7, 4.8); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5; key.shadow.camera.right = 5;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.bias = -.00025; key.shadow.normalBias = .025;
  scene.add(key);
  const rim = new THREE.PointLight(0x78909a, 8, 11); rim.position.set(3, 3, -3); scene.add(rim);
  const lampGlow = new THREE.PointLight(0xeab86f, 11, 4.2, 2); lampGlow.position.set(2.05, 1.35, -1.05); scene.add(lampGlow);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(6.7, .24, 4.1), new THREE.MeshStandardMaterial({ color: 0x20201d, roughness: .75, metalness: .12 }));
  desk.position.y = -.15; desk.receiveShadow = true; scene.add(desk);
  const deskFront = new THREE.Mesh(new THREE.BoxGeometry(6.7, .09, .055), new THREE.MeshStandardMaterial({ color: 0x503a28, roughness: .72 }));
  deskFront.position.set(0, -.14, 2.05); scene.add(deskFront);
  const folder = new THREE.Group();
  const folderPages = new THREE.Mesh(new THREE.BoxGeometry(2.48, .07, 1.78), new THREE.MeshStandardMaterial({ color: 0xc9bda6, roughness: .96 }));
  folderPages.position.y = .015; folder.add(folderPages);
  const folderBody = new THREE.Mesh(new THREE.BoxGeometry(2.55, .1, 1.85), new THREE.MeshStandardMaterial({ color: 0x795833, roughness: .86 }));
  folderBody.position.y = .075; folder.add(folderBody);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(2.55, .04, .26), new THREE.MeshStandardMaterial({ color: 0x9a7444, roughness: .8 }));
  cover.position.set(0, .145, -.8); folder.add(cover);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.05, .015, 1.25), new THREE.MeshStandardMaterial({ color: 0xd0ad71, metalness: .58, roughness: .38 }));
  band.position.set(.78, .15, .18); folder.add(band);
  folder.position.set(-.45, 0, .12); folder.rotation.y = -.17; scene.add(folder);

  const paperMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb7, roughness: 1 });
  const page = new THREE.Mesh(new THREE.BoxGeometry(1.35, .025, 1.67), paperMat); page.position.set(1.15, .015, -.35); page.rotation.y = .15; scene.add(page);
  const lines = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(.9 - (i % 2) * .15, .009, .012), new THREE.MeshBasicMaterial({ color: 0x9c988e }));
    line.position.set(1.12, .037, -.88 + i * .17); lines.add(line);
  }
  scene.add(lines);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(.69, .07, 14, 68), new THREE.MeshStandardMaterial({ color: 0xb88e53, metalness: .82, roughness: .25 }));
  ring.position.set(-1.9, .64, -.48); ring.rotation.x = Math.PI / 2.25; scene.add(ring);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.57, .57, .09, 48), new THREE.MeshPhysicalMaterial({ color: 0x253446, transmission: .72, transparent: true, opacity: .68, roughness: .08, metalness: .1 }));
  lens.position.set(-1.9, .64, -.48); lens.rotation.x = Math.PI / 2.25; scene.add(lens);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.075, .095, 1.05, 16), new THREE.MeshStandardMaterial({ color: 0x604729, metalness: .45, roughness: .34 }));
  handle.position.set(-2.38, .33, .07); handle.rotation.z = -.8; scene.add(handle);

  const pin = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 20), new THREE.MeshStandardMaterial({ color: 0x9b4d37, metalness: .25, roughness: .4 }));
  pin.position.set(.58, .42, .67); scene.add(pin);
  const card = new THREE.Mesh(new THREE.BoxGeometry(.65, .045, .45), new THREE.MeshStandardMaterial({ color: 0xddd0b6, roughness: .8 }));
  card.position.set(-2.5, .07, 1.1); card.rotation.y = .3; scene.add(card);

  const lamp = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0x977344, metalness: .72, roughness: .3 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(.31, .36, .09, 32), brass); lampBase.position.y = .025; lamp.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .83, 16), brass); lampStem.position.set(0, .46, 0); lampStem.rotation.z = -.16; lamp.add(lampStem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.18, .39, .36, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x33403d, metalness: .32, roughness: .42, side: THREE.DoubleSide }));
  shade.position.set(.12, .86, 0); shade.rotation.z = -.22; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd99b })); bulb.position.set(.12, .68, 0); lamp.add(bulb);
  lamp.position.set(2.35, 0, -1.35); scene.add(lamp);

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object !== desk) object.castShadow = true;
  });

  let frame = 0;
  let inView = true;
  let disposed = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render = (now: number) => {
    if (disposed) return;
    const t = now * .0004;
    if (!reduced) {
      folder.rotation.y = -.17 + Math.sin(t) * .012;
      ring.position.y = .64 + Math.sin(t * 1.7) * .025;
      lampGlow.intensity = 10.5 + Math.sin(t * 2.2) * .45;
    }
    renderer.render(scene, camera);
    if (!reduced && inView && !document.hidden) frame = requestAnimationFrame(render);
  };
  const start = () => { if (!reduced && inView && !document.hidden && !frame && !disposed) frame = requestAnimationFrame(render); };
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
  const resize = () => {
    const width = canvas.clientWidth || 1, height = canvas.clientHeight || 1;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => { inView = Boolean(entry?.isIntersecting); if (inView) start(); else stop(); });
  visibilityObserver.observe(canvas);
  const onVisibilityChange = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener('visibilitychange', onVisibilityChange);
  renderer.render(scene, camera);
  start();
  return () => {
    disposed = true; stop(); observer.disconnect(); visibilityObserver.disconnect(); document.removeEventListener('visibilitychange', onVisibilityChange);
    scene.traverse((item) => { if (item instanceof THREE.Mesh) { item.geometry.dispose(); const materials = Array.isArray(item.material) ? item.material : [item.material]; materials.forEach((material) => material.dispose()); } });
    renderer.dispose();
  };
}
