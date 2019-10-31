
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import 'three/examples/js/renderers/CSS3DRenderer';
import DATA from './data'
import Background from './Backround/Background'
import initUiChangerAnimations from './ui'


// INIT SCENE //////////////////////////////////////////


let camera, cameraGroup, scene, renderer, canvasWrapper


const createScene = wrapper => {
    canvasWrapper = wrapper

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(40, wrapper.offsetWidth / wrapper.offsetHeight, 1, 10000)
    camera.position.z = 3000
    cameraGroup = new THREE.Group()
    cameraGroup.add(camera)
    scene.add(cameraGroup)

    renderer = new THREE.CSS3DRenderer()
    renderer.setSize(wrapper.offsetWidth, wrapper.offsetHeight)
    wrapper.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)
}


const render = () => renderer.render(scene, camera)


const onWindowResize = () => {
    resizeMainBlocks()
    camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight)
    render()
}


let isRender = true

const animate = () => {
    requestAnimationFrame(animate)

    if (isRender) {
        TWEEN.update()
        render()
    }
}


// INIT BLOCKS //////////////////////////////////////////////////////


const newsBlocks = []


const createNewsBlocks = DATA => {
    const arrNews = DATA.response.items

    for (let i = 0; i < arrNews.length; i++) {
        const mainBlock = document.createElement('div')
        mainBlock.classList.add('news-item')

        const headBlock = document.createElement('div')
        headBlock.className = 'news-item-head'
        mainBlock.appendChild(headBlock) 

        const arrPict = getPictDromData(arrNews[i])
        let img = null
        if (arrPict) {
            img = document.createElement('img')
            img.src = arrPict[0]
            headBlock.appendChild(img)
        }
        const image = img ? img : null

        const dateBlock = document.createElement('div')
        dateBlock.classList.add('news-item-date')
        let dateData = new Date(arrNews[i]["date"] * 1000)
        dateData = `${dateData.getDay()}.${dateData.getMonth()-1}.${dateData.getFullYear()}`
        dateData = dateData.replace(/./g, '<span class="hidden-letter">$&</span>')
        dateBlock.innerHTML = dateData
        headBlock.appendChild(dateBlock)

        const textBlock = document.createElement('div')
        textBlock.classList.add('news-item-text')
        const textData = arrNews[i]["text"].replace(/./g, '<span class="hidden-letter">$&</span>')
        textBlock.innerHTML = textData
        mainBlock.appendChild(textBlock)

        const letters = mainBlock.querySelectorAll('.hidden-letter')

        const obj3D = new THREE.CSS3DObject(mainBlock)        
        scene.add(obj3D)

        newsBlocks.push({ obj3D, mainBlock, letters, image })
    }

    resizeMainBlocks()
}


const resizeMainBlocks = () => {
    canvasWrapper.style.fontSize = 1000 / canvasWrapper.offsetHeight * 45 + 'px'
    const factor = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight
    const width = factor * 1700 + 'px'
    let direction
    factor > 2.5 ? direction = 'row' : direction = 'column'
    newsBlocks.forEach( item => { 
        item.mainBlock.style.width = width
        item.mainBlock.style.flexDirection = direction
        if (item.image) {
            if (direction === 'row') { 
                item.image.style.height = 1400 + 'px' 
            }
            if (direction === 'column') {
                item.image.style.height = 800 + 'px' 
            }            
        }
    } )
}


const getPictDromData = data => {
    if (!data['attachments'] || !data['attachments'].length) {
        return null;
    }
    const arrSrc = []
    for (let i = 0; i < data['attachments'].length; i++) {
        if (data['attachments'][i]['type'] === 'photo' &&  
            data['attachments'][i]['photo']['photo_604']) {    
            arrSrc.push(data['attachments'][i]['photo']['photo_604'])
        }
    }
    return arrSrc.length ? arrSrc : null;
}


