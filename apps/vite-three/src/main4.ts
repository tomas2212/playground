import * as THREE from 'three'

// ======================
// RENDERER / SCENE
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 4000)

// ======================
// LIGHTS
// ======================
scene.add(new THREE.AmbientLight(0x303030, 0.6))

const sunLight = new THREE.DirectionalLight(0xffffff, 1.4)
sunLight.position.set(15, 20, 10)
scene.add(sunLight)

// ======================
// TEXTURES
// ======================
const loader = new THREE.TextureLoader()

const earthMap = loader.load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
)
const earthNormal = loader.load(
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
)

// ======================
// PLANET
// ======================
const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 64, 64),
    new THREE.MeshStandardMaterial({
        map: earthMap,
        normalMap: earthNormal,
        roughness: 0.75,
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
    new THREE.MeshStandardMaterial({ color: 0xe5e5e5 })
)
const moon2 = new THREE.Mesh(
    moonGeo,
    new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
)

scene.add(moon1, moon2)

// ======================
// TRAILS
// ======================
function createTrail(max: number, colored = false) {
    const pos = new Float32Array(max * 3)
    const col = colored ? new Float32Array(max * 3) : undefined

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3))

    const mat = new THREE.LineBasicMaterial({
        vertexColors: !!col,
        transparent: true,
        opacity: 0.85
    })

    const line = new THREE.Line(geo, mat)
    scene.add(line)

    let i = 0

    return {
        update(v: THREE.Vector3, c?: THREE.Color) {
            pos[i * 3] = v.x
            pos[i * 3 + 1] = v.y
            pos[i * 3 + 2] = v.z

            if (col && c) {
                col[i * 3] = c.r
                col[i * 3 + 1] = c.g
                col[i * 3 + 2] = c.b
            }

            i = (i + 1) % max
            geo.attributes.position.needsUpdate = true
            if (col) geo.attributes.color.needsUpdate = true
        }
    }
}

const planetTrail = createTrail(2000, true)
const moon1Trail = createTrail(1600)
const moon2Trail = createTrail(1600)

// ======================
// MOTION SETUP
// ======================
const direction = new THREE.Vector3(
    Math.sin(THREE.MathUtils.degToRad(10)),
    0,
    1
).normalize()

planet.position.copy(direction).multiplyScalar(-80)

const speed = 2.2

const moon1Orbit = { r: 2.4, speed: 1.6, y: 0.35 }
const moon2Orbit = { r: 3.4, speed: 0.9, y: -0.6 }

// ======================
// CINEMATIC CAMERA
// ======================
const camOffset = new THREE.Vector3(3.8, 2.4, -7.5)

// ======================
// LOOP
// ======================
const clock = new THREE.Clock()

function animate() {
    const t = clock.getElapsedTime()
    const dt = clock.getDelta()

    // PLANET MOVE
    planet.position.addScaledVector(direction, speed * dt)
    planet.rotation.y += 0.35 * dt

    // MOONS
    moon1.position.set(
        planet.position.x + Math.cos(t * moon1Orbit.speed) * moon1Orbit.r,
        planet.position.y + moon1Orbit.y,
        planet.position.z + Math.sin(t * moon1Orbit.speed) * moon1Orbit.r
    )

    moon2.position.set(
        planet.position.x + Math.cos(t * moon2Orbit.speed + 1.2) * moon2Orbit.r,
        planet.position.y + Math.sin(t * moon2Orbit.speed) * 0.25 + moon2Orbit.y,
        planet.position.z + Math.sin(t * moon2Orbit.speed + 1.2) * moon2Orbit.r
    )

    // TRAILS
    const color = new THREE.Color().setHSL((t * 0.08) % 1, 1, 0.6)
    planetTrail.update(planet.position, color)
    moon1Trail.update(moon1.position)
    moon2Trail.update(moon2.position)

    // CINEMATIC CAMERA MOTION
    const camWave = Math.sin(t * 0.3) * 0.6
    const desiredCamPos = planet.position.clone()
        .add(camOffset)
        .add(new THREE.Vector3(camWave, Math.sin(t * 0.2) * 0.3, 0))

    camera.position.lerp(desiredCamPos, 0.05)
    camera.lookAt(planet.position)

    // RESET LOOP
    if (planet.position.z > camera.position.z + 12) {
        planet.position.copy(direction).multiplyScalar(-80)
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
