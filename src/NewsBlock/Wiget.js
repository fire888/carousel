import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import 'three/examples/js/renderers/CSS3DRenderer';
import NewsItem from './NewsItem'


const startPos01 = {
    pos: { x: 0, y: -400, z: -800 }, 
    rot: { x: -Math.PI / 2, y: 0, z: 0 },
}

const startPos02 = {
    pos: { x: 0, y: 1800, z: 0 },
    rot: { x: 0, y: 0, z: 0 }
}

const startPos03 = {
    pos: { x: -2000, y: 0, z: 0 },
    rot: { x: 0, y: 0, z: 0 }
}


export default class Wiget {

    constructor () {
        this.camera 
        this.cameraGroup 
        this.scene 
        this.renderer 
        this.canvasWrapper
        this.isRender = false

        this.newsBlocks = []
        this.it

        this._createScene()
        this._animate()
    }

    // PUBLIC ///////////////////////////////////////////////////////

    appendTo ( wrapper ) {
        this.canvasWrapper = wrapper
        this.canvasWrapper.appendChild( this.renderer.domElement )
    }


    resize () {
        this.camera.aspect = this.canvasWrapper.offsetWidth / this.canvasWrapper.offsetHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( this.canvasWrapper.offsetWidth, this.canvasWrapper.offsetHeight )
        this._resizeMainBlocks()
        this._render()
    }


    createNewsBlocks ( DATA ) {
        const arrNews = DATA.response.items
    
        for ( let i = 0; i < arrNews.length; i++ ) {
            const newsItem = new NewsItem( arrNews[ i ] )
            this.scene.add( newsItem.obj3D )    
            this.newsBlocks.push( newsItem )
        }
        this.resize()
        this._render()
    }


    playScenario ( val = 'One' ) {
        this.stop( true )
        
        if ( val === 'One' ) {
            this._setAllBlocksBottomBack()
            this._startScenario( this._scenarioOne.bind( this ), 0 )
        }
        if ( val === 'Two' ) {
            this._setAllBlocksTop()
            this._startScenario( this._scenarioTwo.bind( this ), 0 )
        }
        if ( val === 'Three' ) {
            this._setAllBlocksLeft()
            this._startScenario( this._scenarioThree.bind( this ), 0 )
        }
    }


    stop ( isHideLetters = false ) {
        this._stopCurrentScenario( isHideLetters )
    }


    delete() {
        console.log('delete')
        // TODO: ADD DELETE WIGET
    }



    // PRIVATE //////////////////////////////////////////////////////

    _createScene () {
        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera( 40, 100/100, 1, 10000 )
        this.camera.position.z = 3000
        this.cameraGroup = new THREE.Group()
        this.cameraGroup.add(this.camera)
        this.scene.add(this.cameraGroup)
    
        this.renderer = new THREE.CSS3DRenderer()
    }

    _animate() {
        requestAnimationFrame( this._animate.bind(this) )
        if ( this.isRender ) {
            TWEEN.update()
            this._render()
        }
    }

    _render () { 
        this.renderer.render( this.scene, this.camera )
    }


    _resizeMainBlocks () {
        this.canvasWrapper.style.fontSize = 1000 / this.canvasWrapper.offsetHeight * 45 + 'px'
        const factor = this.canvasWrapper.offsetWidth / this.canvasWrapper.offsetHeight
        const width = factor * 1700 + 'px'
        let direction
        factor > 2.5 ? direction = 'row' : direction = 'column'
        this.newsBlocks.forEach( item => { 
            item.resize( width, direction )
        } )
    }


    /////////////////////////////////////////////////////