// ACTIONS //////////////////////////////////////////////////////////


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


const setAllBlocksBottomBack = () => {
    canvasWrapper.style.boxShadow = 'none'
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos01.pos.x, startPos01.pos.y + (i * -20), startPos01.pos.z)
        item.obj3D.rotation.set(startPos01.rot.x, startPos01.rot.y, startPos01.rot.z)
    })
}


const setAllBlocksTop = () => {
    canvasWrapper.style.boxShadow = `0 -15px 10px -10px rgba(0,255,255,0.85), 
                                     0 15px 10px -10px rgba(0,255,255,0.85)`
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos02.pos.x, startPos02.pos.y, startPos02.pos.z + (i * -100))
        item.obj3D.rotation.set(startPos02.rot.x, startPos02.rot.y, startPos02.rot.z)
    })
}


const setAllBlocksLeft = () => {
    canvasWrapper.style.boxShadow = `15px 0px 10px -10px rgba(0,255,255,0.85), 
                                     -15px 0px 10px -10px rgba(0,255,255,0.85)`                                     
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos03.pos.x, startPos03.pos.y, startPos03.pos.z + (i * -100))
        item.obj3D.rotation.set(startPos03.rot.x, startPos03.rot.y, startPos03.rot.z)
    })
}


const moveBlockInCenter = function ( index, it ) { 
    isRender = true
    newsBlocks[index].mainBlock.classList.add('light-border')  
    transform(
        newsBlocks[index].obj3D, 
        {x: 0, y: 0, z: 500}, 
        {x: 0, y: 0, z: 0}, 
        1000, 
        () => {
            isRender = false
            it.next()
        }
    )
}


const moveBlockTopBack = function( indexBlock, it ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 0, y: 600 + (indexBlock * (-20)), z: -800}, 
        {x: -Math.PI / 2, y: 0, z: 0}, 
        1000,
        () => { 
            newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
            isRender = false
            if ( it ) it.next()
        }
    )
} 


const moveBlockDown = function( indexBlock, it ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 0, y: -1750, z: (newsBlocks.length * -100) + (indexBlock * 100)}, 
        {x: 0, y: 0, z: 0}, 
        1000,
        () => {
            isRender = false
            if ( it ) it.next()
        }
    )
}


const moveBlockRight = function( indexBlock, it ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 2000, y: 0, z: (newsBlocks.length * -100) + (indexBlock * 100)}, 
        {x: 0, y: 0, z: 0}, 
        1000,
        () => { 
            newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
            isRender = false
            if ( it ) it.next() 
        }
    )
}


const moveAllBlocksBottomBack = function( it ) {
    isRender = true
    for (let i = 0; i < newsBlocks.length; i ++ ) {
        transform(
            newsBlocks[i].obj3D, 
            { x: startPos01.pos.x, y: startPos01.pos.y + (i * -20), z: startPos01.pos.z }, 
            startPos01.rot,  
            1500,
        )
    }
    setTimeout( () => {
        isRender = false
        if (it) it.next()
    }, 1800) 
}


const moveAllBlocksTop = function( it ) {
    isRender = true
    for (let i = 0; i < newsBlocks.length; i ++ ) {
       transform(               
           newsBlocks[i].obj3D, 
            {x: startPos02.pos.x, y: startPos02.pos.y, z: startPos02.pos.z + i * -100}, 
            startPos02.rot,  
            1500,       
        )
    }
    setTimeout( () => {
        isRender = false
        if ( it ) it.next()
    }, 1800 )
}


const moveAllBlocksLeft = function( it ) {
        isRender = true
        for (let i = 0; i < newsBlocks.length; i ++ ) {
           transform(newsBlocks[i].obj3D, {x: startPos03.pos.x, y: startPos03.pos.y, z: startPos03.pos.z + i * -100}, startPos03.rot,  1500)
        }
        setTimeout(()=> {
           isRender = false
           if ( it ) it.next()
        }, 1800) 
}


