import * as THREE from 'three';

/** Lightweight, procedural case desk. Rendered once and again only when resized. */
export function mountEvidenceScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, .1, 100);
  camera.position.set(0, 4.2, 9.6);
  camera.lookAt(0, .3, 0);
  scene.add(new THREE.HemisphereLight(0xe9ddc7, 0x101811, 1.25));
  const key = new THREE.DirectionalLight(0xe8d4a9, 2.6);
  key.position.set(-3.8, 7, 4.8); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5; key.shadow.camera.right = 5;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.bias = -.00025; key.shadow.normalBias = .025;
  scene.add(key);
  const lampGlow = new THREE.PointLight(0xe3bd7d, 4.5, 4.2, 2); lampGlow.position.set(2.45, 1.1, -1.2); scene.add(lampGlow);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(6.7, .24, 4.1), new THREE.MeshStandardMaterial({ color: 0x172019, roughness: .82, metalness: .04 }));
  desk.position.y = -.15; desk.receiveShadow = true; scene.add(desk);
  const deskFront = new THREE.Mesh(new THREE.BoxGeometry(6.7, .09, .055), new THREE.MeshStandardMaterial({ color: 0x303b30, roughness: .78 }));
  deskFront.position.set(0, -.14, 2.05); scene.add(deskFront);
  const folder = new THREE.Group();
  const folderPages = new THREE.Mesh(new THREE.BoxGeometry(2.48, .07, 1.78), new THREE.MeshStandardMaterial({ color: 0xd9cfb8, roughness: .96 }));
  folderPages.position.y = .015; folder.add(folderPages);
  const folderBody = new THREE.Mesh(new THREE.BoxGeometry(2.55, .1, 1.85), new THREE.MeshStandardMaterial({ color: 0x55453a, roughness: .88 }));
  folderBody.position.y = .075; folder.add(folderBody);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(2.55, .04, .26), new THREE.MeshStandardMaterial({ color: 0x725044, roughness: .84 }));
  cover.position.set(0, .145, -.8); folder.add(cover);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.05, .015, 1.25), new THREE.MeshStandardMaterial({ color: 0xd0ad71, metalness: .58, roughness: .38 }));
  band.position.set(.78, .15, .18); folder.add(band);
  folder.position.set(-.45, 0, .12); folder.rotation.y = -.17; scene.add(folder);

  const paperMat = new THREE.MeshStandardMaterial({ color: 0xe2d7bf, roughness: 1 });
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

  const lamp = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0x9b8050, metalness: .58, roughness: .4 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(.31, .36, .09, 32), brass); lampBase.position.y = .025; lamp.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .83, 16), brass); lampStem.position.set(0, .46, 0); lampStem.rotation.z = -.16; lamp.add(lampStem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.18, .39, .36, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x344035, metalness: .22, roughness: .55, side: THREE.DoubleSide }));
  shade.position.set(.12, .86, 0); shade.rotation.z = -.22; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd99b })); bulb.position.set(.12, .68, 0); lamp.add(bulb);
  lamp.position.set(2.35, 0, -1.35); scene.add(lamp);

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object !== desk) object.castShadow = true;
  });

  const resize = () => {
    const width = canvas.clientWidth || 1, height = canvas.clientHeight || 1;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  renderer.render(scene, camera);
  return () => {
    observer.disconnect();
    scene.traverse((item) => { if (item instanceof THREE.Mesh) { item.geometry.dispose(); const materials = Array.isArray(item.material) ? item.material : [item.material]; materials.forEach((material) => material.dispose()); } });
    renderer.dispose();
  };
}
