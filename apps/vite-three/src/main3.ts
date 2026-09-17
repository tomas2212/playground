import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ======================
// RENDERER / SCENE
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000006)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000)
camera.position.set(3.5, 2.2, 8.5)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enabled = false

// ======================
// LIGHTS
// ======================
scene.add(new THREE.AmbientLight(0x404040, 0.6))

const sun = new THREE.DirectionalLight(0xffffff, 1.4)
sun.position.set(10, 20, 10)
scene.add(sun)

// ======================
// TEXTURES (EARTH-LIKE)
// ======================
const loader = new THREE.TextureLoader()

const earthTexture = loader.load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
)
const earthNormal = loader.load(
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
)

// ======================
// PLANET
// ======================
const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 64, 64),
    new THREE.MeshStandardMaterial({
        map: earthTexture,
        normalMap: earthNormal,
        roughness: 0.8,
        metalness: 0.05
    })
)
scene.add(planet)

// ======================
// MOONS
// ======================
const moonGeo = new THREE.SphereGeometry(0.22, 32, 32)

const moon1 = new THREE.Mesh(
    moonGeo,
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
)
const moon2 = new THREE.Mesh(
    moonGeo,
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
)
scene.add(moon1, moon2)

// ======================
// TRAIL SYSTEM (LINE BUFFER)
// ======================
function createTrail(maxPoints: number, colored = false) {
    const positions = new Float32Array(maxPoints * 3)
    const colors = colored ? new Float32Array(maxPoints * 3) : undefined

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.LineBasicMaterial({
        color: colored ? 0xffffff : 0xffffff,
        vertexColors: !!colors,
        transparent: true,
        opacity: 0.85
    })

    const line = new THREE.Line(geometry, material)
    scene.add(line)

    let index = 0

    return {
        update(pos: THREE.Vector3, color?: THREE.Color) {
            positions[index * 3] = pos.x
            positions[index * 3 + 1] = pos.y
            positions[index * 3 + 2] = pos.z

            if (colors && color) {
                colors[index * 3] = color.r
                colors[index * 3 + 1] = color.g
                colors[index * 3 + 2] = color.b
            }

            index = (index + 1) % maxPoints
            geometry.attributes.position.needsUpdate = true
            if (colors) geometry.attributes.color.needsUpdate = true
        }
    }
}

// trails
const planetTrail = createTrail(1500, true)
const moon1Trail = createTrail(1200)
const moon2Trail = createTrail(1200)

// ======================
// MOTION PARAMETERS
// ======================
const direction = new THREE.Vector3(
    Math.sin(THREE.MathUtils.degToRad(10)),
    0,
    1
).normalize()

const speed = 2.0
const startZ = -60
planet.position.copy(direction).multiplyScalar(startZ)

const moon1Orbit = { r: 2.2, speed: 1.5, y: 0.35 }
const moon2Orbit = { r: 3.1, speed: 0.9, y: -0.55 }

// ======================
// LOOP
// ======================
const clock = new THREE.Clock()

function animate() {
    const t = clock.getElapsedTime()
    const dt = clock.getDelta()

    // PLANET TRANSLATION
    planet.position.addScaledVector(direction, speed * dt)

    // PLANET ROTATION (Earth-like)
    planet.rotation.y += 0.35 * dt

    // MOON 1
    moon1.position.set(
        planet.position.x + Math.cos(t * moon1Orbit.speed) * moon1Orbit.r,
        planet.position.y + moon1Orbit.y,
        planet.position.z + Math.sin(t * moon1Orbit.speed) * moon1Orbit.r
    )

    // MOON 2
    moon2.position.set(
        planet.position.x + Math.cos(t * moon2Orbit.speed + 1.4) * moon2Orbit.r,
        planet.position.y + Math.sin(t * moon2Orbit.speed) * 0.25 + moon2Orbit.y,
        planet.position.z + Math.sin(t * moon2Orbit.speed + 1.4) * moon2Orbit.r
    )

    // TRAILS
    const planetColor = new THREE.Color().setHSL((t * 0.08) % 1, 1, 0.6)
    planetTrail.update(planet.position, planetColor)
    moon1Trail.update(moon1.position)
    moon2Trail.update(moon2.position)

    // RESET
    if (planet.position.z > camera.position.z + 6) {
        planet.position.copy(direction).multiplyScalar(startZ)
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()

// ======================
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})
