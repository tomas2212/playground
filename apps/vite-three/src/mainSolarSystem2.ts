import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Vite usage:
 * - npm i three
 * - put this file as /src/mainSolarsystem.ts
 * - index.html loads: <script type="module" src="/src/mainSolarsystem.ts"></script>
 */

const app = document.getElementById("app");
if (!app) throw new Error("#app not found");

// ----- Renderer -----
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05060a, 1);
app.appendChild(renderer.domElement);

// ----- Scene & Camera -----
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(0, 55, 140);

// Orbit controls (mouse)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 20;
controls.maxDistance = 500;

// ----- Lights -----
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const sunLight = new THREE.PointLight(0xffeeaa, 2.2, 1000, 1.2);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// ----- Starfield -----
function addStars(count = 2500, radius = 900) {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        // random points in sphere-ish
        const r = radius * (0.3 + 0.7 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi);
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.7,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
    });

    const stars = new THREE.Points(geom, mat);
    scene.add(stars);
}
addStars();

// ----- Helpers -----
const TAU = Math.PI * 2;

function makeSphere(radius: number, color: number, emissive?: number) {
    const geom = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.05,
        emissive: emissive ?? 0x000000,
        emissiveIntensity: emissive ? 0.75 : 0,
    });
    return new THREE.Mesh(geom, mat);
}

function makeOrbitLine(a: number, b: number, tiltRad: number, color = 0x334455) {
    // draw ellipse in XZ plane, then tilt around X axis (so it looks 3D)
    const segments = 256;
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * TAU;
        const x = a * Math.cos(t);
        const z = b * Math.sin(t);
        points.push(new THREE.Vector3(x, 0, z));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    geom.rotateX(tiltRad);

    const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
    });

    return new THREE.LineLoop(geom, mat);
}

/**
 * A simple trail that stores last N points and renders as a Line.
 * We keep it in local space of the scene.
 */
class Trail {
    private maxPoints: number;
    private geom: THREE.BufferGeometry;
    private mat: THREE.LineBasicMaterial;
    private line: THREE.Line;
    private positions: Float32Array;
    private cursor = 0;
    private filled = false;

    constructor(maxPoints: number, color: number, opacity = 0.65) {
        this.maxPoints = maxPoints;
        this.positions = new Float32Array(maxPoints * 3);

        this.geom = new THREE.BufferGeometry();
        this.geom.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));

        this.mat = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
        });

        this.line = new THREE.Line(this.geom, this.mat);
        this.line.frustumCulled = false;
    }

    get object3d() {
        return this.line;
    }

    addPoint(p: THREE.Vector3) {
        const i = this.cursor * 3;
        this.positions[i + 0] = p.x;
        this.positions[i + 1] = p.y;
        this.positions[i + 2] = p.z;

        this.cursor++;
        if (this.cursor >= this.maxPoints) {
            this.cursor = 0;
            this.filled = true;
        }

        // Update draw range so the line doesn't connect uninitialized points.
        const drawCount = this.filled ? this.maxPoints : this.cursor;
        this.geom.setDrawRange(0, Math.max(drawCount, 2));
        (this.geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
}

// ----- Solar system objects -----

// Sun
const sun = makeSphere(6.8, 0xffcc33, 0xffa000);
scene.add(sun);

// glow-ish sprite (cheap)
const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
        color: 0xffcc55,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
    })
);
sunGlow.scale.set(35, 35, 1);
scene.add(sunGlow);

// A “planet system” entry
type Body = {
    name: string;
    mesh: THREE.Mesh;
    a: number; // semi-major axis
    b: number; // semi-minor axis
    speed: number; // angular speed factor
    size: number;
    tilt: number; // orbit tilt (radians)
    phase: number; // start angle
    trail: Trail;
};

const bodies: Body[] = [];