    _setAllBlocksBottomBack () {
        this.canvasWrapper.style.boxShadow = 'none'
        this.newsBlocks.forEach( (item, i)  => {
            item.obj3D.position.set(startPos01.pos.x, startPos01.pos.y + (i * -20), startPos01.pos.z)
            item.obj3D.rotation.set(startPos01.rot.x, startPos01.rot.y, startPos01.rot.z)
        })
    }
    
    
    _setAllBlocksTop () {
        this.canvasWrapper.style.boxShadow = `0 -15px 10px -10px rgba(0,255,255,0.85), 
                                         0 15px 10px -10px rgba(0,255,255,0.85)`
        this.newsBlocks.forEach( ( item, i )  => {
            item.obj3D.position.set(startPos02.pos.x, startPos02.pos.y, startPos02.pos.z + (i * -100))
            item.obj3D.rotation.set(startPos02.rot.x, startPos02.rot.y, startPos02.rot.z)
        })
    }
    
    
    _setAllBlocksLeft () {
        this.canvasWrapper.style.boxShadow = `15px 0px 10px -10px rgba(0,255,255,0.85), 
                                         -15px 0px 10px -10px rgba(0,255,255,0.85)`                                     
        this.newsBlocks.forEach( ( item, i )  => {
            item.obj3D.position.set( startPos03.pos.x, startPos03.pos.y, startPos03.pos.z + (i * -100) )
            item.obj3D.rotation.set( startPos03.rot.x, startPos03.rot.y, startPos03.rot.z )
        })
    }
    
    
    _moveBlockInCenter ( index, it ) { 
        this.isRender = true
        this.newsBlocks[index].mainBlock.classList.add( 'light-border' )  
        this._transform(
            this.newsBlocks[index].obj3D, 
            { x: 0, y: 0, z: 500 }, 
            { x: 0, y: 0, z: 0 }, 
            1000, 
            () => {
                this.isRender = false
                if ( it ) it.next()
            }
        )
    }
    
    
    _moveBlockTopBack ( indexBlock, it ) {
        this.isRender = true
        this._transform(
            this.newsBlocks[indexBlock].obj3D, 
            { x: 0, y: 600 + (indexBlock * (-20)), z: -800 }, 
            { x: -Math.PI / 2, y: 0, z: 0 }, 
            1000,
            () => { 
                this.newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
                this.isRender = false
                if ( it ) it.next()
            }
        )
    } 
    
    
    _moveBlockDown ( indexBlock, it ) {
        this.isRender = true
        this._transform(
            this.newsBlocks[indexBlock].obj3D, 
            {x: 0, y: -1750, z: ( this.newsBlocks.length * -100 ) + (indexBlock * 100)}, 
            {x: 0, y: 0, z: 0}, 
            1000,
            () => {
                this.isRender = false
                if ( it ) it.next()
            }
        )
    }
    
    
    _moveBlockRight ( indexBlock, it ) {
        this.isRender = true
        this._transform(
            this.newsBlocks[indexBlock].obj3D, 
            {x: 2000, y: 0, z: (this.newsBlocks.length * -100) + (indexBlock * 100)}, 
            {x: 0, y: 0, z: 0}, 
            1000,
            () => { 
                this.newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
                this.isRender = false
                if ( it ) it.next()
            }
        )
    }
    
    
    _moveAllBlocksBottomBack ( it ) {
        this.isRender = true
        for (let i = 0; i < this.newsBlocks.length; i ++ ) {
            this._transform(
                this.newsBlocks[i].obj3D, 
                { x: startPos01.pos.x, y: startPos01.pos.y + (i * -20), z: startPos01.pos.z }, 
                startPos01.rot,  
                1500,
            )
        }
        setTimeout( () => {
            this.isRender = false
            if ( it ) it.next()
        }, 1800) 
    }
    
    
    _moveAllBlocksTop ( it ) {
        this.isRender = true
        for (let i = 0; i < this.newsBlocks.length; i ++ ) {
            this._transform(               
                this.newsBlocks[i].obj3D, 
                {x: startPos02.pos.x, y: startPos02.pos.y, z: startPos02.pos.z + i * -100}, 
                startPos02.rot,  
                1500,       
            )
        }
        setTimeout( () => {
            this.isRender = false
            if ( it ) it.next()
        }, 1800 )
    }
    
    
    _moveAllBlocksLeft ( it ) {
        this.isRender = true
        for ( let i = 0; i < this.newsBlocks.length; i ++ ) {
            this._transform(
                this.newsBlocks[i].obj3D, 
                {x: startPos03.pos.x, y: startPos03.pos.y, z: startPos03.pos.z + i * -100}, 
                startPos03.rot,  
                1500
            )
        }
        setTimeout(()=> {
            this.isRender = false
            if ( it ) it.next()
        }, 1800) 
    }


