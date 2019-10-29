
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import 'three/examples/js/renderers/CSS3DRenderer';
import DATA from './data'
import Background from './Backround/Background'

Background(document.querySelector('#canvas-wrapper'))





////////////////////////////////////////////

let camera, cameraGroup, scene, renderer

function createScene() {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 )
    camera.position.z = 3000
    cameraGroup = new THREE.Group()
    cameraGroup.add(camera);
    scene.add(cameraGroup)

    renderer = new THREE.CSS3DRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('canvas-wrapper2').appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}

let isRender = true

function animate() {
    requestAnimationFrame(animate)
    TWEEN.update()

    if (isRender) {
        render()
    }
}


//////////////////////////

const newsBlocks = []

function createNewsBlocks(DATA) {
    const arrNews = DATA.response.items

    for (let i = 0; i < arrNews.length; i++) {
        const mainBlock = document.createElement('div')
        mainBlock.classList.add('news-item')

        const arrPict = getPictDromData(arrNews[i])
        const img = document.createElement('img')
        img.src = arrPict[0]
        mainBlock.appendChild(img)  

        const dateBlock = document.createElement('div')
        dateBlock.classList.add('news-item-date')
        let dateData = new Date(arrNews[i]["date"] * 1000)
        dateData = `${dateData.getDay()}.${dateData.getMonth()-1}.${dateData.getFullYear()}`
        dateData = dateData.replace(/./g, '<span class="hidden-letter">$&</span>')
        dateBlock.innerHTML = dateData
        mainBlock.appendChild(dateBlock)

        const textBlock = document.createElement('div')
        textBlock.classList.add('news-item-text')
        let textData = arrNews[i]["text"].replace(/./g, '<span class="hidden-letter">$&</span>')
        textBlock.innerHTML = textData
        mainBlock.appendChild(textBlock)

        const letters = mainBlock.querySelectorAll('.hidden-letter')

        let obj3D = new THREE.CSS3DObject(mainBlock)
        obj3D.rotation.x = -Math.PI / 2
        obj3D.position.y = -400 + (i * -20)
        obj3D.position.z = -400
        
        scene.add(obj3D)

        newsBlocks.push({
            obj3D,
            mainBlock,
            textBlock,
            dateBlock,
            letters,
        });
    }
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





//////////////////////////////////////////


const startAnimateBlock = indexBlock => {
    showBlock(indexBlock)
        .then(() => { 
            return showLetters(indexBlock) 
        })
        .then(() => { 
            hideLetters(indexBlock)
            return hideBlock(indexBlock)
        })
        .then(() => {
            if (indexBlock < newsBlocks.length - 1) {
                startAnimateBlock(indexBlock + 1)
                return;
            }
            return moveBlocksDown()
        })
        .then(() => {
            if (indexBlock === newsBlocks.length - 1) {
                startAnimateBlock(0)
            }
        })
}

const showBlock = function (index) { 
    return new Promise((resolve, reject) => {
        isRender = true
        transform(newsBlocks[index].obj3D, {x: 0, y: 0, z: 500}, {x: 0, y: 0, z: 0}, 1000)
        setTimeout(() => { 
            isRender = false
            resolve() 
        }, 1000)
    })
}


const hideBlock = function(indexBlock) {
    return new Promise((resolve, reject) => {
        isRender = true
        transform(newsBlocks[indexBlock].obj3D, {x: 0, y: 600 + (indexBlock * (-20)), z: -400}, {x: -Math.PI / 2, y: 0, z: 0}, 1000)
        setTimeout(() => { 
            isRender = false
            resolve() 
        }, 1000)
    })
}

const moveBlocksDown = function() {
    return new Promise((resolve, reject) => {
        isRender = true
        for (let i = 0; i < newsBlocks.length; i ++ ) {
           transform(newsBlocks[i].obj3D, {x: 0, y: -400 + (i * -20), z: -400}, {x: -Math.PI / 2, y: 0, z: 0}, 1500)
        }
        setTimeout(()=> {
           isRender = false
           resolve()
        }, 1500) 
    })
}


const showLetters = function (index) {
    return new Promise((resolve, reject) => {
        const { letters } = newsBlocks[index]
        for (let i = 0; i < letters.length; i++) {
            setTimeout(function() { 
                letters[i].className = 'show-letter'
                if (i === letters.length - 1) {
                    resolve()
                }
            }, i * 10)
        }
    })
}

const hideLetters = indexBlock => {
    const { letters } = newsBlocks[indexBlock]
    for (let i = 0; i < letters.length; i++) {
        letters[i].className = 'hidden-letter'
    }
}





///////////////////////

createScene()
createNewsBlocks(DATA)
render()
animate()
startAnimateBlock(0)






////////////////////////

function transform( obj, pos, rot, duration ) {
    new TWEEN.Tween( obj.position )
        .to( { x: pos.x, y: pos.y, z: pos.z }, duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start()

    new TWEEN.Tween( obj.rotation )
        .to( { x: rot.x, y: rot.y, z: rot.z }, duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start()
}

