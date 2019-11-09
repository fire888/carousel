

import DATA from './data'
import { Background } from './Backround/Background'
import initUiChangerAnimations from './ui'
import NewsWiget from './NewsWiget/NewsWiget'




///////////////////////////

/*let back = new Background( document.querySelector('#canvas-wrapper') )
back.startAnimate()

setTimeout( () => { 
    back.stop()
}, 3000 )

setTimeout( () => { 
    back.play()
}, 5000 )
*/

///////////////////////////


const newsWiget = new NewsWiget()
newsWiget.appendTo( document.querySelector('#canvas-wrapper2') )
newsWiget.createNewsBlocks( DATA )

window.addEventListener( 'resize', () => newsWiget.resize(), false )
initUiChangerAnimations({
    'One': () => newsWiget.playScenario( 'One' ),
    'Two': () => newsWiget.playScenario( 'Two' ),
    'Three': () => newsWiget.playScenario( 'Three' ),   
})  

newsWiget.playScenario( 'One' )
//setTimeout( () => newsWiget.stop(), 2000 ) 
//setTimeout( () => newsWiget.delete(), 4000 ) 

/////////////////////////////////////////////////////////////////////


let animator = Animator()
animator.startAnimate()


// ANIMATOR //////////////////////////////////////////////////////////


function Animator() {
    let delta, time, oldTime, count = 0
    let func
    let step

    const animate = () => {
        step = requestAnimationFrame(animate)
     
        time = Date.now()
        delta = time - oldTime
        if ( isNaN( delta ) || delta > 1000 || delta == 0 ) {
            delta = 1000/60
        }
        count += delta * 0.001

        newsWiget.draw()
    }


    return {
        startAnimate( f ) {
            if ( f ) {
                func = f
            }
            animate()
        },
        stop() {
            window.cancelAnimationFrame( step )
        },
        play( f ) { 
            if ( f ) {
                func = f
            }
            animate() 
        }
    }
}

