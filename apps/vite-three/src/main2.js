import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.createElement('canvas');
document.body.style.margin = 0;
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 4, 12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// lights
scene.add(new THREE.AmbientLight(0x444444));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(5, 10, 7);
scene.add(dir);

// planet
const planetMat = new THREE.MeshStandardMaterial({color:0x2277ff, metalness:0.1, roughness:0.8});
const planet = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 48), planetMat);
scene.add(planet);

// moons
const moonMat1 = new THREE.MeshStandardMaterial({color:0xcccccc});
const moonMat2 = new THREE.MeshStandardMaterial({color:0xffcc88});
const moon1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), moonMat1);
const moon2 = new THREE.Mesh(new THREE.SphereGeometry(0.33, 32, 32), moonMat2);
scene.add(moon1, moon2);

// optional orbit lines
const makeOrbit = r => {
    const geo = new THREE.BufferGeometry().setFromPoints(
        Array.from({length:128}, (_,i)=> {
            const a = (i/128)*Math.PI*2;
            return new THREE.Vector3(Math.cos(a)*r, 0, Math.sin(a)*r);
        })
    );
    const mat = new THREE.LineBasicMaterial({color:0x333333});
    const line = new THREE.LineLoop(geo, mat);
    line.rotation.x = Math.PI/2;
    return line;
};
scene.add(makeOrbit(2.0), makeOrbit(3.2));

// resize handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
});

let t = 0;
function animate(time) {
    requestAnimationFrame(animate);
    t = time * 0.001;

    // Planet movement along a smooth path
    planet.position.x = Math.sin(t * 0.2) * 6;
    planet.position.y = Math.sin(t * 0.07) * 0.6;

    // moon orbits relative to planet
    const r1 = 2.0, r2 = 3.2;
    const s1 = 1.7, s2 = 0.95;
    moon1.position.copy(planet.position).add(new THREE.Vector3(Math.cos(t*s1)*r1, Math.sin(t*s1)*0.2, Math.sin(t*s1)*r1*0.5));
    moon2.position.copy(planet.position).add(new THREE.Vector3(Math.cos(t*s2 + 1.2)*r2, Math.sin(t*s2 + 0.5)*0.35, Math.sin(t*s2 + 1.2)*r2*0.2));

    planet.rotation.y += 0.008;

    controls.update();
    renderer.render(scene, camera);
}
animate(0);