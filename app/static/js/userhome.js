function setUp() {
    showUsername();
    showGroups();
}

function showUsername() {
    let username = window.location.pathname.split("/")[2];
    $(".username")[0].innerHTML = username;
    $(".username")[1].innerHTML = "Hi " + username;
}


function showGroups() {

    console.log("loaded page, sending ajax request to /getGroups")
    let split = window.location.pathname.split("/")
    let username = split[2]
    console.log("split: " + split + "   username: " + username)

    $.ajax({
        url: "/getGroups",
        type: "POST",
        data: {
            username: username
        },
        dataType: 'JSON',

        success: function(data){
            console.log("success " + data.result)
            let numGroups = data.result.length
            if(numGroups == 0) {
                let listGroupItem = document.createElement('a')
                listGroupItem.className = "list-group-item default-list-item"
                listGroupItem.textContent = "You have no groups."
                document.querySelector('.list-group').appendChild(listGroupItem)
            } else {
                for (let i = 0; i < numGroups; i++) {
                    let dataOrder = i + 1
                    let groupName = data.result[i][0]
                    let numStudents = data.result[i][1]
            
                    let listGroupItem = document.createElement('a')
                    listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"
                
                    let overlapContainer = document.createElement('div')
                    overlapContainer.className = "overlap-container"
                    listGroupItem.appendChild(overlapContainer)
                
                    let groupWrapper = document.createElement('div')
                    groupWrapper.className = "group-wrapper"
                    overlapContainer.appendChild(groupWrapper)
                
                    let groupText = document.createElement('div')
                    groupText.className = "group-text"
                    groupText.onclick = function () {redirect(groupName)}
                    groupWrapper.appendChild(groupText)
                
                    let groupNameHeader = document.createElement('h5')
                    groupNameHeader.textContent = groupName
                    groupText.appendChild(groupNameHeader)
                
                    let numMembers = document.createElement('small')
                    numMembers.textContent = numStudents + " students"
                    groupText.appendChild(numMembers)
                
                    let valignWrapper = document.createElement('div')
                    valignWrapper.className = "valign-wrapper"
                    groupWrapper.appendChild(valignWrapper)
                
                    let deleteButton = document.createElement('button')
                    deleteButton.className = "delete-group bg-light"
                    deleteButton.setAttribute('data-order', dataOrder)
                    deleteButton.onclick = function() {displayConfirmation(this.getAttribute('data-order'))}
                    valignWrapper.appendChild(deleteButton)
                
                    let deleteConfirmation = document.createElement('div')
                    deleteConfirmation.className = "delete-confirmation"
                    overlapContainer.appendChild(deleteConfirmation)
                
                    let areYouSure = document.createElement('h5')
                    areYouSure.textContent = "Are you sure?"
                    deleteConfirmation.appendChild(areYouSure)
                
                    let choiceWrapper = document.createElement('div')
                    choiceWrapper.className = "choice-wrapper"
                    deleteConfirmation.appendChild(choiceWrapper)
                
                    let choice1 = document.createElement('button')
                    choice1.className = "choice-button bg-success"
                    choice1.setAttribute('data-order', dataOrder)
                    choice1.onclick = function() {deleteGroup(this.getAttribute('data-order'))}
                    choiceWrapper.appendChild(choice1)
                
                    let check = document.createElement('i')
                    check.className = "material-icons"
                    check.textContent = "check"
                    choice1.appendChild(check)
                
                    let choice2 = document.createElement('button')
                    choice2.className = "choice-button bg-danger"
                    choice2.setAttribute('data-order', dataOrder)
                    choice2.style.marginLeft = "4px"
                    choice2.onclick = function() {closeConfirmation(this.getAttribute('data-order'))}
                    choiceWrapper.appendChild(choice2)
                
                    let close = document.createElement('i')
                    close.className = "material-icons"
                    close.textContent = "close"
                    choice2.appendChild(close)
                
                    let listGroup = document.querySelector('.list-group')
                    listGroup.appendChild(listGroupItem)
                }
            }
        }
    });
}

function redirect(groupname) {
    window.location.pathname += "/group/" + groupname
}

function displayConfirmation(order) {
    let overlapContainer = document.querySelectorAll('.overlap-container')[order-1]
    let group = overlapContainer.children[0]
    let confirmation = overlapContainer.children[1]
    group.style.visibility = "hidden"
    confirmation.style.visibility = "visible"
}

function closeConfirmation(order) {
    let overlapContainer = document.querySelectorAll('.overlap-container')[order-1]
    let group = overlapContainer.children[0]
    let confirmation = overlapContainer.children[1]
    group.style.visibility = "visible"
    confirmation.style.visibility = "hidden"
}

function deleteGroup(order) {
    let listItem = document.querySelectorAll('.list-group-item')[order-1]
    if (document.querySelector('.group-name-input') && order == document.querySelectorAll('.list-group-item').length) {
        document.querySelector('.add-content-button').removeAttribute('disabled')
    } else {
        let groupName = document.querySelectorAll(".group-text h5")[order-1].textContent
        //Ajax request here
        $.ajax({
            url: '/deleteGroup',
            type: 'POST',
            data: {
                username: window.location.pathname.split("/")[2],
                groupname: groupName
            },
            dataType: 'JSON',

            success: function(data) {
                // data.result
                // if success then remove the element
                // if not success still delete the element
                console.log(data.result)
            }
        });
    }
    listItem.parentNode.removeChild(listItem)

    let deleteList = document.querySelectorAll('.delete-group')
    let choicesList = document.querySelectorAll('.choice-wrapper')
    for (let i = order-1; i < deleteList.length; i++) {
        deleteList[i].setAttribute("data-order", String(i+1))
        choicesList[i].children[0].setAttribute("data-order", String(i+1))
        choicesList[i].children[1].setAttribute("data-order", String(i+1))
    }

    if(document.querySelector('.list-group').children.length == 0) {
        let listGroupItem = document.createElement('a')
        listGroupItem.className = "list-group-item default-list-item"
        listGroupItem.textContent = "You have no groups."
        document.querySelector('.list-group').appendChild(listGroupItem)
    }
}

