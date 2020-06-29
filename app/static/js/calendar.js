const numDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthNames = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

function setUp() {
    showNames();
    setURL();
    showCalendar();
}

function setURL() {
    document.querySelector(".group-name").href = "/userhome/" + window.location.pathname.split("/")[2] + '/group/' + window.location.pathname.split("/")[4]
}

function showNames() {
    $(".group-name")[0].innerHTML = window.location.pathname.split("/")[4].replace(/-/g, " ");
    $(".group-name")[1].innerHTML = window.location.pathname.split("/")[4].replace(/-/g, " ");
}

function showCalendar() {
    $.ajax({
        url: "/getDates",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4]
        },
        success: function(data) {
            for (let i = 0; i < data.result.length; i++) {
                let year = parseInt(data.result[i].substring(0, 4))
                let month = parseInt(data.result[i].substring(4, 6))
                let day = parseInt(data.result[i].substring(6))
                let monthName = monthNames[month-1]
                if (document.querySelector('#' + monthName + year)) {
                    markDay(year, month, day)
                } else {
                    showMonth(year, month, day)
                }
            }
        }
    });
}

function test(dataresult) {
    for (let i = 0; i < dataresult.length; i++) {
        let year = parseInt(dataresult[i].substring(0, 4))
        let month = parseInt(dataresult[i].substring(4, 6))
        let day = parseInt(dataresult[i].substring(6))
        let monthName = monthNames[month-1]
        if (document.querySelector('#' + monthName + year)) {
            markDay(year, month, day)
        } else {
            showMonth(year, month, day)
        }
    }
}

function showMonth(year, month, day) {
    let monthName = monthNames[month-1]

    let monthWrapper = document.createElement('div')
    monthWrapper.className = "month-wrapper bg-light"
    monthWrapper.id = monthName + year

    let monthHeader = document.createElement('div')
    monthHeader.className = "month-header bg-warning"
    monthWrapper.appendChild(monthHeader)

    let monthLabel = document.createElement('label')
    monthLabel.textContent = monthName + " " + year
    monthHeader.appendChild(monthLabel)

    let daysHeader = document.createElement('div')
    daysHeader.className = "days-header"
    monthWrapper.appendChild(daysHeader)

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    for (let i = 0; i < 7; i++) {
        let dayName = document.createElement('label')
        dayName.textContent = dayNames[i]
        daysHeader.appendChild(dayName)
    }

    let daysWrapper = document.createElement('div')
    daysWrapper.className = "days-wrapper"
    monthWrapper.appendChild(daysWrapper)
    for (let i = 0; i < 6; i++) {
        let weekWrapper = document.createElement('div')
        weekWrapper.className = 'week'
        daysWrapper.appendChild(weekWrapper)
        
        for (let j = 0; j < 7; j++) {
            weekWrapper.appendChild(document.createElement('label'))
        }
    }
    document.querySelector('.calendar-overflow').appendChild(monthWrapper)

    let d = new Date(year + "-" + month + "-" + 1)
    let dayOfWeek = d.getDay()

    //if leap year
    if (month == 2 && year % 4 == 0) {
        numDays = 29
    } else {
        numDays = numDaysInMonths[month-1]
    }

    let allWeeks = document.querySelectorAll('#' + monthName + year + ' .week')
    for (let i = 1; i < numDays+1; i++) {
        let weekNumber = parseInt((dayOfWeek+i-1)/7)
        allWeeks[weekNumber].children[(dayOfWeek+i-1)%7].textContent = i
        allWeeks[weekNumber].children[(dayOfWeek+i-1)%7].className = "day" + i + " text-muted"
    }

    let remaining = 5-parseInt((dayOfWeek+numDays-1)/7)
    for (let i = 5; i > 5-remaining; i--) {
        allWeeks[i].className = "week-disabled"
    }

    markDay(year, month, day)
}

function markDay(year, month, day) {
    let monthName = monthNames[month-1]
    let dayLabel = document.querySelector('#' + monthName + year + ' .day' + day)
    let weekWrapper = dayLabel.parentNode
    dayLabel.className = "day" + day
    
    if (typeof weekWrapper.onclick != "function") {
        weekWrapper.setAttribute('data-url', year + "-" + month + "-" + day)
        weekWrapper.onclick = function() {
            location.href = location.pathname + "/" + this.dataset.url
            console.log(this.dataset.url)
        }
        weekWrapper.style.cursor = "pointer"
    } else {
        weekWrapper.setAttribute('data-url', weekWrapper.dataset.url + "-" + day)
    }
}