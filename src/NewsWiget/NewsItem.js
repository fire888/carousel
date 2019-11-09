
import DynamicText from '../DynamicText/DynamicText'
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
        
        this.dynamicText = new DynamicText( data['text'], this.textBlockContainer )

        this.mainBlock = mainBlock
        this.obj3D = new THREE.CSS3DObject(mainBlock) 
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


    resize (width, direction) {
        this.mainBlock.style.width = width
        this.mainBlock.style.flexDirection = direction
        if (this.image) {
            if (direction === 'row') { 
                //this.image.style.height = 1400 + 'px' 
            }
            if (direction === 'column') {
                if ( this.image.clientHeight > 790 ) {
                    this.image.style.width = 'auto'
                    this.image.style.minHeight = '780px'
                } else {
                    this.image.style.width = '100%'
                    this.image.style.minHeight = 'auto'
                }    
                //} 
                //    ? this.image.style.width = '100%'
                //    : this.image.style.width = 'auto'
                //this.image.style.maxWidth = this.image.width / this.image.height * 800 + 'px';
                //this.image.style.width = width
                // this.image.style.width = width
                //console.log( this.image.width, this.image.height )
            }            
        }
        if (this.textBlockContainer) {
            this.textBlockContainer.style.fontSize = 1650 / window.innerHeight  * 35 + 'px'
        }
    }

    showLetters ( callback ) {
        this.dynamicText.showLetters()
            .then( () => callback() )
    }


    calkText () {
        this.dynamicText.calkulateTextParts()
    }    
    
    hideLetters() {
        this.dynamicText.hideLetters()
    }
} 