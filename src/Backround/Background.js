import * as THREE from 'three'
import CONFIG from './config'


// RENDERER SCENE ///////////////////////////////////////////////////


export default class Background {
    constructor( wrapper ) {
        this.canvasWrapper = wrapper ? wrapper : null

        this.animator = null

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( CONFIG.colorBack )
        this.scene.fog = new THREE.Fog( this.scene.background, 50, 800 )
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio( window.devicePixelRatio )
        if ( this.canvasWrapper ) {
            this.canvasWrapper.appendChild( this.renderer.domElement )
        }

        this.camera = Camera()
        this.scene.add( this.camera.getMesh() )

        this.lights = Lights()
        this.scene.add( this.lights.ambient, this.lights.lightA, this.lights.lightB ) 

        this.surface = Surface()
        this.scene.add( this.surface.mesh )

        this._addWindowResizeListener()
        this.resizeToParentSize()
        this.drawFrame()
    }


    _addWindowResizeListener() {
        window.addEventListener( 'resize', function() {
            resizeToParentSize()
        } )
    }


    appendToDOMElement( wrapper ) {
        this.canvasWrapper = wrapper
        canvasWrapper.appendChild( this.renderer.domElement )
        this.resizeToParentSize()
    }


    resizeToParentSize() {
        if ( !this.canvasWrapper ) {
            return
        }
        this.renderer.setSize( this.canvasWrapper.offsetWidth, this.canvasWrapper.offsetHeight )
        this.camera.resize( this.canvasWrapper.offsetWidth, this.canvasWrapper.offsetHeight )
        this.render()
    }


    startAnimate() {
        this.animator = Animator()
        this.animator.startDrawFrames( this.drawFrame.bind( this ) )
    }


    play() {
        if ( this.animator ) {
            this.animator.play()
        }
    }


    stop() {
        if ( this.animator ) {
            this.animator.stop()
        }
    }


    drawFrame( time = 0.01, count = 1 ) {
        this.surface.update( time, count )
        this.lights.update( time, count )
        this.camera.update( time, count )
        this.render()
    }


    render() {
        this.renderer.render( this.scene, this.camera.getCamera() )
    }


    delete() {
        if ( this.animator ) {
            this.animator.stop()
            this.animator = null
        }

        this.scene.remove( this.surface.mesh )
        this.surface.delete()
        this.surface = null

        this.scene.remove( 
            this.lights.lightA, 
            this.lights.lightB, 
            this.lights.ambient,
        )
        this.lights = null

        this.scene.remove( this.camera.getMesh() ) 
        this.camera = null
        
        this.scene = null

        this.canvasWrapper.removeChild( this.renderer.domElement )
        this.canvasWrapper = null
        this.renderer = null
    } 
}


// CAMERA ////////////////////////////////////////////////////////


function Camera() {
    const camera = new THREE.PerspectiveCamera( 40, 100 / 100, 1, 1000 )
    camera.position.set( 0, 0, 400 )
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) )
    
    const groupCamera = new THREE.Group()
    groupCamera.add( camera )

    return {
        getCamera() {
            return camera
        },
        getMesh() {
            return groupCamera
        },
        update( time, count ) {
            groupCamera.rotation.x = Math.cos( count * 0.2 ) * 0.6
        },
        resize( w, h ) {
            camera.aspect = w / h
            camera.updateProjectionMatrix()
        }
    }
}


// LIGHT //////////////////////////////////////////////////////////


function Lights() {
    const ambient = new THREE.AmbientLight( CONFIG.ambientColor, 1.0 )

    const lightA = new THREE.PointLight( CONFIG.pointLightColor, 0.8 )
    lightA.position.set( 0, 300, -500 )

    const lightB = new THREE.PointLight( CONFIG.pointLightColor, 0.8 )
    lightB.position.set( 0, -300, -500 )

    return {
        ambient,
        lightA,
        lightB,
        update( time, count ) {
            lightA.position.x = 400 * Math.cos( count )
            lightB.position.x = 400 * Math.cos( count )
        }
    }
}


// SURFACE //////////////////////////////////////////////////////////


function Surface() {
    let surface
    let surfaceArray = []
    let plane

    plane = new THREE.PlaneGeometry( 1000, 1000, 20, 20 )
    for ( let i = 0; i < plane.vertices.length; i++ ) {
        let value = Math.random() * 20 - 10
        plane.vertices[ i ].z = value
        surfaceArray.push( value )
    }
    plane.computeVertexNormals()
    plane.computeFaceNormals()

    let materials = [
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
    for ( let i = 0; i < materials.length; i ++ ) {
        surface.add(new THREE.Mesh( plane, materials[ i ] ))
    }

    surface.rotation.x = -Math.PI/2

    // particles
    let particleMaterial = new THREE.PointsMaterial({ color: 0x9999ff, size: 4 })
    let particles = new THREE.Points( plane, particleMaterial )

    surface.add( particles )

    return {
        mesh: surface,
        update( time, count ) {
            for ( let i = 0; i < plane.vertices.length; i++ ) {
                plane.vertices[ i ].z = 
                    Math.sin( ( time / 200 ) + ( plane.vertices[ i ].x )  / 50 ) * ( surfaceArray[ i ] + Math.cos( count ) )
            }
            plane.verticesNeedUpdate = true
            surface.rotation.z += 0.0015
        },
        delete() {
            surface.remove(particles)
            particles = null
            particleMaterial = null
            surface = null
            materials = null
            surfaceArray = null
            surface = null
            plane.dispose()
            plane = null
        }
    }
}


// ANIMATOR //////////////////////////////////////////////////////////


function Animator() {
    let delta, time, oldTime, count = 0
    let func
    let nextStep

    const step = () => {
        nextStep = requestAnimationFrame( step )
     
        time = Date.now()
        delta = time - oldTime
        if ( isNaN( delta ) || delta > 1000 || delta === 0 ) {
            delta = 1000/60
        }
        count += delta * 0.001

        if ( func ) func(  time, count )
    }


    return {
        startDrawFrames( f ) {
            func = f
            step()
        },
        stop() {
            window.cancelAnimationFrame( nextStep )
        },
        play( f ) { 
            if ( f ) {
                func = f
            }
            step() 
        }
    }
} 


