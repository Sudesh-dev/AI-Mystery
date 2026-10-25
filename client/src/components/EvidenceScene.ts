import * as THREE from 'three';

/** Small procedural 3D case desk; no downloaded model or tracking dependency. */
export function mountEvidenceScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, .1, 100);
  camera.position.set(0, 4.2, 9.6);
  camera.lookAt(0, .3, 0);
  scene.add(new THREE.HemisphereLight(0xf1dfbd, 0x171a20, 2.3));
  const key = new THREE.DirectionalLight(0xf9d28d, 4.4); key.position.set(-3, 7, 4); scene.add(key);
  const rim = new THREE.PointLight(0x6f788c, 14, 12); rim.position.set(3, 3, -3); scene.add(rim);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(6.7, .24, 4.1), new THREE.MeshStandardMaterial({ color: 0x20201d, roughness: .75, metalness: .12 }));
  desk.position.y = -.15; scene.add(desk);
  const folder = new THREE.Group();
  const folderBody = new THREE.Mesh(new THREE.BoxGeometry(2.55, .1, 1.85), new THREE.MeshStandardMaterial({ color: 0x795833, roughness: .86 }));
  folderBody.position.y = .04; folder.add(folderBody);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(2.55, .04, .26), new THREE.MeshStandardMaterial({ color: 0x9a7444, roughness: .8 }));
  cover.position.set(0, .11, -.8); folder.add(cover);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.05, .015, 1.25), new THREE.MeshStandardMaterial({ color: 0xd0ad71, metalness: .58, roughness: .38 }));
  band.position.set(.78, .1, .18); folder.add(band);
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

  let frame = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = () => {
    frame = requestAnimationFrame(animate);
    const t = performance.now() * .0004;
    if (!reduced) { folder.rotation.y = -.17 + Math.sin(t) * .035; ring.position.y = .64 + Math.sin(t * 1.7) * .06; }
    renderer.render(scene, camera);
  };
  const resize = () => {
    const width = canvas.clientWidth || 1, height = canvas.clientHeight || 1;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  animate();
  return () => { cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); scene.traverse((item) => { if (item instanceof THREE.Mesh) { item.geometry.dispose(); const materials = Array.isArray(item.material) ? item.material : [item.material]; materials.forEach((material) => material.dispose()); } }); };
}
