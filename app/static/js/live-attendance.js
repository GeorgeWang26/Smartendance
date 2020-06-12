let d = new Date()
let monthInt = d.getMonth()
let day = d.getDate()
let year = d.getFullYear()


let newMonthInt, newDay

newMonthInt = monthInt + 1

if (newMonthInt < 10) {
    newMonthInt = "0" + newMonthInt
} else {
    newMonthInt = "" + newMonthInt
}

if (day < 10) {
    newDay = "0" + day
} else {
    newDay = "" + day
}

let date = year + newMonthInt + newDay

console.log(date, year, newMonthInt, newDay)

function setUp() {
    $(".group-name")[0].innerHTML = window.location.pathname.split("/")[4];
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
                window.location.pathname = window.location.pathname.substring(0, window.location.pathname.length-4) + "capture/" + date
            }
        })
    })
    
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
                    let memberName = data.result[i][0]
            
                    let listGroupItem = document.createElement('a')
                    listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"
                    listGroupItem.id = memberName
            
                    let itemWrapper = document.createElement('div')
                    itemWrapper.className = "item-wrapper"
                    listGroupItem.appendChild(itemWrapper)
            
                    let memberInfo = document.createElement('label')
                    memberInfo.className = "member-name"
                    memberInfo.textContent = memberName.replace(/-/g, " ")
                    itemWrapper.appendChild(memberInfo)
            
                    let attendanceStatus = document.createElement('label')
                    attendanceStatus.className = "attendance-status"
                    attendanceStatus.textContent = "-"
                    itemWrapper.appendChild(attendanceStatus)
            
                    let listGroup = document.querySelector('.list-group')
                    listGroup.appendChild(listGroupItem)
                }
            }
            update()
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
            // console.log(data.result)
            let buttons = document.querySelectorAll('input[type="radio"]')
            if(typeof(data.result) != "string") {
                // console.log(data.result.date)
                console.log('result    ' + data.result.status)
                buttons[0].removeAttribute('disabled')
                buttons[1].removeAttribute('disabled')
                buttons[2].removeAttribute('disabled')
                if(data.result.status == 'P') {
                    console.log('P')
                    buttons[0].setAttribute('checked', true)
                    buttons[1].removeAttribute('checked')
                    buttons[2].removeAttribute('checked')
                } else if (data.result.status == 'L') {
                    console.log('L')
                    buttons[0].removeAttribute('checked')
                    buttons[0].setAttribute('disabled', true)
                    buttons[1].setAttribute('checked', true)
                    buttons[2].removeAttribute('checked')
                } else {
                    console.log('A')
                    buttons[0].removeAttribute('checked')
                    buttons[0].setAttribute('disabled', true)
                    buttons[1].removeAttribute('checked')
                    buttons[1].setAttribute('disabled', true)
                    buttons[2].setAttribute('checked', true)
                    buttons[2].setAttribute('disabled', true)
                }
                let listMembers = data.result.members
                for (let i = 0; i < listMembers.length; i++) {
                    let member = listMembers[i]
                    document.querySelector('#' + member.name).children[0].children[1].textContent = member.attendance
                }
            } else {
                buttons[0].setAttribute('disabled', true)
                buttons[1].setAttribute('disabled', true)
                buttons[2].setAttribute('disabled', true)
                buttons[0].removeAttribute('checked')
                buttons[1].removeAttribute('checked')
                buttons[2].removeAttribute('checked')
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

            // if (data.result == "success") {
            //     window.location.href = window.location.pathname.substring(0, window.location.pathname.length-5)
            // }
        }
    });
}


setInterval(update, 10000)