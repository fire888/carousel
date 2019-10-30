
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import 'three/examples/js/renderers/CSS3DRenderer';
import DATA from './data'
import Background from './Backround/Background'
import changerAnimations from './ui'

Background(document.querySelector('#canvas-wrapper'))





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
        obj3D.rotation.x = -Math.PI / 2
        obj3D.position.y = -400 + (i * -20)
        obj3D.position.z = -800
        
        scene.add(obj3D)

        newsBlocks.push({ obj3D, mainBlock, letters, image });
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




// UPDATE ///////////////////////////////////////////////////////////


const doNextAction = () => {
    if (arrActions[0]) arrActions[0]( () => {
        arrActions.splice( 0, 1 )
        if ( arrActions[0] ) doNextAction() 
    } )
}

// ANIMATION - 1

const startPos01 = {
    pos: {x: 0, y: -400, z: -800}, 
    rot: {x: -Math.PI / 2, y: 0, z: 0},
}

const setBlocksInFirstPosition = () => {
    canvasWrapper.style.boxShadow = 'none'
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos01.pos.x, startPos01.pos.y + (i * -20), startPos01.pos.z)
        item.obj3D.rotation.set(startPos01.rot.x, startPos01.rot.y, startPos01.rot.z)
    })
}



const createArrActionsFirst = indexBlock => {
   return [
       callback => showBlock2( indexBlock, callback ),
       callback => showLetters2( indexBlock, callback ),
       callback =>  delay2( 2000, callback ),
       callback => {
           hideLetters( indexBlock )
           hideBlock2( indexBlock, callback )
       },
       callback => {
           if ( indexBlock < newsBlocks.length - 1 ) {
                arrActions = createArrActionsFirst( indexBlock + 1 )
                doNextAction()
           } else {
               callback()
           }
       },
       callback => moveBlocksDown( callback ),
       () => { 
           arrActions = createArrActionsFirst( 0 )
           doNextAction()
        }
   ]
}



const showBlock2 = function (index, callback) { 
    isRender = true
    newsBlocks[index].mainBlock.classList.add('light-border')  
    transform(
        newsBlocks[index].obj3D, 
        {x: 0, y: 0, z: 500}, 
        {x: 0, y: 0, z: 0}, 
        1000, 
        () => {
            isRender = false
            callback()
        }
    )
}


const delay2 = ( time, callback ) => {
    setTimeout(() => {
        callback()
    }, time)
}


const hideBlock2 = function( indexBlock, callback ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 0, y: 600 + (indexBlock * (-20)), z: -800}, 
        {x: -Math.PI / 2, y: 0, z: 0}, 
        1000,
        () => { 
            newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
            isRender = false
            callback()
        }
    )
}


const moveBlocksDown = function( callback ) {
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
        callback()
    }, 1800) 
}


// ANIMATION - 2 ///////////////////////////////////////////////

const startPos02 = {
    pos: { x: 0, y: 1800, z: 0 },
    rot: { x: 0, y: 0, z: 0 }
}


const setBlocksInSecondPosition = () => {
    canvasWrapper.style.boxShadow = `0 -15px 10px -10px rgba(0,255,255,0.85), 
                                     0 15px 10px -10px rgba(0,255,255,0.85)`
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos02.pos.x, startPos02.pos.y, startPos02.pos.z + (i * -100))
        item.obj3D.rotation.set(startPos02.rot.x, startPos02.rot.y, startPos02.rot.z)
    })
}


const createArrActionsSecond = indexBlock => {
    return [
        callback => showBlock2( indexBlock, callback ),
        callback => showLetters2( indexBlock, callback ),
        callback =>  delay2( 2000, callback ),
        callback => {
            hideLetters( indexBlock )
            removeBlockDown( indexBlock, callback )
        },
        callback => {
            if ( indexBlock < newsBlocks.length - 1 ) {
                 arrActions = createArrActionsSecond( indexBlock + 1 )
                 doNextAction()
            } else {
                callback()
            }
        },
        callback => moveBlocksTop( callback ),
        () => { 
            arrActions = createArrActionsSecond( 0 )
            doNextAction()
        }
    ]
 }
 


const removeBlockDown = function( indexBlock, callback ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 0, y: -1750, z: (newsBlocks.length * -100) + (indexBlock * 100)}, 
        {x: 0, y: 0, z: 0}, 
        1000,
        () => {
            isRender = false
            callback()
        }
    )
}


const moveBlocksTop = function( callback ) {
    isRender = true
    for (let i = 0; i < newsBlocks.length; i ++ ) {
       transform(               
           newsBlocks[i].obj3D, 
            {x: startPos02.pos.x, y: startPos02.pos.y, z: startPos02.pos.z + i * -100}, 
            startPos02.rot,  
            1500,       
        )
    }
    setTimeout(            () => {
        isRender = false
        callback()
    }, 1800 )
}





// ANIMATION 3 //////////////////////////////////////////////////////

