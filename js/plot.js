(function() {
/**
 * Update Plotly plot with new data.
 * @param {string} id - ID of the <div class="statusboard"> that contains the statusboard to update
 * @param {string} field - Name of the field in the `time_series` object
 * @param {object} meta - Metadata for the plot, e.g. { "title": "CPU Usage [%]", "min": -1, "max": 101 }
 * @param {object} time_series - Keys are timestamps, values are e.g. {"Temp": 28.0, "CPUidle ": 99.73, …}
 */
function updatePlot(id, field, meta, time_series) {
    let data = { "x": [], "y": [] }
    // TODO: Do I need to ensure that data is sorted by time? That’s not guaranteed, according to
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
    for (const [t, status_info] of Object.entries(time_series)) {
        data.x.push(t)
        data.y.push(transform(status_info[field], field))
    }

    const layout = Object.create(default_layout)
    layout.title = meta.title
    layout.xaxis = { title: "Time" }
    layout.yaxis = { title: meta.title, range: [meta.min, meta.max] }

    Plotly.newPlot(id, [data], layout, default_config);
}


// make necessary functions available globally under the `$hk.plot` prefix
window.$hk.plot = {}
$hk.plot.update = updatePlot


// internal helper functions/objects
const default_layout = {
    title: "",
    // margin: { t: 100, b: 80, l: 80, r: 80 },
    // showlegend: false, // default: true
}

const default_config = {
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
}

function transform(val, field) {
    switch (field) {
        case "CPUidle ":
            return 100 - val // CPU usage in %

        case "MemFree":
            return val // TODO: transform into human-readable unit

        default:
            return val
    }
}

})()