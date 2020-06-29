const numDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

let dates = []

function convertString(numberInt) {
    let newNumber
    if (numberInt < 10) {
        newNumber = "0" + numberInt
    } else {
        newNumber = String(numberInt)
    }
    return newNumber
}

function setUp() {
    document.querySelector('.group-name').innerHTML = window.location.pathname.split("/")[4].replace(/-/g, " ")
    setURL()
    getDates()
    showMembers()
}

function setURL() {
    document.querySelector(".group-name").href = "/userhome/" + window.location.pathname.split("/")[2] + '/group/' + window.location.pathname.split("/")[4]
    document.querySelector(".calendar-url").href = "/userhome/" + window.location.pathname.split("/")[2] + '/group/' + window.location.pathname.split("/")[4] + '/calendar'
}

function getDates() {
    let urlParts = window.location.pathname.split("/")[6].split("-")
    year = parseInt(urlParts[0])
    month = parseInt(urlParts[1])
    days = urlParts.slice(2)
    document.querySelector('.month').innerHTML = monthNames[month-1]
    for (let i = 0; i < days.length; i++) {
        days[i] = parseInt(days[i])
    }
    
    for (let i = 0; i < days.length; i++) {
        dates[i] = year + convertString(month) + convertString(days[i])
    }

    let dateObject = new Date(year + "-" + month + "-" + days[0])
    let dayOfWeek = dateObject.getDay()
    let theDay = days[0]
    let lower, upper = -1
    for (let i = 0; i <= dayOfWeek; i++) {
        let temporaryDay = theDay-i
        console.log(i, temporaryDay, dayOfWeek)
        if (temporaryDay <= 0) {
            lower = dayOfWeek-i+1
            break
        }
        document.querySelector('.dates').children[dayOfWeek-i].textContent = temporaryDay
    }

    for (let i = 1; i < 7-dayOfWeek; i++) {
        let temporaryDay = theDay + i
        if (temporaryDay > numDaysInMonths[month-1]) {
            upper = dayOfWeek+i-1
            break
        }
        document.querySelector('.dates').children[dayOfWeek+i].textContent = temporaryDay
    }

    if (lower > -1) {
        document.querySelector('.date').textContent = monthNames[month-1] + " 1-" + (7-lower)
    } else if (upper > -1) {
        document.querySelector('.date').textContent = monthNames[month-1] + " " + (numDaysInMonths[month-1]-upper) + "-" + numDaysInMonths[month-1]
    } else {
        document.querySelector('.date').textContent = monthNames[month-1] + " " + (days[0]-dayOfWeek) + "-" + (days[0]+(6-dayOfWeek))
    }
}

function showMembers() {
    console.log(dates)
    $.ajax({
        url: "/getWeekAttendance",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4],
            dates: dates.toString()
        },
        success: function(data){
            console.log(data.result)
            let numMembers = data.result.allMembers.length
            for(let i = 0; i < numMembers; i++) {
                let memberName = data.result.allMembers[i]

                let listGroupItem = document.createElement('a')
                listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"
                listGroupItem.id = memberName

                let itemWrapper = document.createElement('div')
                itemWrapper.className = "item-wrapper"
                listGroupItem.appendChild(itemWrapper)

                let memberInfo = document.createElement('label')
                memberInfo.className = "member-name"
                memberInfo.textContent = memberName.replace(/-/g, ' ')
                itemWrapper.appendChild(memberInfo)

                let attendanceWrapper = document.createElement('div')
                attendanceWrapper.className = "attendance-wrapper"
                itemWrapper.appendChild(attendanceWrapper)

                for (let i = 0; i < 7; i++) {
                    let attendanceStatus = document.createElement('label')
                    attendanceStatus.className = "attendance-status"
                    attendanceWrapper.appendChild(attendanceStatus)
                }

                let listGroup = document.querySelector('.list-group')
                listGroup.appendChild(listGroupItem)
            }

            for (let i = 0; i < data.result.allDays.length; i++) {
                let day = String(data.result.allDays[i].date).substring(6)
                markDay(data.result.allDays[i].members, new Date(year + "-" + month + "-" + day).getDay())
            }
        }
    });
}

function markDay(memberList, dayOfWeek) {
    for (let i = 0; i < memberList.length; i++) {
        let member = memberList[i]
        document.querySelector('#' + member.name + " .attendance-wrapper").children[dayOfWeek].textContent = member.attendance
    }
    let allItems = document.querySelectorAll('.attendance-wrapper')
    for (let i = 0; i < allItems.length; i++) {
        allItems[i].children[dayOfWeek].className += " text-success"
    }
}