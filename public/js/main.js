Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var dragSrcEl = null;

var Singleton = (function (a) {
    var projectsUrl = '/api/projects';
    var itemsUrl = '/api/items';

    function sendRequest() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', projectsUrl);
        xhr.onload = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                a(JSON.parse(xhr.responseText));
            } else {
                console.log(xhr.status + ': ' + xhr.statusText);
            }
        };
        xhr.send(null);
    }

    return {
        getProjects: function () {
            sendRequest();
        },
        projectsUrl: projectsUrl,
        itemsUrl: itemsUrl
    }
})(fillProjects);

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    Singleton.getProjects();
}

function fillProjects(data) {
    var parent = document.getElementById('left-content').firstElementChild;
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    data.forEach(function (item, i, arr) {
        var a = document.createElement('a');
        a.setAttribute('class', 'list-group-item');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('data-id', item.id);
        a.addEventListener('click', function () {
            showItems(a.getAttribute('data-id'))
        });
        parent.appendChild(a);
        a.innerHTML = item.name;
    });
    var div = document.getElementById('inputProject');
    if (div) {
        div.outerHTML = '';
        delete div;
    }
    var div = document.createElement('div');
    div.setAttribute('class', 'form-group');
    div.setAttribute('id', 'inputProject');
    document.getElementById('left-content').appendChild(div);
    var input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.setAttribute('name', 'projectName');
    input.setAttribute('placeholder', 'New Project');
    input.setAttribute('type', 'text');
    div.appendChild(input);
    var button = document.getElementById('addProject');
    if (button) {
        button.outerHTML = "";
        delete button;
    }
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-success btn-number');
    button.setAttribute('id', 'addProject');
    button.setAttribute('data-type', 'plus');
    button.addEventListener('click', function () {
        createProject()
    });
    document.getElementById('left-content').appendChild(button);
    var span = document.createElement('span');
    span.setAttribute('class', 'glyphicon glyphicon-plus');
    button.appendChild(span);
}

function fillItems(data, projectId) {
    var parent = document.getElementById('right-content').firstElementChild;
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    data.forEach(function (item, i, arr) {
        var parentDiv = document.createElement('div');
        parent.appendChild(parentDiv);
        var div = document.createElement('div');
        div.setAttribute('class', 'list-group-item');
        div.setAttribute('data-id', item.id);
        div.setAttribute('data-priority', item.priority);
        div.setAttribute('data-projectid', item.project_id);
        parentDiv.appendChild(div);
        div.innerHTML = item.name;

        createButton('danger', 'delete', item, 'trash', div)
        createButton('success', 'edit', item, 'pencil', div)

    });
    var div = document.getElementById('inputItem');
    if (div) {
        div.outerHTML = '';
        delete div;
    }
    var div = document.createElement('div');
    div.setAttribute('id', 'inputItem');
    div.setAttribute('class', 'form-group');
    document.getElementById('right-content').appendChild(div);
    var input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.setAttribute('name', 'itemName');
    input.setAttribute('placeholder', 'New Item');
    input.setAttribute('type', 'text');
    div.appendChild(input);
    var button = document.getElementById('addItem');
    if (button) {
        button.outerHTML = '';
        delete button;
    }
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-success btn-number');
    button.setAttribute('id', 'addItem');
    button.setAttribute('data-type', 'plus');
    button.setAttribute('data-attr', projectId);
    button.addEventListener('click', function () {
        createItem(this.getAttribute('data-attr'))
    });
    document.getElementById('right-content').appendChild(button);
    var span = document.createElement('span');
    span.setAttribute('class', 'glyphicon glyphicon-plus');
    button.appendChild(span);

    sortable(document.getElementById('list-group'));
}

function showItems(projectId) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', Singleton.itemsUrl + '/' + projectId + '/items');
    xhr.onload = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            fillItems(JSON.parse(xhr.responseText), projectId);
        } else {
            console.log(xhr.status + ': ' + xhr.statusText);
        }
    };
    xhr.send(null);
}

