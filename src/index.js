

import DATA from './data'
import Background from './Backround/Background'
import initUiChangerAnimations from './ui'
import NewsWiget from './NewsBlock'

Background( document.querySelector('#canvas-wrapper') )

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

