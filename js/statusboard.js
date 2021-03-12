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
        si.classList.add(determineStatus(device, data.meta.acceptableRanges))

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
function determineStatus(device, ranges) {
    let status = "ok" // default, if there are no issues
    for (const [quantity, [min, max]] of Object.entries(ranges)) {
        if (device[quantity] == null) {
            status = "error"
            break
        } else if (device[quantity] <= min || device[quantity] >= max) {
            status = "warning"
        }
    }
    return status
}

function createPopover(device, meta) {
    let po = document.createElement("div")
    po.setAttribute("class", "popover hidden")
    po.innerHTML = '<div class="title"><a href="#" onclick="$hk.loadContent(\'details.html?type=' + meta.deviceType + '&id=' + device.id + '\')" class="details-link">View details</a><h4>' + meta.deviceType + ' #' + device.id + '</h4></div>'

    // add data
    for (const [quantity, value] of Object.entries(device)) {
        if (quantity === "id") { continue } // id is already listed in the header
        if (quantity.startsWith("rx") || quantity.startsWith("tx")) { continue } // don't display too much detail or popover will get unwieldy

        let p = document.createElement("p")
        p.textContent = quantity + ": "
        let span = document.createElement("span")
        span.textContent = value + (meta.units[quantity] || "")
        if (meta.acceptableRanges.hasOwnProperty(quantity)) {
            span.classList.add(determineStatus(device, Object.fromEntries([[quantity, meta.acceptableRanges[quantity]]])))
        }
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
        modifiers: [{ name: 'offset', options: { offset: [0, -1]}}]
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