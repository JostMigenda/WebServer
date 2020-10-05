(function(global) {
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
    filename += "?" + (new Date()).getTime()
    console.log("Getting content from " + filename)
    let request = new XMLHttpRequest();
    request.open('GET', filename)
    request.responseType = 'text'
    request.send()
    request.onload = function () {
        let main = document.getElementById("main-content")
        main.innerHTML = request.response
    }
}


// make necessary functions available globally under the `$hk` prefix
hk = {}
hk.setup = setup
hk.setReloadInterval = setReloadInterval
// hk.reloadData = reloadData
hk.audiotest = audiotest
hk.loadContent = loadContent
global.$hk = hk
})(window)