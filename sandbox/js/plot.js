(function() {
/**
 * Update Plotly plot with new data.
 * @param {string} id - The ID of the <div class="statusboard"> that contains the statusboard to update
 * @param {object} data - JSON returned by XMLHttpRequest. Contains a `devices` and a `meta` object.
 */
function updatePlot(id, data) {
    const layout = Object.create(default_layout)
    layout.title = data.timeSeries.name
    layout.xaxis = { title: "Time" }
    layout.yaxis = { title: data.timeSeries.name, range: [data.meta.additionalInfo.min, data.meta.additionalInfo.max] }

    Plotly.newPlot(id, [data.timeSeries], layout, default_config);
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

})()