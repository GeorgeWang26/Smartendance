function setUp() {
    showNames();
    showMembers();
}


function showNames() {
    $(".group-name")[0].innerHTML = window.location.pathname.split("/")[4];
    $(".group-name")[1].innerHTML = window.location.pathname.split("/")[4];
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
            if(numMembers == 0) {
                let listGroupItem = document.createElement('a')
                listGroupItem.className = "list-group-item default-list-item"
                listGroupItem.textContent = "You have no members."
                document.querySelector('.list-group').appendChild(listGroupItem)
            } else {
                for(let i = 0; i < numMembers; i++) {
                    let dataOrder = i + 1
                    let newMemberName = data.result[i][0]
                    let imageURI = data.result[i][1]
            
                    let listGroupItem = document.createElement('a')
                    listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"
            
                    let overlapContainer = document.createElement('div')
                    overlapContainer.className = "overlap-container"
                    listGroupItem.appendChild(overlapContainer)
            
                    let groupWrapper = document.createElement('div')
                    groupWrapper.className = "group-wrapper"
                    overlapContainer.appendChild(groupWrapper)
            
                    let memberInfo = document.createElement('div')
                    memberInfo.className = "member-info"
                    groupWrapper.appendChild(memberInfo)
            
                    let memberPhoto = document.createElement('img')
                    memberPhoto.className = "member-picture"
                    memberPhoto.src = imageURI
                    memberInfo.appendChild(memberPhoto)
            
                    let memberName = document.createElement('h5')
                    memberName.textContent = newMemberName
                    memberInfo.appendChild(memberName)
            
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
                    choice1.onclick = function() {deleteMember(this.getAttribute('data-order'))}
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

function useWebcam() {
    let video = document.querySelector('#webcam-view')
    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({video:true})
            .then(function (stream) {
                video.srcObject = stream
                $('#addMember').on('hidden.bs.modal', function (e) {
                    stream.getVideoTracks()[0].stop()
                })
            })
            .catch(function (error) {
                console.log(error)
            })
    }
}

function takePhoto() {
    let canvas = document.createElement('canvas');
    let video = document.querySelector('#webcam-view');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').transform(-1, 0, 0, 1, video.videoWidth, 0);
    canvas.getContext('2d').drawImage(video, 0, 0);  
    
    let resultURI = canvas.toDataURL('image/jpeg');
    document.querySelector('#webcam-result').src = resultURI
    
    useWebcamButton = document.querySelector('.closing-options')
    useWebcamButton.removeAttribute('disabled')

    let webcam = document.querySelector('.webcam')
    let webcamResult = document.querySelector('.webcam-result')
    webcam.style.visibility = "hidden"
    webcamResult.style.visibility = "visible"
}

function retakePhoto() {
    useWebcamButton = document.querySelector('.closing-options')
    useWebcamButton.setAttribute('disabled', true)

    let webcam = document.querySelector(".webcam")
    let webcamResult = document.querySelector('.webcam-result')
    webcam.style.visibility = "visible"
    webcamResult.style.visibility = "hidden"
}

function showImageName() {
    document.querySelector('.filename').textContent = document.querySelector('.input-file').files[0].name

    useFilesButton = document.querySelectorAll('.closing-options')[1]
    useFilesButton.removeAttribute('disabled')
}

function chooseFiles() {
    let memberName = document.querySelector('.name-input').value

    if(memberName == "") {
        document.querySelector('.invalid-feedback').style.display = "block"
        document.querySelector('.form-control').className += " is-invalid"
    } else {
        let file = document.querySelector('.input-file').files[0]
        let reader = new FileReader()
        reader.readAsDataURL(file)
    
        reader.addEventListener("load", function () {
            addMember(reader.result, memberName)
        }, false);
    }
}

function chooseWebcam() {
    let memberName = document.querySelector('.name-input').value
    if(memberName == "") {
        document.querySelector('.invalid-feedback').style.display = "block"
        document.querySelector('.form-control').className += " is-invalid"
    } else {
        let imageURI = document.querySelector('#webcam-result').src
        addMember(imageURI, memberName)
    }
}

function displayConfirmation(order) {
    let overlapContainer = document.querySelectorAll('.overlap-container')[order-1]
    let member = overlapContainer.children[0]
    let confirmation = overlapContainer.children[1]
    member.style.visibility = "hidden"
    confirmation.style.visibility = "visible"
}

function closeConfirmation(order) {
    let overlapContainer = document.querySelectorAll('.overlap-container')[order-1]
    let member = overlapContainer.children[0]
    let confirmation = overlapContainer.children[1]
    member.style.visibility = "visible"
    confirmation.style.visibility = "hidden"
}

function deleteMember(order) {

    let fullList = document.querySelectorAll('.list-group-item')
    let listItem = fullList[order-1]
    let memberName = document.querySelectorAll('.member-info h5')[order-1].textContent

    $.ajax({
        url: "/removeMember",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4],
            membername: memberName
        },
        success: function(data) {
            console.log("db result: " + data.dbResult + "   aws result: " + data.awsResult)
        }
    });

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
        listGroupItem.textContent = "You have no members."
        document.querySelector('.list-group').appendChild(listGroupItem)
    }
}

function addMember(imageURI, newMemberName) {

    $.ajax({
        url: "/newMember",
        type: "POST",
        dataType: "JSON",
        data: {
            username: window.location.pathname.split("/")[2],
            groupname: window.location.pathname.split("/")[4],
            imageURL: imageURI,
            membername: newMemberName
        },
        success: function(data) {
            if(data.result == "success") {
                $('#addMember').modal('hide')

                let dataOrder = document.querySelectorAll('.list-group-item').length + 1

                let listGroupItem = document.createElement('a')
                listGroupItem.className = "list-group-item list-group-item-action flex-column align-items-start"

                let overlapContainer = document.createElement('div')
                overlapContainer.className = "overlap-container"
                listGroupItem.appendChild(overlapContainer)

                let groupWrapper = document.createElement('div')
                groupWrapper.className = "group-wrapper"
                overlapContainer.appendChild(groupWrapper)

                let memberInfo = document.createElement('div')
                memberInfo.className = "member-info"
                groupWrapper.appendChild(memberInfo)

                let memberPhoto = document.createElement('img')
                memberPhoto.className = "member-picture"
                memberPhoto.src = imageURI
                memberInfo.appendChild(memberPhoto)

                let memberName = document.createElement('h5')
                memberName.textContent = newMemberName
                memberInfo.appendChild(memberName)

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
                choice1.onclick = function() {deleteMember(this.getAttribute('data-order'))}
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

                let defaultItem = document.querySelector('.default-list-item')
                if(defaultItem) {
                    defaultItem.parentNode.removeChild(defaultItem)
                }

                let listGroup = document.querySelector('.list-group')
                listGroup.appendChild(listGroupItem)

            } else {
                // show the error message here
                let formStatus = document.querySelector('.form-status')
                formStatus.style.display = "block"
                formStatus.textContent = data.result
            }
        }
    });
}