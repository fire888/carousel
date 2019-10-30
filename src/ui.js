export default function (acts) {
 
    const actions = acts

    const select = document.querySelector('#type-slideshow')
    select.addEventListener('change', selectOnCnange)

    function selectOnCnange (e) {
        actions[e.target.value]()
    }
}