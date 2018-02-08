// Using the three.js library
  // Copied most of the code
  // https://threejs.org/docs/
  // http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/

// >> Variables
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()


// >> Functions
 // Creates get's repeated
const animate = function () {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

const draw = {}

// Draws the initial scene
draw.setup = function () {
    const geometry = new THREE.SphereBufferGeometry(5, 32, 32)
    const material = new THREE.MeshPhongMaterial()
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)
    const light = new THREE.DirectionalLight( 0xffffff )
    light.position.set( 0, 1, 1 ).normalize()
    scene.add(light)
}


// >> Actions
// > Setup
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
draw.setup()
camera.position.z = 25
animate()
