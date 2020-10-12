(function() {
/**
 * Delete contents of a statusboard and insert new data.
 * @param {string} id - The ID of the <div class="statusboard"> that contains the statusboard to update
 * @param {object} data - JSON returned by XMLHttpRequest. Contains a `devices` and a `meta` object.
 */
function updateStatusboard(id, data) {
    let statusboard = document.getElementById(id)
    statusboard.textContent = ''
    data.devices.forEach(device => {
        // create statusindicator and set colour based on current status
        let si = document.createElement("a")
        si.setAttribute("class", "statusindicator")
        si.addEventListener('mouseenter', showDetailsPopover)
        si.addEventListener('mouseleave', hideDetailsPopover)
        si.classList.add(determineStatusIndicatorColour(device, data.meta.acceptableRanges))

        let po = createPopover(device, data.meta)

        // display it
        si.appendChild(po)
        statusboard.appendChild(si);
    })
}


// make necessary functions available globally under the `$hk.statusboard` prefix
window.$hk.statusboard = {}
$hk.statusboard.update = updateStatusboard


// internal helper functions
function determineStatusIndicatorColour(device, ranges) {
    let colour = "green" // default, if there are no issues
    for (const [quantity, [min, max]] of Object.entries(ranges)) {
        if (device[quantity] == null) {
            colour = "black"
            break
        } else if (device[quantity] <= min || device[quantity] >= max) {
            colour = "red"
        }
    }
    return colour
}

function createPopover(device, meta) {
    let po = document.createElement("div")
    po.setAttribute("class", "popover hidden")
    po.innerHTML = '<div class="title"><a href="#" onclick="$hk.loadContent(\'details.html?type=' + meta.deviceType + '&id=' + device.id + '\')" class="details-link">View details</a><h4>' + meta.deviceType + ' #' + device.id + '</h4></div>'

    // add data
    for (const [quantity, value] of Object.entries(device)) {
        if (quantity === "id") { continue } // id is already listed in the header

        let p = document.createElement("p")
        p.textContent = quantity + ": "
        let span = document.createElement("span")
        span.textContent = value || "[null]"
        span.classList.add(determineStatusIndicatorColour(device, Object.fromEntries([[quantity, meta.acceptableRanges[quantity]]])))
        p.appendChild(span)
        po.appendChild(p)
    }

    po.innerHTML += '<div class="po-arrow" data-popper-arrow></div>' // arrow pointing towards statusindicator
    return po
}

var popperInstance = null

function showDetailsPopover(event) {
    const si = event.currentTarget
    const popover = si.querySelector('.popover')
    popover.classList.remove('hidden')
    popperInstance = Popper.createPopper(si, popover, {
        placement: 'bottom',
    })
}

function hideDetailsPopover(event) {
    const si = event.currentTarget
    const popover = si.querySelector('.popover')
    popover.classList.add('hidden')
    popperInstance.destroy()
    popperInstance = null
}

})()