const startPos03 = {
    pos: { x: -2000, y: 0, z: 0 },
    rot: { x: 0, y: 0, z: 0 }
}


const setBlocksInThirdPosition = () => {
    canvasWrapper.style.boxShadow = `15px 0px 10px -10px rgba(0,255,255,0.85), 
                                     -15px 0px 10px -10px rgba(0,255,255,0.85)`                                     
    newsBlocks.forEach( (item, i)  => {
        item.obj3D.position.set(startPos03.pos.x, startPos03.pos.y, startPos03.pos.z + (i * -100))
        item.obj3D.rotation.set(startPos03.rot.x, startPos03.rot.y, startPos03.rot.z)
    })
}


const createArrActionsThird = indexBlock => {
    return [
        callback => showBlock2( indexBlock, callback ),
        callback => showLetters2( indexBlock, callback ),
        callback =>  delay2( 2000, callback ),
        callback => {
            hideLetters( indexBlock )
            removeBlockRight( indexBlock, callback )
        },
        callback => {
            if ( indexBlock < newsBlocks.length - 1 ) {
                 arrActions = createArrActionsThird( indexBlock + 1 )
                 doNextAction()
            } else {
                callback()
            }
        },
        callback => moveBlocksLeft( callback ),
        () => { 
            arrActions = createArrActionsThird( 0 )
            doNextAction()
        }
    ]
 }

/*

const startAnimateThird = indexBlock => {
    currentPromise = showBlock(indexBlock)
        .then(() => {
            return showLetters(indexBlock)  
        })
        .then(() => {
            return delay(2000)
        })
        .then(() => { 
            return removeBlockRight(indexBlock)
        })
        .then(() => {
            if (indexBlock < newsBlocks.length - 1) {
                return startAnimateThird(indexBlock + 1)
            }
            return moveBlocksLeftLeft()
                .then(() => {
                    if (indexBlock === newsBlocks.length - 1) {
                        return moveBlocksLeft()
                    }
                })            
                .then(() => {
                    if (indexBlock === newsBlocks.length - 1) {
                        startAnimateThird(0)
                    }
                })
        })
}

*/


const removeBlockRight = function( indexBlock, callback ) {
    isRender = true
    transform(
        newsBlocks[indexBlock].obj3D, 
        {x: 2000, y: 0, z: (newsBlocks.length * -100) + (indexBlock * 100)}, 
        {x: 0, y: 0, z: 0}, 
        1000,
        () => { 
            newsBlocks[indexBlock].mainBlock.classList.remove('light-border')  
            isRender = false
            callback()
        }
    )
}



const moveBlocksLeft = function(callback) {
        isRender = true
        for (let i = 0; i < newsBlocks.length; i ++ ) {
           transform(newsBlocks[i].obj3D, {x: startPos03.pos.x, y: startPos03.pos.y, z: startPos03.pos.z + i * -100}, startPos03.rot,  1500)
        }
        setTimeout(()=> {
           isRender = false
           callback()
        }, 1800) 
}



////////////////////////////////////////////////////////////////


const resetAndStart = val => {
    isResetAnimate = true 

    if (val === "bottom") {
        arrActions.splice(1, 1, function(){
            isResetAnimate = false
            TWEEN.removeAll()
            for (let i = 0; i < newsBlocks.length; i ++ ) {
               hideLetters(i)
            }
            setBlocksInFirstPosition()
            arrActions = createArrActionsFirst(0)
            doNextAction()
        })
    }
    if (val === 'top') {
        arrActions.splice(1, 1, function(){
            isResetAnimate = false

            TWEEN.removeAll()
            for (let i = 0; i < newsBlocks.length; i ++ ) {
                hideLetters(i)
            }
            setBlocksInSecondPosition()
            arrActions = createArrActionsSecond(0)
            doNextAction()
        })
    }
    if (val === 'left') {
        arrActions.splice(1, 1, function(){
            isResetAnimate = false
            
            TWEEN.removeAll()
            for (let i = 0; i < newsBlocks.length; i ++ ) {
                hideLetters(i)
            }
            setBlocksInThirdPosition()
            arrActions = createArrActionsThird(0)
            doNextAction()
        })
    }
}








////////////////////////////////////////////////////////////////

let isResetAnimate = false

const showLetters2 = (index, callback) => {
    const { letters } = newsBlocks[index]

    const showLetter = ind => {
        setTimeout(() => {
            letters[ind].className = 'show-letter'
            if (ind < letters.length - 1) {
                if (isResetAnimate) {
                    return callback()
                }
                showLetter(ind + 1)        
            } else {
                callback()
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




/////////////////////////////////////////////////////////////////////

createScene(document.querySelector('#canvas-wrapper2'))
createNewsBlocks(DATA)
render()
animate()


setBlocksInFirstPosition()
let arrActions = createArrActionsFirst(0)
doNextAction()

changerAnimations({
    'bottom': () => {
        resetAndStart("bottom")
    },
    'top': () => {
        resetAndStart("top")
    },
    'left': () => {
        resetAndStart("left")
    },   
})
