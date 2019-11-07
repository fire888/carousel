
import './style.css';

export default class NewsItem {

    constructor( data ) {
        const mainBlock = document.createElement('div')
        mainBlock.classList.add('news-item')

        // picts
        const headBlock = document.createElement('div')
        headBlock.className = 'news-item-head'
        mainBlock.appendChild(headBlock) 

        const arrPict = this.getPictDromData( data )
        let img = null
        if ( arrPict ) {
            img = document.createElement('img')
            img.src = arrPict[0]
            headBlock.appendChild(img)
        }
        this.image = img ? img : null

        // date
        const dateBlock = document.createElement('div')
        dateBlock.classList.add('news-item-date')
        let dateData = new Date( data["date"] * 1000)
        dateData = `${dateData.getDay()}.${dateData.getMonth()-1}.${dateData.getFullYear()}`
        dateData = dateData.replace(/./g, '<span>$&</span>')
        dateBlock.innerHTML = dateData
        headBlock.appendChild(dateBlock)

        // text
        this.textParts = []

        this.textBlockWrapper = document.createElement( 'div' )
        this.textBlockWrapper.classList.add( 'news-item-text-wrapper' )
        mainBlock.appendChild(this.textBlockWrapper)

        this.textBlock = document.createElement('div')
        this.textBlock.classList.add('news-item-text')
        this.textSource = data["text"]
        //const textData = data["text"].replace(/./g, '<span class="hidden-letter">$&</span>')
        //this.textBlock.innerHTML = textData
        this.textBlockWrapper.appendChild(this.textBlock)

        const letters = this.textBlock.querySelectorAll('.hidden-letter')

        this.letters = letters
        this.mainBlock = mainBlock
        this.obj3D = new THREE.CSS3DObject(mainBlock) 
        
        this.letterTimeout
    }

    getPictDromData( data ) {
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

    resize ( width, direction ) {
        console.log('item resize')
        this.mainBlock.style.width = width
        this.mainBlock.style.flexDirection = direction
        if (this.image) {
            if (direction === 'row') { 
                this.image.style.height = 1400 + 'px' 
            }
            if (direction === 'column') {
                this.image.style.height = 800 + 'px' 
            }            
        }

        // CALCULATE SIZES 
        this._calculateTextParts()
    }
    
    
    hideLetters() {
        if (this.letterTimeout) clearTimeout(this.letterTimeout)
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].className = 'hidden-letter'
        }
    }

    /////////////////////////////////////////////

    _calculateTextParts() {
        let text = [...this.textSource].map( item => item.replace(/./g, '<span class="hidden-letter">$&</span>') )
        
        let indexPart = 0
        this.textParts.push([])

        for (let i = 0; i < text.length; i++) {
			
			this.textBlock.innerHTML += text[ i ]

            ///////////////////
            console.log(this.mainBlock.offsetHeight)
            // console.log( this.textBlock.offsetHeight, this.textBlockWrapper.offsetHeight )
            ///////////////////    

			if ( +this.textBlock.offsetHeight < this.textBlockWrapper.offsetHeight - 20 ) {
				this.textParts[ indexPart ] += text[ i ]
			} else {
				if ( text[i] !== '<span class="hidden-letter"> </span>' ) {
                    this.textParts[ indexPart ] += text[ i ]
				} else {
					this.textBlock.innerHTML = text[ i ]
					this.textParts.push([])
					indexPart ++
					this.textParts[ indexPart ] += text[ i ]				
				}
			}		
        }
    }


    showLetters( callback ) {
        const showPart = indPart => {
            if ( !this.textParts[ indPart ] ) {
                return callback()
            }
            
            this.textBlock.innerHTML = this.textParts[ indPart ]
            let text = this.textBlock.querySelectorAll('.hidden-letter')
            
            const showLetter = indLetter => {
                if ( !text[ indLetter ] ) {
                    return setTimeout( () => {
                        showPart( indPart + 1 )
                    }, 1000 )
                }
                
                text[ indLetter ].style.opacity = 1
                
                return setTimeout( () => {
                    showLetter( indLetter + 1 )
                }, 100 )
            }
            
            showLetter( 0 )
        }

        showPart( 0 )
        //const showLetter = ind => {
        //    this.letterTimeout = setTimeout(() => {
        //        this.letters[ind].className = 'show-letter'
        //        if (ind < this.letters.length - 1) {
        //            showLetter(ind + 1)        
        //        } else {
        //            callback()
        //        }
        //    }, 0)
        //}
        //showLetter(0)
    }
} 



/*

const mainWrapper = document.querySelector('.wrapper-text') 
const textContainer = document.querySelector('.text') 
let textParts = [] 




const init = () => {
   return new Promise( resolve => {

		let text = [...fullMessage].map( item => item.replace(/./g, '<span class="hidden-letter">$&</span>') )
		
		
		let indexPart = 0
		textParts.push([])
		
		for (let i = 0; i < text.length; i++) {
			
			textContainer.innerHTML += text[ i ]
			
			if ( +textContainer.offsetHeight < mainWrapper.offsetHeight - 1 ) {
				textParts[ indexPart ] += text[ i ]
			} else {
				if ( text[i] !== '<span class="hidden-letter"> </span>' ) {
                    textParts[ indexPart ] += text[ i ]
				} else {
					textContainer.innerHTML = text[ i ]
					textParts.push([])
					indexPart ++
					textParts[ indexPart ] += text[ i ]				
				}
			}		
		}
		textContainer.innerHTML = ''
		resolve()
	})
}




const showPart = indPart => {
	
	if ( !textParts[ indPart ] ) {
		return
	}
	
	textContainer.innerHTML = textParts[ indPart ]
	let text = textContainer.querySelectorAll('.hidden-letter')
	
	const showLetter = indLetter => {
		if ( text[ indLetter ] ) {
			text[ indLetter ].style.opacity = 1
			setTimeout( () => {
				showLetter( indLetter + 1 )
			}, 50 )
		} else {
			setTimeout( () => {
				showPart( indPart + 1 )
			}, 50 )
		}
	}
	
	showLetter( 0 )
}



init()
 .then( () => {
 	showPart(0)
 })

*/