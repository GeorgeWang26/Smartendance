function getTimestamp() {
    let d = new Date()
    let timestamp = document.querySelector('.date')

    let monthInt = d.getMonth()

    let month
    switch(monthInt) {
        case 0:
            month = "Jan"
            break;
        case 1:
            month = "Feb"
            break;
        case 2:
            month = "Mar"
            break;
        case 3:
            month = "Apr"
            break;
        case 4:
            month = "May"
            break;
        case 5:
            month = "Jun"
            break;
        case 6:
            month = "Jul"
            break;
        case 7:
            month = "Aug"
            break;
        case 8:
            month = "Sep"
            break;
        case 9:
            month = "Oct"
            break;
        case 10:
            month = "Nov"
            break;
        case 11:
            month = "Dec"
            break;
    }
        
    timestamp.textContent = month + " " + d.getDate() + " " + d.getFullYear()
}

function endAttendance() {
    document.querySelector('.save-button').removeAttribute('disabled')
    let container = document.querySelector('.set-presence-wrapper')
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].setAttribute('disabled', true)
    }
    container.children[0].removeAttribute('checked')
    container.children[4].setAttribute('checked', true)
}