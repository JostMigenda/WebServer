(function() {
// global variables
window.$hk = {}

// local variables
let reloadIntervalID, rateSelector

function setup() {
    rateSelector = document.getElementById("refresh-rate");
    console.log("rateSelector:" + rateSelector)
    rateSelector.addEventListener('change', hk.setReloadInterval);

    reloadData()
    reloadIntervalID = setInterval(reloadData, Number(rateSelector.value))
}

function setReloadInterval() {
    let reloadInterval = Number(rateSelector.value)
    if (reloadInterval === 0) {
        clearInterval(reloadIntervalID)
        document.querySelector("body").style.backgroundColor = "rgba(255,0,0,0.5)"
    } else {
        clearInterval(reloadIntervalID)
        reloadIntervalID = setInterval(reloadData, reloadInterval)
        document.querySelector("body").style.backgroundColor = ""
    }
}

function reloadData() {
    console.log("Reloading data … " + new Date())
    // TODO:
}

function audiotest() {
    var audio = new Audio("SN-test-sound.mp3");
    audio.play();
}

function loadContent(filename) {
    console.log("Getting content from " + filename)
    makeXHR(filename, 'text', function () {
        let main = document.getElementById("main-content")
        main.innerHTML = this.response
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