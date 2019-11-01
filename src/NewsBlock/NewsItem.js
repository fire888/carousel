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
        dateData = dateData.replace(/./g, '<span class="hidden-letter">$&</span>')
        dateBlock.innerHTML = dateData
        headBlock.appendChild(dateBlock)

        const textBlock = document.createElement('div')
        textBlock.classList.add('news-item-text')
        const textData = data["text"].replace(/./g, '<span class="hidden-letter">$&</span>')
        textBlock.innerHTML = textData
        mainBlock.appendChild(textBlock)

        const letters = mainBlock.querySelectorAll('.hidden-letter')

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

    showLetters( callback ) {
        const showLetter = ind => {
            this.letterTimeout = setTimeout(() => {
                this.letters[ind].className = 'show-letter'
                if (ind < this.letters.length - 1) {
                    showLetter(ind + 1)        
                } else {
                    callback()
                }
            }, 0)
        }
        showLetter(0)
    }
    
    
    hideLetters() {
        if (this.letterTimeout) clearTimeout(this.letterTimeout)
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].className = 'hidden-letter'
        }
    }
} 