    _showBlockLetters ( index, it ) {
        this.newsBlocks[index].showLetters( () => {
            if ( it ) it.next()
        } )
    }
    
    
    _hideBlockLetters ( indexBlock ) {
        this.newsBlocks[indexBlock].hideLetters() 
    }


    _transform (obj, pos, rot, duration, callback) {
        new TWEEN.Tween(obj.position)
            .to({ x: pos.x, y: pos.y, z: pos.z }, duration)
            .easing( TWEEN.Easing.Exponential.InOut )
            .onComplete(function(){
                if (callback) {
                   callback();
                }
            })
            .start()
        new TWEEN.Tween(obj.rotation)
            .to({ x: rot.x, y: rot.y, z: rot.z }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start()
    }


    _delay( time, it ) {
        setTimeout(() => {
            if (it) it.next()
        }, time)
    }


    ///////////////////////////////////////////////////////////////////


    _startScenario ( scenario, indexBlock ) {
        this.it = scenario( indexBlock )
        this.it.next()
        this.it.next( this.it )
    }
    
    
    _stopCurrentScenario ( isHideLetters = false ) {
        TWEEN.removeAll()
        if ( this.it ) this.it.return()
        if (!isHideLetters) {
            return
        }
        for ( let i = 0; i < this.newsBlocks.length; i ++ ) {
            this.newsBlocks[i].hideLetters()
        }
    }

    /////////////////////////////////////////////////////////////////////////

    *_scenarioOne ( indexBlock ) {
        const it = yield
        this._moveBlockInCenter( indexBlock, it )
        yield
        this._showBlockLetters( indexBlock, it )
        yield
        this._delay( 2000, it )
        yield
        this._hideBlockLetters( indexBlock )
        this._moveBlockTopBack( indexBlock, it )
        yield
        if ( indexBlock < this.newsBlocks.length - 1 ) {
            this._startScenario( this._scenarioOne.bind( this ), indexBlock + 1 )
        } else {
            this._moveAllBlocksBottomBack( it )
            yield
            this._startScenario( this._scenarioOne.bind( this ), 0 )
        }
    }

    *_scenarioTwo ( indexBlock ) {
        const it = yield
        this._moveBlockInCenter( indexBlock, it )
        yield
        this._showBlockLetters( indexBlock, it )
        yield
        this._delay( 2000, it )
        yield
        this._hideBlockLetters( indexBlock )
        this._moveBlockDown( indexBlock, it )
        yield
        if ( indexBlock < this.newsBlocks.length - 1 ) {
            this._startScenario( this._scenarioTwo.bind( this ), indexBlock + 1 )
        } else {
            this._moveAllBlocksTop( it )
            yield
            this._startScenario( this._scenarioTwo.bind( this ), 0 )
        }  
    }

    *_scenarioThree ( indexBlock ) {
        const it = yield
        this._moveBlockInCenter( indexBlock, it )
        yield
        this._showBlockLetters( indexBlock, it )
        yield
        this._delay( 2000, it )
        yield
        this._hideBlockLetters( indexBlock )
        this._moveBlockRight( indexBlock, it )
        yield
        if ( indexBlock < this.newsBlocks.length - 1 ) {
            this._startScenario( this._scenarioThree.bind( this ), indexBlock + 1 )
        } else {
            this._moveAllBlocksLeft( it )
            yield
            this._startScenario( this._scenarioThree.bind( this ), 0 )
        }
    }
}

