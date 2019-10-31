export default function (acts) {
 
    const actions = acts

    const opt = document.querySelector( '#opt-start' )
    opt.selected  = true

    const select = document.querySelector( '#type-slideshow' )
    select.addEventListener( 'change', selectOnCnange )

    function selectOnCnange ( e )  {
        actions[e.target.value]()
    }
}