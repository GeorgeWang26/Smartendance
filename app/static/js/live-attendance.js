let d = new Date()
let monthInt = d.getMonth()
let day = d.getDate()
let year = d.getFullYear()


let newMonthInt, newDay
if (monthInt < 10) {
    newMonthInt = "0" + monthInt
} else {
    newMonthInt = "" + monthInt
}

if (day < 10) {
    newDay = "0" + newDay
} else {
    newDay = "" + newDay
}

let date = year + newMonthInt + newDay

function setUp() {
    getTimestamp()
    setURL()
    showMembers()
}

function setURL() {
    let capture = document.querySelector('.capture-button')
    capture.addEventListener('click', function() {
        $.ajax({
            url: "/newAttendance",
            type: "POST",
            dataType: "JSON",
            data: {
                username: window.location.pathname.split("/")[2],
                groupname: window.location.pathname.split("/")[4],
                date: date
            },
            success: function(data){
                console.log(data.result)
            }
        })
    })
    let captureURL = window.location.pathname.substring(0, window.location.pathname.length-4) + "capture"
    capture.href = captureURL
}

function showMembers() {
    $.ajax({
        url: "/getMembers",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4]
        },
        success: function(data){
            console.log(data.result)
            let numMembers = data.result.length
            if (numMembers == 0) {
                let listGroupItem = document.createElement('a')
                listGroupItem.className = "list-group-item default-list-item"
                listGroupItem.textContent = "You have no members."
                document.querySelector('.list-group').appendChild(listGroupItem)
            } else {
                for(let i = 0; i < numMembers; i++) {
                    let memberName = data.result[i][0].replace(/-/g, " ")
            
                    let listGroupItem = document.createElement('a')
                    listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"
                    listGroupItem.id = memberName
            
                    let itemWrapper = document.createElement('div')
                    itemWrapper.className = "item-wrapper"
                    listGroupItem.appendChild(itemWrapper)
            
                    let memberInfo = document.createElement('label')
                    memberInfo.className = "member-name"
                    memberInfo.textContent = memberName
                    itemWrapper.appendChild(memberInfo)
            
                    let attendanceStatus = document.createElement('label')
                    attendanceStatus.className = "attendance-status"
                    attendanceStatus.textContent = "-"
                    itemWrapper.appendChild(attendanceStatus)
            
                    let listGroup = document.querySelector('.list-group')
                    listGroup.appendChild(listGroupItem)
                }
            }
        }
    });
}

function update() {
    $.ajax({
        url: "/liveUpdate",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4],
            date: date
        },
        success: function(data){
            console.log(date.result)
            let listMembers = data.result.members
            for (let i = 0; i < listMembers.length; i++) {
                let member = listMembers[i]
                document.querySelector('#' + member.name).children[0].children[1].textContent = member.attendance
            }
        }
    });
}

function getTimestamp() {
    let timestamp = document.querySelector('.date')

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
        
    timestamp.textContent = month + " " + day + " " + year
}

function changeStatus(status, number) {
    if (!document.querySelectorAll('.set-presence-wrapper input')[number].checked && !document.querySelectorAll('.set-presence-wrapper input')[number].disabled) {
        $.ajax({
            url: "/changeAttendanceStatus",
            type: "POST",
            dataType: "JSON",
            data: {
                username: window.location.pathname.split("/")[2],
                groupname: window.location.pathname.split("/")[4],
                date: date,
                status: status
            },
            success: function(data){
                console.log(data.result)
                if (number == 2) {
                    endAttendance()
                    update()
                }
            }
        });
    }
}

function endAttendance() {
    console.log('end attendance')
    let saveButton = document.querySelector('.save-button')
    saveButton.removeAttribute('disabled')
    saveButton.className += " text-success"
    saveButton.onclick = function() {saveData()}
    saveButton.style.cursor = "pointer"
    let container = document.querySelector('.set-presence-wrapper')
    for (let i = 0; i < container.children.length; i++) {
        container.children[i].setAttribute('disabled', true)
    }
    container.children[0].removeAttribute('checked')
    container.children[4].setAttribute('checked', true)
}

function saveData() {
    window.location.href = window.location.pathname.substring(0, window.location.pathname.length-5)
}

function discardData() {
    //AJAX request for discard here
    $.ajax({
        url: "/discardAttendance",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4],
            date: date
        },
        success: function(data){
            console.log(data.result)
            if (data.result == "success") {
                window.location.href = window.location.pathname.substring(0, window.location.pathname.length-5)
            }
        }
    });
}