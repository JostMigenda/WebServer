let reloadIntervalID, rateSelector

function setup() {
    rateSelector = document.getElementById("refresh-rate");
    rateSelector.addEventListener('change', setReloadInterval);

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
    updateStatusDisplay()
    plotSampleData()
    plotTemperatureData()

    // change border color to visualise reload frequency
    const pd = document.getElementsByClassName("plot-div")
    for (let item of pd) {
        item.style.borderColor = item.style.borderColor == 'gray' ? 'rebeccapurple' : 'gray'
    }
}

let layout = {
    title: "",
    // margin: { t: 100, b: 80, l: 80, r: 80 },
    // showlegend: false, // default: true
}

const config = {
    // staticPlot: true, // default: false
    responsive: true, // adapt when browser window is resized
    // displayModeBar: true, // default: only on mouse over
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
    displaylogo: false, // don’t display plotly icon in ModeBar
    // toImageButtonOptions: {
    //     format: 'png', // one of png, svg, jpeg, webp
    //     filename: plot_id,
    //     height: 500,
    //     width: 700,
    //     scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    // }
};

function plotSampleData() {
    const plot_id = "plot1"
    const plot_layout = Object.create(layout)
    plot_layout.title = "How much I like …"
    // TODO: adjust axes, see https://plotly.com/javascript/axes/
    const filename = "like.json" // hard-coded

    plotData(plot_id, plot_layout, filename)
}

function plotTemperatureData() {
    const plot_id = "plot2"
    const plot_layout = Object.create(layout)
    plot_layout.title = "Temperature"
    plot_layout.xaxis = { title: "Time [a.u.]" }
    plot_layout.yaxis = { title: "Temperature [℃]", range: [12, 16] }
    const filename = (new URL(window.location.href)).searchParams.get("filename")

    plotData(plot_id, plot_layout, filename)
}

// function to (re)load data and (re)draw plot
function plotData(plot_id, plot_layout, filename) {
    // plot_id: id of <div> element where this plot will be displayed
    // plot_layout: Copy of `layout` object with e.g. title adjusted
    // filename: (relative or absolute) path of file containing raw data to plot

    // add timestamp to avoid browser caching, see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    filename += ((/\?/).test(filename) ? "&" : "?") + (new Date()).getTime()
    let request = new XMLHttpRequest();
    request.open('GET', filename)
    request.responseType = 'json'
    request.send()
    request.onload = function () {
        // get data from JSON object and display plot
        let data = request.response
        console.log("Updating " + plot_id + " with data from " + filename)
        Plotly.newPlot(plot_id, data, plot_layout, config);
    }
}

function updateStatusDisplay() {
    const filename = "statusdisplay.json?" + (new Date()).getTime()
    let request = new XMLHttpRequest();
    request.open('GET', filename)
    request.responseType = 'json'
    request.send()
    request.onload = function () {
        let devices = request.response
        let statusdisplay = document.getElementById("status-display")
        while (statusdisplay.hasChildNodes()) {
            statusdisplay.removeChild(statusdisplay.firstChild)
        }
        devices.forEach(device => {
            let statuslight = document.createElement("a")

            // configure statuslight
            statuslight.setAttribute("id", "statuslight-" + device["id"])
            let colour = "green" // default, unless there is an issue
            if (device["temperature"] > 22) {
                colour = "red"
            } else if (device["temperature"] == null) {
                colour = "black"
            }
            statuslight.setAttribute("class", "statuslight " + colour)
            statuslight.setAttribute("title", "ID: " + device["id"] + "; Temperature: " + device["temperature"])
            statuslight.setAttribute("href", "details.html?deviceid=" + device["id"])

            // display it
            statusdisplay.appendChild(statuslight)
        })
    }
}
