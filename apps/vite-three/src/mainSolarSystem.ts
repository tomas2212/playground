import * as THREE from 'three'

// ==========================
// BASIC SETUP
// ==========================
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.set(0, 15, 55)
camera.lookAt(0, 0, 0)

// ==========================
// LIGHT
// ==========================
scene.add(new THREE.AmbientLight(0x404040, 0.6))

const sunLight = new THREE.PointLight(0xffffff, 2.5, 0)
scene.add(sunLight)

// ==========================
// SCALE (HYBRID)
// ==========================
const DISTANCE_SCALE = 1 / 10      // zmenšené vzdialenosti
const SIZE_SCALE = 1 / 2           // zväčšené planéty

// ==========================
// SOLAR SYSTEM DATA
// ==========================
type BodyDef = {
    name: string
    radius: number
    orbit: number
    speed: number
    color: number
}

const bodies: BodyDef[] = [
    { name: 'Mercury', radius: 0.38, orbit: 5.8, speed: 4.15, color: 0xb1b1b1 },
    { name: 'Venus',   radius: 0.95, orbit: 10.8, speed: 1.62, color: 0xeeddaa },
    { name: 'Earth',   radius: 1.0,  orbit: 15.0, speed: 1.0,  color: 0x3366ff },
    { name: 'Mars',    radius: 0.53, orbit: 22.8, speed: 0.53, color: 0xff5533 },
    { name: 'Jupiter', radius: 11.2, orbit: 78.0, speed: 0.084, color: 0xffcc88 },
    { name: 'Saturn',  radius: 9.4,  orbit: 143.0,speed: 0.034, color: 0xffddaa },
    { name: 'Uranus',  radius: 4.0,  orbit: 287.0,speed: 0.012, color: 0x88ccff },
    { name: 'Neptune', radius: 3.9,  orbit: 450.0,speed: 0.006, color: 0x4466ff },
    { name: 'Pluto',   radius: 0.18, orbit: 590.0,speed: 0.004, color: 0xffffff }
]

// ==========================
// TRAIL FACTORY (NO FADE)
// ==========================
function createTrail(color: number) {
    const points: THREE.Vector3[] = []
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({ color })
    const line = new THREE.Line(geometry, material)
    scene.add(line)

    return {
        add(pos: THREE.Vector3) {
            points.push(pos.clone())
            geometry.setFromPoints(points)
        }
    }
}

// ==========================
// SUN
// ==========================
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.5 * SIZE_SCALE, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffaa })
)
scene.add(sun)
sunLight.position.copy(sun.position)

const sunTrail = createTrail(0xffffaa)

// ==========================
// PLANETS
// ==========================
const planets = bodies.map(body => {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(body.radius * SIZE_SCALE, 32, 32),
        new THREE.MeshStandardMaterial({ color: body.color })
    )
    scene.add(mesh)

    return {
        def: body,
        mesh,
        trail: createTrail(body.color)
    }
})

// ==========================
// INERTIAL MOTION
// ==========================
const solarVelocity = new THREE.Vector3(0.6, 0, 1.2).normalize().multiplyScalar(0.6)
const clock = new THREE.Clock()

// ==========================
// LOOP
// ==========================
function animate() {
    const t = clock.getElapsedTime()
    const dt = clock.getDelta()

    // SUN MOVES THROUGH SPACE
    sun.position.addScaledVector(solarVelocity, dt)
    sunLight.position.copy(sun.position)
    sunTrail.add(sun.position)

    // PLANETS ORBIT MOVING SUN
    planets.forEach(p => {
        const angle = t * p.def.speed
        const r = p.def.orbit * DISTANCE_SCALE

        const localPos = new THREE.Vector3(
            Math.cos(angle) * r,
            0,
            Math.sin(angle) * r
        )

        p.mesh.position.copy(sun.position).add(localPos)
        p.mesh.rotation.y += 0.01

        p.trail.add(p.mesh.position)
    })

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()

// ==========================
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})
