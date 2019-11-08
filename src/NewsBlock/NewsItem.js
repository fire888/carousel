
import './style.css';

export default class NewsItem {
    constructor( data ) {
        const mainBlock = document.createElement('div')
        mainBlock.classList.add('news-item')

        const headBlock = document.createElement('div')
        headBlock.className = 'news-item-head'
        mainBlock.appendChild(headBlock) 

        const arrPict = this.getPictDromData( data )
        let img = null
        if (arrPict) {
            img = document.createElement('img')
            img.src = arrPict[0]
            headBlock.appendChild(img)
        }
        this.image = img ? img : null

        const dateBlock = document.createElement('div')
        dateBlock.classList.add('news-item-date')
        let dateData = new Date( data["date"] * 1000)
        dateData = `${dateData.getDay()}.${dateData.getMonth()-1}.${dateData.getFullYear()}`
        dateData = dateData.replace(/./g, '<span>$&</span>')
        dateBlock.innerHTML = dateData
        headBlock.appendChild(dateBlock)

        this.textBlockContainer = document.createElement('div')
        this.textBlockContainer.className = 'text-block-container'
        mainBlock.appendChild(this.textBlockContainer)
        
        this.textBlock = document.createElement('div')
        this.textBlock.classList.add('news-item-text')
        this.textBlockContainer.appendChild(this.textBlock)

        this.textData = data["text"]

        const letters = this.textBlock.querySelectorAll('.hidden-letter')

        this.letters = letters
        this.mainBlock = mainBlock
        this.obj3D = new THREE.CSS3DObject(mainBlock) 
        
        this.letterTimeout
        this.textParts
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
    }


    ///////////////


    calkText() {
        console.log('!!!')
        this.textParts = []

        let text = [...this.textData].map( item => item.replace(/./g, '<span class="hidden-letter">$&</span>') )

		let indexPart = 0
		this.textParts.push([])
		
		for (let i = 0; i < text.length; i++) {
			
            this.textBlock.innerHTML += text[ i ]

			if ( +this.textBlock.offsetHeight < this.textBlockContainer.offsetHeight - 20 ) {
				this.textParts[ indexPart ] += text[ i ]
			} else {
				if ( text[i] !== '<span class="hidden-letter"> </span>' ) {
                    this.textParts[ indexPart ] += text[ i ]
				} else {
					this.textParts[ indexPart ] += '<span class="hidden-letter"> -></span>'
					
					this.textBlock.innerHTML = text[ i ]
					this.textParts.push([])
					indexPart ++
					this.textParts[ indexPart ] += text[ i ]				
				}
			}		
		}
		this.textBlock.innerHTML = ''
    }


    showLetters( callback ) {
       
        const showPart = indPart => {
	
            if ( !this.textParts[ indPart ] ) {
                return  callback()
            }
            
            this.textBlock.innerHTML = this.textParts[ indPart ]
            let text = this.textBlock.querySelectorAll('.hidden-letter')
            
            const showLetter = indLetter => {
                if ( !text[ indLetter ] ) {
                    return this.letterTimeout = setTimeout( () => {
                        showPart( indPart + 1 )
                    }, 1000 )
                }
                
                text[ indLetter ].style.opacity = 1
                
                return this.letterTimeout = setTimeout( () => {
                    showLetter( indLetter + 1 )
                }, 0 )
            }
            
            showLetter( 0 )
        }

        showPart( 0 )
    }
    
    
    hideLetters() {
        if (this.letterTimeout) clearTimeout(this.letterTimeout)
        this.textBlock.innerHTML = ''
    }
} 