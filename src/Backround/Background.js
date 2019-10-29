
import * as THREE from 'three'
import CONFIG from './config'





// RENDERER SCENE ///////////////////////////////////////////////////

let scene
let canvasWrapper, renderer, composer 

function initScene() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(CONFIG.colorBack)
    scene.fog = new THREE.Fog(scene.background, 50, 800)
}


function initRenderer(wrapper) {
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    canvasWrapper = wrapper ? wrapper : document.querySelector('.canvas-wrapper')
    renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight)
    canvasWrapper.appendChild(renderer.domElement)
}


function initPostProcess() {
    const renderPass = new THREE.RenderPass(scene, camera)    
    var effectVignette = new THREE.ShaderPass( THREE.VignetteShader );
    effectVignette.uniforms[ "offset" ].value = 1.0;
    effectVignette.uniforms[ "darkness" ].value = 1.3;

    composer = new THREE.EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(effectVignette)
}

function renderPostProcess() {
    renderer.render(scene, camera)
}

function rendererResize() {
    renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight)
    if (composer) {
        composer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight)
    }
}


// CAMERA ///////////////////////////////////////////////////////////

let camera, groupCamera

function createCamera() {
    camera = new THREE.PerspectiveCamera(40, canvasWrapper.offsetWidth / canvasWrapper.offsetHeight, 1, 1000 )
    camera.position.set(0, 0, 400)
    camera.lookAt( new THREE.Vector3(0, 0, 0) )
    
    groupCamera = new THREE.Group()
    groupCamera.add(camera)
    scene.add(groupCamera)
} 

function updateCamera() {
    groupCamera.rotation.x = Math.cos(count * 0.2) * 0.6
}

function cameraResize() {
    camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight
    camera.updateProjectionMatrix()
}



// LIGHT ////////////////////////////////////////////////////////////

let pointLight, pointLight2

function addLight() {
    const ambient = new THREE.AmbientLight(CONFIG.ambientColor, 1.0)
    scene.add(ambient)

    pointLight = new THREE.PointLight(CONFIG.pointLightColor, 0.8 )
    pointLight.position.set(0, 300, -500)
    scene.add(pointLight)

    pointLight2 = new THREE.PointLight(CONFIG.pointLightColor, 0.8 )
    pointLight2.position.set(0, -300, -500)
    scene.add(pointLight2)
}

function updateLight(time, count) {
    pointLight.position.x = 400 * Math.cos(count)
    pointLight2.position.x = 400 * Math.cos(count)
}



// SURFACE //////////////////////////////////////////////////////////

var surface
var surfaceArray = [];
var plane;

function createPlane() {
    plane = new THREE.PlaneGeometry(1000, 1000, 20, 20)
    for (var i = 0; i < plane.vertices.length; i++) {
        var value = Math.random()*20 - 10
        plane.vertices[i].z = value
        surfaceArray.push(value)
    }
    plane.computeVertexNormals()
    plane.computeFaceNormals()

    var materials = [
        new THREE.MeshPhongMaterial({ 
            color: CONFIG.surfaceColor, 
            specular: CONFIG.surfaceSpecularColor, 
            flatShading: true, 
            side: THREE.DoubleSide,
        }),
        new THREE.MeshBasicMaterial({ 
            color: CONFIG.surfaceSpecularColor, 
            flatShading: true, 
            wireframe: true, 
            transparent: true,
        }),
    ]

    surface = new THREE.Group()
    for ( var i = 0, l = materials.length; i < l; i ++ ) {
        surface.add(new THREE.Mesh( plane, materials[ i ] ))
    }

    surface.rotation.x = -Math.PI/2
    scene.add( surface )

    // particles
    var particleMaterial = new THREE.PointsMaterial( { color: 0x9999ff, size: 4 } );
    var particles = new THREE.Points( plane, particleMaterial);

    surface.add( particles );
}

function updatePlane(time, count) {
    for (var i = 0; i < plane.vertices.length; i++) {
        plane.vertices[i].z = Math.sin((time / 200) + (plane.vertices[i].x) / 50 - i) * (surfaceArray[i] + Math.cos(count))
    }
    plane.verticesNeedUpdate = true
    surface.rotation.z += 0.0015
} 


// REAIZE / UPDATE //////////////////////////////////////////////////

let delta, time, oldTime, count = 0

function animate() {
    requestAnimationFrame(animate)

    time = Date.now()
    delta = time - oldTime
    if (isNaN(delta) || delta > 1000 || delta == 0 ) {
        delta = 1000/60
    }
    count += delta*0.001

    updateLight(time, count)
    updatePlane(time, count)
    updateCamera(time, count)
    renderPostProcess()
}

function addWindowResize() {
    window.addEventListener('resize', function() {
        rendererResize()
        cameraResize()
    })
}


// INIT /////////////////////////////////////////////////////////////
 
export default function initBackground(wrapper) {
    initScene()
    initRenderer(wrapper)
    createCamera()
    addWindowResize()
    addLight()
    createPlane()
    animate()
}