function createGroup() {
    let defaultItem = document.querySelector('.default-list-item')
    if(defaultItem) {
        defaultItem.parentNode.removeChild(defaultItem)
    }
    let dataOrder = document.querySelectorAll('.list-group-item').length + 1

    let listGroupItem = document.createElement('a')
    listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"

    let overlapContainer = document.createElement('div')
    overlapContainer.className = "overlap-container"
    listGroupItem.appendChild(overlapContainer)

    let groupWrapper = document.createElement('div')
    groupWrapper.className = "group-wrapper"
    overlapContainer.appendChild(groupWrapper)

    let groupText = document.createElement('div')
    groupText.className = "group-text"
    groupWrapper.appendChild(groupText)

    let groupNameForm = document.createElement('div')
    groupNameForm.className = "group-name-input"
    groupText.appendChild(groupNameForm)

    let groupNameWrapper = document.createElement('div')
    groupNameWrapper.className = "form-group"
    groupNameForm.appendChild(groupNameWrapper)

    let formStatus = document.createElement('label')
    formStatus.className = "text-danger form-status"
    formStatus.style.display = "none"
    groupNameWrapper.appendChild(formStatus)

    let groupNameInput = document.createElement('input')
    groupNameInput.className = "form-control group-name"
    groupNameInput.placeholder = "Group Name:"
    groupNameInput.onkeyup = function(e) {
        if(e.key === "Enter") {
            nameGroup()
        }
    }
    groupNameWrapper.appendChild(groupNameInput)

    let numMembers = document.createElement('small')
    numMembers.textContent = "0 students"
    groupText.appendChild(numMembers)

    let valignWrapper = document.createElement('div')
    valignWrapper.className = "valign-wrapper"
    groupWrapper.appendChild(valignWrapper)

    let deleteButton = document.createElement('button')
    deleteButton.className = "delete-group bg-light"
    deleteButton.setAttribute('data-order', dataOrder)
    deleteButton.onclick = function() {displayConfirmation(this.getAttribute('data-order'))}
    valignWrapper.appendChild(deleteButton)

    let deleteConfirmation = document.createElement('div')
    deleteConfirmation.className = "delete-confirmation"
    overlapContainer.appendChild(deleteConfirmation)

    let areYouSure = document.createElement('h5')
    areYouSure.textContent = "Are you sure?"
    deleteConfirmation.appendChild(areYouSure)

    let choiceWrapper = document.createElement('div')
    choiceWrapper.className = "choice-wrapper"
    deleteConfirmation.appendChild(choiceWrapper)

    let choice1 = document.createElement('button')
    choice1.className = "choice-button bg-success"
    choice1.setAttribute('data-order', dataOrder)
    choice1.onclick = function() {deleteGroup(this.getAttribute('data-order'))}
    choiceWrapper.appendChild(choice1)

    let check = document.createElement('i')
    check.className = "material-icons"
    check.textContent = "check"
    choice1.appendChild(check)

    let choice2 = document.createElement('button')
    choice2.className = "choice-button bg-danger"
    choice2.setAttribute('data-order', dataOrder)
    choice2.style.marginLeft = "4px"
    choice2.onclick = function() {closeConfirmation(this.getAttribute('data-order'))}
    choiceWrapper.appendChild(choice2)

    let close = document.createElement('i')
    close.className = "material-icons"
    close.textContent = "close"
    choice2.appendChild(close)

    let listGroup = document.querySelector('.list-group')
    listGroup.appendChild(listGroupItem)

    document.querySelector('.add-content-button').setAttribute('disabled', true)
}

function nameGroup() {
    let username = window.location.pathname.split("/")[2]
    let groupName = document.querySelector('.group-name').value
    let formStatus = document.querySelector('.form-status')
    if(groupName.includes('_')) {
        formStatus.style.display = "block"
        formStatus.textContent = "Group name cannot includes _"
    } else {

        $.ajax({
            url: '/createGroup',
            type: 'POST',
            dataType: 'JSON',
            data: {
                username: username,
                groupname: groupName
            },
            success: function(data){
                if(data.result == "success") {
                    let groupNameForm = document.querySelector('.group-name-input')
                    let groupTextWrapper = groupNameForm.parentNode
        
                    groupTextWrapper.onclick = function() {redirect(groupName)}
                    groupTextWrapper.removeChild(groupNameForm)
        
                    let groupNameHeader = document.createElement('h5')
                    groupNameHeader.textContent = groupName
                    groupTextWrapper.insertBefore(groupNameHeader, groupTextWrapper.childNodes[0])
        
                    document.querySelector('.add-content-button').removeAttribute('disabled')
                } else {
                    formStatus.style.display = "block"
                    formStatus.textContent = data.result
                }
            }
        });

    }
}