const showLetters = (index, it) => {
    const { letters } = newsBlocks[index]

    const showLetter = ind => {
        setTimeout(() => {
            letters[ind].className = 'show-letter'
            if (ind < letters.length - 1) {
                showLetter(ind + 1)        
            } else {
                if ( it ) it.next()
            }
        }, 0)
    }

    showLetter(0)
}


const hideLetters = indexBlock => {
    const { letters } = newsBlocks[indexBlock]
    for (let i = 0; i < letters.length; i++) {
        letters[i].className = 'hidden-letter'
    }
}


const transform = (obj, pos, rot, duration, callback) => {
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


const delay = ( time, it ) => {
    setTimeout(() => {
        if (it) it.next()
    }, time)
}


// SCENARIOUSES ///////////////////////////////////////////////////////////////


function *scenarioOne ( indexBlock ) {
    const it = yield
    moveBlockInCenter( indexBlock, it )
    yield
    showLetters( indexBlock, it )
    yield
    delay( 2000, it )
    yield
    hideLetters( indexBlock )
    moveBlockTopBack( indexBlock, it )
    yield
    if ( indexBlock < newsBlocks.length - 1 ) {
        startScenario( scenarioOne, indexBlock + 1 )
    } else {
        moveAllBlocksBottomBack( it )
        yield
        startScenario( scenarioOne, 0 )
    }
}


function *scenarioTwo ( indexBlock ) {
    const it = yield
    moveBlockInCenter( indexBlock, it )
    yield
    showLetters( indexBlock, it )
    yield
    delay( 2000, it )
    yield
    hideLetters( indexBlock )
    moveBlockDown( indexBlock, it )
    yield
    if ( indexBlock < newsBlocks.length - 1 ) {
        startScenario( scenarioTwo, indexBlock + 1 )
    } else {
        moveAllBlocksTop( it )
        yield
        startScenario( scenarioTwo, 0 )
    }  
}


function *scenarioThree ( indexBlock ) {
    const it = yield
    moveBlockInCenter( indexBlock, it )
    yield
    showLetters( indexBlock, it )
    yield
    delay( 2000, it )
    yield
    hideLetters( indexBlock )
    moveBlockRight( indexBlock, it )
    yield
    if ( indexBlock < newsBlocks.length - 1 ) {
        startScenario( scenarioThree, indexBlock + 1 )
    } else {
        moveAllBlocksLeft( it )
        yield
        startScenario( scenarioThree, 0 )
    }
}


const resetAndStartNewScenario = val => {
    TWEEN.removeAll()
    for ( let i = 0; i < newsBlocks.length; i ++ ) {
        hideLetters( i )
    }
    stopCurrentScenario()
    
    if (val === "One") {
        setAllBlocksBottomBack()
        startScenario( scenarioOne, 0 )
    }
    if (val === 'Two') {
        stopCurrentScenario()
        setAllBlocksTop()
        startScenario( scenarioTwo, 0 )
    }
    if (val === 'Three') {
        stopCurrentScenario()
        setAllBlocksLeft()
        startScenario( scenarioThree, 0 )
    }
}


let it 


const startScenario = ( scenario, indexBlock ) => {
    it = scenario( indexBlock )
    it.next()
    it.next( it )
}


const stopCurrentScenario = () => {
    if ( it ) it.return()
}


// UI ///////////////////////////////////////////////////////////////


initUiChangerAnimations({
    'One': () => {
        resetAndStartNewScenario("One")
    },
    'Two': () => {
        resetAndStartNewScenario("Two")
    },
    'Three': () => {
        resetAndStartNewScenario("Three")
    },   
})


// APP START ////////////////////////////////////////////////////////


Background(document.querySelector('#canvas-wrapper'))

createScene(document.querySelector('#canvas-wrapper2'))
createNewsBlocks(DATA)
animate()
resetAndStartNewScenario('One')


