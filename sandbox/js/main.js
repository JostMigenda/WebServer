(function() {
// global variables
window.$hk = {}
$hk.itemsToReload = []

// local variables
let reloadIntervalID, rateSelector

function setup() {
    rateSelector = document.getElementById("refresh-rate");
    console.log("rateSelector:" + rateSelector)
    rateSelector.addEventListener('change', setReloadInterval);

    reloadAll()
    reloadIntervalID = setInterval(reloadAll, Number(rateSelector.value))
}

function setReloadInterval() {
    let reloadInterval = Number(rateSelector.value)
    if (reloadInterval === 0) {
        clearInterval(reloadIntervalID)
        document.querySelector("body").style.backgroundColor = "rgba(255,0,0,0.5)"
    } else {
        clearInterval(reloadIntervalID)
        reloadIntervalID = setInterval(reloadAll, reloadInterval)
        document.querySelector("body").style.backgroundColor = ""
    }
}

function reloadAll() {
    console.log("Reloading data … " + new Date())
    $hk.itemsToReload.forEach(item => makeXHR(item.filename, item.responseType, item.completionHandler))
}

function audiotest() {
    var audio = new Audio("SN-test-sound.mp3");
    audio.play();
}

function loadContent(filename) {
    console.log("Getting content from " + filename)
    $hk.itemsToReload = []
    makeXHR(filename, 'text', function () {
        let main = document.getElementById("main-content")
        main.innerHTML = this.response

        // put title of page into header (yes, this is not ideal … 🤷)
        titleNode = main.querySelector("h1")
        main.removeChild(titleNode)
        document.querySelector("#page-title").textContent = titleNode.textContent

        // Setting innerHTML doesn’t execute <script> tags, so we remove and re-add them, as a workaround
        const children = Array.from(main.children) // cast to Array to stop it from updating live
        children.forEach(child => {
            if (child.tagName.toLowerCase() === 'script') {
                main.removeChild(child)
                let scriptTag = document.createElement('script')
                scriptTag.innerHTML = ' ' + child.innerHTML
                main.appendChild(scriptTag)
            }
        })

        // If the <script> tags added any elements to $hk.itemsToReload, load them now
        reloadAll()
    })
}


// make necessary functions available globally under the `$hk` prefix
$hk.setup = setup
$hk.setReloadInterval = setReloadInterval
// $hk.reloadAll = reloadAll // TODO: Does this need to be public?
$hk.audiotest = audiotest
$hk.loadContent = loadContent


// internal helper functions
function makeXHR(filename, responseType, completionHandler) {
    // add timestamp to avoid browser caching, see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    filename += ((/\?/).test(filename) ? "&" : "?") + "timestamp=" + (new Date()).getTime()

    let request = new XMLHttpRequest();
    request.open('GET', filename)
    request.responseType = responseType
    request.send()
    request.onload = completionHandler
}
})()