function createButton(className, target, item, icon, parent) {
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-' + className + ' btn-xs');
    button.setAttribute('id', className + '_' + item.id);
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', '#' + target);
    button.setAttribute('data-attr', item.id);
    button.style.float = 'right';
    button.addEventListener('click', function () {
        listenFunc(this, this.getAttribute('data-attr'), target)
    });
    parent.appendChild(button);
    var span = document.createElement('span');
    span.setAttribute('class', 'glyphicon glyphicon-' + icon);
    button.appendChild(span);
}

function createProject() {
    var name = document.querySelector('[name=projectName]').value;
    if (name != '') {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Singleton.projectsUrl, true);
        var params = "name=" + name;
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                fillProjects(JSON.parse(xhr.responseText));
            } else {
                console.log(xhr.status + ': ' + xhr.statusText);
            }
        };
        xhr.send(params);
    }
}

function createItem(projectId) {
    var name = document.querySelector('[name=itemName]').value;
    if (name != '') {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Singleton.itemsUrl + '/' + projectId + '/items', true);
        var params = "name=" + name + "&project_id=" + projectId;
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                fillItems(JSON.parse(xhr.responseText), projectId);
            } else {
                console.log(xhr.status + ': ' + xhr.statusText);
            }
        };
        xhr.send(params);
    }
}

function listenFunc(_this, id, method) {
    if (method == 'edit') {
        var name = _this.parentNode.innerText;
        var priority = _this.parentNode.getAttribute('data-priority');
        var projectId = _this.parentNode.getAttribute('data-projectid');
        document.getElementById('updateName').value = name;

        var old_element = document.getElementById("editSubmit");
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);

        document.getElementById('editSubmit').addEventListener('click', function () {
            editRequest(id, name, priority, projectId)
        }, false);
    }
    if (method == 'delete') {
        var projectId = _this.parentNode.getAttribute('data-projectid');

        var old_element = document.getElementById("deleteSubmit");
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);

        document.getElementById('deleteSubmit').addEventListener('click', function () {
            deleteRequest(id, projectId)
        }, false);
    }

}

function editRequest(id, name, priority, projectId) {
    var newName = document.getElementById('updateName').value;
    console.log(newName, id)
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', Singleton.itemsUrl + '/' + id, true);
    var params = "name=" + newName + "&priority=" + priority;
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            fillItems(JSON.parse(xhr.responseText), projectId);
        } else {
            console.log(xhr.status + ': ' + xhr.statusText);
        }
    };
    xhr.send(params);
}

function deleteRequest(id,projectId) {
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', Singleton.itemsUrl + '/' + id, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            fillItems(JSON.parse(xhr.responseText), projectId);
        } else {
            console.log(xhr.status + ': ' + xhr.statusText);
        }
    };
    xhr.send(null);
}

function update() {
    var list = document.getElementById("right-content").getElementsByClassName("list-group-item");
    [].forEach.call(list, function (col, i, arr) {
        var id = col.getAttribute('data-id');
        var projectId = col.getAttribute('data-projectid');
        var name = col.innerText;
        console.log('data-id: ' + id);
        console.log('i: ' + (i + 1));
        var priority = i + 1;

        var xhr = new XMLHttpRequest();
        xhr.open('PUT', Singleton.itemsUrl + '/' + id, true);
        var params = "name=" + name + "&priority=" + priority;
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                fillItems(JSON.parse(xhr.responseText), projectId);
            } else {
                console.log(xhr.status + ': ' + xhr.statusText);
            }
        };
        xhr.send(params);
    });
    //    for (var i = 0; i < list.length; ++i) {
    //        var id = list[i].getAttribute('data-id');
    //        console.log(id);
    //    }
}

function sortable(rootEl) {
    var cols = rootEl.children;
    [].forEach.call(cols, function (col) {
        col.draggable = true;
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragenter', handleDragEnter, false)
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
    });

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (dragSrcEl != this) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }
        return false;
    }

    function handleDragEnd(e) {
        [].forEach.call(cols, function (col) {
            col.classList.remove('over');
        });
        update();
    }
}