// Distances are stylized (not to scale) to look good.
const defs = [
    { name: "Mercury", color: 0x9aa0a6, size: 0.8, a: 12, b: 10.5, speed: 1.55, tilt: 0.05, phase: 0.4 },
    { name: "Venus",   color: 0xe6c27a, size: 1.2, a: 17, b: 15.3, speed: 1.22, tilt: 0.02, phase: 1.1 },
    { name: "Earth",   color: 0x3b82f6, size: 1.3, a: 22, b: 20.8, speed: 1.00, tilt: 0.06, phase: 2.4 },
    { name: "Mars",    color: 0xf87171, size: 1.0, a: 28, b: 26.2, speed: 0.83, tilt: 0.04, phase: 0.9 },
    { name: "Jupiter", color: 0xd6a77a, size: 3.3, a: 38, b: 36.0, speed: 0.43, tilt: 0.03, phase: 1.9 },
    { name: "Saturn",  color: 0xf2e2b6, size: 2.9, a: 50, b: 46.5, speed: 0.34, tilt: 0.07, phase: 2.9 },
    { name: "Uranus",  color: 0x7dd3fc, size: 2.2, a: 62, b: 58.0, speed: 0.24, tilt: 0.05, phase: 0.2 },
    { name: "Neptune", color: 0x2563eb, size: 2.1, a: 74, b: 69.5, speed: 0.19, tilt: 0.08, phase: 1.6 },
    { name: "Pluto",   color: 0xcbd5e1, size: 0.65, a: 86, b: 78.0, speed: 0.14, tilt: 0.12, phase: 2.2 },
];

for (const d of defs) {
    const mesh = makeSphere(d.size, d.color);
    scene.add(mesh);

    // static orbit line
    const orbitLine = makeOrbitLine(d.a, d.b, d.tilt, 0x2b3a55);
    scene.add(orbitLine);

    // dynamic trail
    const trail = new Trail(320, d.color, 0.55);
    scene.add(trail.object3d);

    bodies.push({
        name: d.name,
        mesh,
        a: d.a,
        b: d.b,
        speed: d.speed,
        size: d.size,
        tilt: d.tilt,
        phase: d.phase,
        trail,
    });
}

// Saturn ring (simple)
const saturn = bodies.find(b => b.name === "Saturn");
if (saturn) {
    const ringGeom = new THREE.RingGeometry(3.4, 5.6, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xd9caa0,
        roughness: 0.8,
        metalness: 0.05,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = 0.35;
    saturn.mesh.add(ring);
}

// Earth's moon (optional mini detail)
const earth = bodies.find(b => b.name === "Earth");
let moon: THREE.Mesh | null = null;
let moonAngle = 0;
if (earth) {
    moon = makeSphere(0.35, 0xd1d5db);
    scene.add(moon);
}

// ----- Animation -----
const clock = new THREE.Clock();
let camAngle = 0;

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Spin sun slowly
    sun.rotation.y += 0.002;

    // Planets
    for (const b of bodies) {
        // Angular position
        const ang = (t * 0.35 * b.speed) + b.phase;

        // Ellipse position in XZ
        const x = b.a * Math.cos(ang);
        const z = b.b * Math.sin(ang);

        // Apply orbit tilt by rotating around X axis
        const y = 0;
        const pos = new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(1, 0, 0), b.tilt);

        b.mesh.position.copy(pos);

        // Self rotation
        b.mesh.rotation.y += 0.01;

        // Trail point (less often so it looks nicer)
        // add point at ~30fps equivalent
        if (Math.floor(t * 30) !== Math.floor((t - clock.getDelta()) * 30)) {
            b.trail.addPoint(pos);
        }
    }

    // Moon orbit around earth
    if (earth && moon) {
        moonAngle += 0.03;
        const r = 2.4;
        const mx = earth.mesh.position.x + r * Math.cos(moonAngle);
        const mz = earth.mesh.position.z + r * Math.sin(moonAngle);
        const my = earth.mesh.position.y + 0.25 * Math.sin(moonAngle * 1.3);
        moon.position.set(mx, my, mz);
    }

    // Camera slow orbit around origin (gives that “moving through space” vibe)
    camAngle += 0.0015;
    const camR = 150;
    const camX = camR * Math.cos(camAngle);
    const camZ = camR * Math.sin(camAngle);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, 0.01);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, 0.01);
    camera.lookAt(0, 0, 0);

    controls.update();
    renderer.render(scene, camera);
}
animate();

// ----- Resize -----
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
