window.onload = function(){
	buildList = new buildList();
	buildList.buildListStorage();
}
var mainContent = document.getElementById('content');
var wrapper = document.getElementById('wrapper');

// main function for building the list on homepage
var buildList = function(){
    var _build = this;
	var timeToTask;
	var txtToTask;
    var listHolderForm = document.getElementById("checkListForm"),
        listHolder = document.createElement("ul"),
        theList;
    if(listHolderForm){
        listHolder.setAttribute("id", "toDoList");
        listHolderForm.appendChild(listHolder);
    }
	// build the to do list form the local storage
	this.buildListStorage = function(){
		var toDoStorage = window.localStorage.getItem('toDoList');
		//if local storage to do exisits build list
		if(toDoStorage){
			var parseStorage = JSON.parse(localStorage.getItem("toDoList"));
			var toDoLength = parseStorage.length-1;
			//for each item found create the list
			for(var i = 0; i <= toDoLength; i++){
				var theList = document.createElement('li');
				theList.setAttribute('id', "toDo_"+i+"");
				//check if the items are not deleted so wont be shown
				if(parseStorage[i].deleted != 1 && parseStorage[i].finished != 1){
					//fn that checks to do dates/hours/mins
					_build.checkToDoDates(parseStorage[i], timeToTask, txtToTask);
					//build html list of the to dos
					theList.innerHTML += ('<div class="date">'+ timeToTask +'<span>'+ txtToTask +'</span></div>'+
										  '<div class="liContent"><div class="btnHolder">'+
										  '<div class="btn delete" id="delete_'+i+'">Delete</div>'+
										  '<div class="btn expand" id="expand_'+i+'">Expand</div></div>'+
										  '<input type="checkbox" id="check_'+i+'" name="check" class="checkToDo"/>'+
										  '<label for="check_'+i+'">'+parseStorage[i].title+'</label>'+
										  '<div class="clear"><!-- empty --></div>'+
										  '<div class="description" style="display:none" id="descr_'+i+'">'+parseStorage[i].descr+'</div></div>'+
										  '<div class="clear"><!-- empty --></div>'
					);
					listHolder.appendChild(theList);
					var expandBtn = document.getElementById('expand_'+i),
						toDoDelete = document.getElementById('delete_'+i),
						toDoDescr = document.getElementById('descr_'+i),
						checkDone = document.getElementById('check_'+i);
					_build.showHideDescr(expandBtn, toDoDescr);
					removeToDo.deleteToDO(toDoDelete, theList, parseStorage[i].id);
					markAsDone.doneToDo(checkDone, theList, parseStorage[i].id);
				}
			}
		}else{
			//if there is no to do show an message
			theList = document.createElement('li');
			theList.innerHTML = ('<div style="margin-left:76px; padding-top:15px; padding-bottom:15px;">Click on the add new button to create a new to do list</div>');
			listHolder.appendChild(theList);
		}
	}
	//show and hide descr of the to do
    this.showHideDescr = function(btnExpand, who){
		btnExpand.onclick = function(){
			if(who.style.display === 'block'){
				who.style.display = 'none';
			}else{
				who.style.display = 'block';
			}
		}			
    }
	//check dates/hours/mins on the to do list
	this.checkToDoDates = function(mainStorage, timeShow, txtShow){
		var currentTime = new Date(),
			days = currentTime.getDate(),
			hours = currentTime.getHours(),
			mins = currentTime.getMinutes();
			timeToTask = timeShow;
			txtToTask = txtShow;
			
		if(mainStorage.day == ""){
			// increase day if hours it's bigger then 24
			if(mainStorage.hours >= 24){
				timeToTask = Number(Math.round(mainStorage.day + Number(mainStorage.hours / 24)));
				txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min;
			//increase the hour if min == 1 hour
			}else if(mainStorage.min >= 60){
				if(mainStorage.hours >= 24){
					timeToTask = Number(Math.round(mainStorage.day) + Number(mainStorage.hours / 24));
					txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min;
				}else{	
					timeToTask = Number((mainStorage.hours) + 1) + 'h';
					txtToTask = Number((mainStorage.min) - 60) + 'min';
				}
			//over due if the hours/mins passed the current hour/mins
			}else if(mainStorage.hours <= hours && mainStorage.min <= mins){
				timeToTask = 'Over';
				txtToTask = 'due';
			} else{
				timeToTask = mainStorage.hours  + 'h';
				txtToTask = mainStorage.hours + 'min';
			}	
		}else{
			//over due if the hours/mins/day passed the current hour/mins/day
			if(mainStorage.hours <= hours && mainStorage.min <= mins && mainStorage.day <= days){
				timeToTask = 'Over';
				txtToTask = 'due';
			//add +1 to day if hours > 24
			}else if(mainStorage.hours >= 24){
				timeToTask = Number(Math.round(mainStorage.day)) + Number(Math.round(mainStorage.hours / 24)); 
				txtToTask = Number(Math.round(mainStorage.hours / 24))+ ':' + mainStorage.min;
			}else if(mainStorage.min >= 60){
				if(mainStorage.hours >= 24){
					timeToTask = Number(Math.round(mainStorage.day) + Number(mainStorage.hours / 24)); 
					txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min; 
				}else{	
					timeToTask = Number((mainStorage.hours) + 1) + 'h';
					txtToTask = Number((mainStorage.min) - 60) + 'min';
				}					
			}else{
				txtToTask = mainStorage.hours + ':' + mainStorage.min;
				timeToTask = mainStorage.day;
			}
		}
	}
}

//create local storage and make fileds from add to do form required
var addToDo = function(){
	var _addToDo = this;
    var addForm = document.getElementById('addTaskForm'),
        submitBtn = document.getElementById('submitTask'),
        inputTitle = document.getElementById('taskTitle'),
        inputDay = document.getElementById('taskDay'),
        inputHours = document.getElementById('taskHours'),
		inputMin = document.getElementById('taskMin'),
        taskDescr = document.getElementById('taskDesr'),
        errorMessage = document.createElement('div'),
        addNewHolder = document.getElementById('addNew'),
        addedMessage = document.getElementById('addedMessage'),
		closeBtn = document.getElementById('closeBtn');
    if(addForm){
        errorMessage.setAttribute('id', 'errorMsg');
        addForm.appendChild(errorMessage);
        errorMessage.innerHTML = '';
        submitBtn.onclick = function(e){
            mousedown(e);
            _addToDo.checkFileds();
        }
    }
    //make fields required
    this.checkFileds = function(){
        var numericCheck = /^\d+$/;
        var maxLength = 2;
        if(inputTitle.value === ''){   
            errorMessage.innerHTML = 'This fileds are required!';
            inputTitle.focus();
        }else if(inputDay.value != '' && !inputDay.value.match(numericCheck)){
			errorMessage.innerHTML = 'Filed must contain only numbers!';
			inputDay.focus();
		}else if(inputHours.value === ''){
            errorMessage.innerHTML = 'This filed is required';    
            inputHours.focus();
        }else if(!inputHours.value.match(numericCheck)){
            errorMessage.innerHTML = 'Filed must contain at least one number';    
            inputHours.focus();
        }else if(inputMin.value === ''){
            errorMessage.innerHTML = 'This filed is required';    
            inputMin.focus();
        }else if(!inputMin.value.match(numericCheck)){
            errorMessage.innerHTML = 'Filed must contain at least one number';
            inputMin.focus();
		}else{
            if(errorMessage){ errorMessage.style.display = 'none';}
            if(addNewHolder){
                addNewHolder.style.display = 'none';
                addedMessage.style.display = 'block';
                _addToDo.createLocalStorage();
				closeBtn.onclick = function(){
					history.go(0);
					el.style.display = 'none';
				}
            }                
        }
    }
    //add to local storage the info
    this.createLocalStorage = function(){
        var toDoStorage = window.localStorage.getItem("toDoList") || '[]',
            parseList = JSON.parse(toDoStorage),
            newDate = new Date(),
            itemId = newDate.getTime();
        // do the check based on the itemID so it wont overwirte the previous entry
        for(var a = [], b = 0; b < parseList.length; b++){
            parseList[b].itemId != itemId && a.push(parseList[b]);
        }
        if(inputTitle.value){
            //object with the values that will be sent to localstorage
            a.push({
                id: 	itemId,
                title:  inputTitle.value,
                day:    inputDay.value,
                hours:  inputHours.value,
				min:  	inputMin.value,
                descr:  taskDescr.value,
                deleted: 0,
                finished: 0
            })
            if (typeof(localStorage) == 'undefined' ) {
                alert('Your browser does not support HTML5 localStorage. Try upgrading.');
            } else {    
                try {
                    window.localStorage.setItem('toDoList', JSON.stringify(a));
                }catch (e) {
                    if (e == QUOTA_EXCEEDED_ERR) {
                        alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
                    }
                }
            }    
        }
    }
}

//delete to do and push new values to local storage
//make confirmation for user if he is sure he want's to delete
//if yes delete | no keep the to do
var removeToDo = function(){
	var _remove = this;
	var toDoStorage = localStorage.getItem("toDoList");
	if(toDoStorage){
		this.deleteToDO = function(btnDel, toDoDel, storageId){
			btnDel.onclick = function(){
				_remove.removeStorage(toDoDel, storageId);
			}
		}
	}
	this.removeStorage = function(who, storageId){
		parseList = JSON.parse(toDoStorage);
		var toDoList = document.getElementById('toDoList');
		if(document.getElementById('toDoSearch')){
			var toDoSearch =  document.getElementById('toDoSearch');
		}
		for(var a = [], b = 0; b < parseList.length; b++){
			if(storageId === parseList[b].id){
				a.push({
					id: 	storageId,
					title:  parseList[b].title,
					day:    parseList[b].day,
					hours:  parseList[b].hours,
					min:  	parseList[b].min,
					descr:  parseList[b].descr,
					deleted: 1,
					finished: 0
				})
			}else{
				a.push(parseList[b]);
			}
		}
		var alertHolder = document.createElement('div');
		alertHolder.setAttribute('id', 'alertHolder');
		alertHolder.innerHTML = ('<div class="innerHolder"><div>Are you sure you want to delete it?</div>'+
								 '<div class="btnBig left" id="btnYes">Yes</div><div id="btnNo" class="btnBig right">No</div>'+
								 '<div class="clear"><!-- empty --></div></div>'
								 );
		wrapper.appendChild(alertHolder);
		var btnYes = document.getElementById('btnYes');
		var btnNo = document.getElementById('btnNo');
		btnYes.onclick = function(){
			wrapper.removeChild(alertHolder);
			if(mainContent.style.display != 'none'){
				if(toDoList){
					toDoList.removeChild(who);
				}
			}else{
				if(toDoSearch){
					toDoSearch.removeChild(who);
				}
			}
			var newStorage = localStorage.setItem('toDoList', JSON.stringify(a));			
			return true;
		}
		btnNo.onclick = function(){
			wrapper.removeChild(alertHolder);
			return false;
		}		
	}
}
var removeToDo = new removeToDo();

//mark to do as done and push new values to local storage
//make confirmation for user if he is sure he want;s to delete
//if yes mark as done no keep the to do
var markAsDone = function(){
	var _done = this;
	var toDoStorage = localStorage.getItem("toDoList");
	if(toDoStorage){
		this.doneToDo = function(labelCheck, toDoDone, storageId){
			labelCheck.onclick = function(){
				if(labelCheck.checked){
					_done.updateDone(labelCheck, toDoDone, storageId);
				}
			}
		}
	}
	this.updateDone = function(label, who, storageId){
		parseList = JSON.parse(toDoStorage);
		var toDoList = document.getElementById('toDoList');
		if(document.getElementById('toDoSearch')){
			var toDoSearch =  document.getElementById('toDoSearch');
		}
		for(var a = [], b = 0; b < parseList.length; b++){
			if(storageId === parseList[b].id){
				a.push({
					id: 	storageId,
					title:  parseList[b].title,
					day:    parseList[b].day,
					hours:  parseList[b].hours,
					min:  	parseList[b].min,
					descr:  parseList[b].descr,
					deleted: 0,
					finished: 1
				})
			}else{
				a.push(parseList[b]);
			}
		}
		var alertHolder = document.createElement('div');
		alertHolder.setAttribute('id', 'alertHolder');
		alertHolder.innerHTML = ('<div class="innerHolder"><div>Are you sure you want to mark as done?</div>'+
								 '<div class="btnBig left" id="btnYes">Yes</div><div id="btnNo" class="btnBig right">No</div>'+
								 '<div class="clear"><!-- empty --></div></div>'
								 );
		wrapper.appendChild(alertHolder);
		var btnYes = document.getElementById('btnYes');
		var btnNo = document.getElementById('btnNo');
		btnYes.onclick = function(){
			wrapper.removeChild(alertHolder);
			if(mainContent.style.display != 'none'){
				if(toDoList){
					toDoList.removeChild(who);
				}
			}else{
				if(toDoSearch){
					toDoSearch.removeChild(who);
				}
			}
			var newStorage = localStorage.setItem('toDoList', JSON.stringify(a));			
			return true;
		}
		btnNo.onclick = function(){
			wrapper.removeChild(alertHolder);
			if(label.checked){
				label.checked = false;
			}
			return false;
		}
	}	
}
var markAsDone = new markAsDone();

//search for to's even they are finished/deleted or active
var searchToDo = function(){
    var _search = this;
	var timeToTask;
	var txtToTask;
	//elements of the search form
	var searchForm = document.getElementById('searchForm'),
		searchBtn = document.getElementById('searchBtn'),
		searchField = document.getElementById('searchField');
	// make the search based on form submit or button click	
	if(searchBtn) {
		searchForm.onsubmit = function (e) {
			mousedown(e);
			//call fn wich search the to do's
			_search.searchToDo();
		}
		searchBtn.onclick = function (e) {
			mousedown(e);
			//call fn wich search the to do's
			_search.searchToDo();
        };
    }
	//check for storage and if search filed it's not empty
	this.searchToDo = function(){
		var fieldVal = searchField.value;
		var toDoStorage = localStorage.getItem('toDoList');
		if(toDoStorage){
			parseList = JSON.parse(toDoStorage);
			results = new Array;
			if(fieldVal != '') {
				//make search based on reg ex match case from the input filed value
				for (var i=0; i < parseList.length; i++) {
					var toDoTitle = parseList[i].title;
					var toDoDescr = parseList[i].descr;
					//create reg ex with the value of input
					var titleExp = new RegExp(fieldVal,"i");
					var descrExp = new RegExp(fieldVal, 'i');
					
					//match the reg ex with the obj descr and title 
					if((toDoTitle.match(titleExp) != null)) {
						results.push(parseList[i]);
					}else if((toDoDescr.match(descrExp) != null)){
						results.push(parseList[i]);
					}
				}
				_search.showResults(results, fieldVal);
			}
		//if no storage display message
		}else{
			var noSearchToDo = document.createElement('div');
			noSearchToDo.setAttribute('id', 'popupSearch');
			noSearchToDo.innerHTML = ('<div class="innerHolder">You don\'t have any To Do\'s yet<div id="closeBtnSearch" class="btnBig">Close</div></div>');
			mainContent.appendChild(noSearchToDo)
			var closeBtn = document.getElementById('closeBtnSearch');
			setTimeout(function(){
				if(closeBtn){
					closeBtn.onclick = function(){
						mainContent.removeChild(noSearchToDo);
					}
				}
			}, 200)
		}
	}
	//if we have matches then build the list
	this.showResults = function(results, fieldVal) {
		var resultshere = document.getElementById("searchResults");
		var title = document.createElement("h1"),
			list = document.createElement("ul");
		list.setAttribute('id', 'toDoSearch');
		
		//show search holder hide main content holder
		if(results.length > 0) {
			mainContent.style.display = 'none';
			resultshere.style.display = 'block';
			title.innerHTML = ("You've searched for: " + fieldVal);
			resultshere.appendChild(title);
			resultshere.appendChild(list);
			
			for(var i=0; i < results.length; i++) {
				var resPars = results[i];
				var theListS = document.createElement('li');
				theListS.setAttribute('id', "toDo_"+i+"");
				theListS.innerHTML = '';
				
				//html list for deleted items
				if(resPars.deleted == 1){
					theListS.innerHTML += ('<div>'+
											'<div class="info" style="margin-left:68px;">Deleted</div><div class="title">'+ resPars.title+ '</div></div>'+
											'<div class="clear"><!-- empty -->'+
										  '</div>'
					);
					theListS.setAttribute('class', 'deleted');
					list.appendChild(theListS);
				}
				//html list for finished items
				if(resPars.finished == 1){
					theListS.innerHTML += ('<div>'+
											'<div class="info" style="margin-left:68px;">Finished</div><div class="title">'+ resPars.title+ '</div></div>'+
											'<div class="clear"><!-- empty -->'+
										  '</div>'
					);
					theListS.setAttribute('class', 'finished');
					list.appendChild(theListS);
				}
				//html list for on going items
				if(resPars.deleted != 1 && resPars.finished != 1){
					_search.checkDates(resPars, timeToTask, txtToTask);
					
					theListS.innerHTML += ('<div class="date">'+ timeToTask +'<span>'+ txtToTask +'</span></div>'+
										  '<div class="liContent"><div class="btnHolder">'+
										  '<div class="btn delete" id="deleteS_'+i+'">Delete</div>'+
										  '<div class="btn expand" id="expandS_'+i+'">Expand</div></div>'+
										  '<input type="checkbox" id="checkS_'+i+'" name="checkS" class="checkToDo"/>'+
										  '<label for="checkS_'+i+'">'+resPars.title+'</label>'+
										  '<div class="clear"><!-- empty --></div>'+
										  '<div class="description" style="display:none" id="descrS_'+i+'">'+resPars.descr+'</div></div>'+
										  '<div class="clear"><!-- empty --></div>'
					);
					list.appendChild(theListS);
					var expandBtnS = document.getElementById('expandS_'+i),
						toDoDeleteS = document.getElementById('deleteS_'+i),
						toDoDescrS = document.getElementById('descrS_'+i),
						checkDoneS = document.getElementById('checkS_'+i);
						
					//show hide the description of unfinished items	
					buildList.showHideDescr(expandBtnS, toDoDescrS);
					//call remove and mark as done fn's
					removeToDo.deleteToDO(toDoDeleteS, theListS, resPars.id);
					markAsDone.doneToDo(checkDoneS, theListS, resPars.id);
				}
			}
		}else {
			//if no match found show message
			content.style.display = 'none';
			resultshere.style.display = 'block';
			title.innerHTML = ("Sorry, I couldn\'t find anything like: " + fieldVal);
			resultshere.appendChild(title);			
		}
	}
	//duplicate of check date function from build list must be refactored
	this.checkDates = function(mainStorage, timeShow, txtShow){
		var currentTime = new Date(),
			days = currentTime.getDate(),
			hours = currentTime.getHours(),
			mins = currentTime.getMinutes();
			timeToTask = timeShow;
			txtToTask = txtShow;
			
		if(mainStorage.day == ""){
			// increase day if hours it's bigger then 24
			if(mainStorage.hours >= 24){
				timeToTask = Number(Math.round(mainStorage.day + Number(mainStorage.hours / 24)));
				txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min;
			//increase the hour if min == 1 hour
			}else if(mainStorage.min >= 60){
				if(mainStorage.hours >= 24){
					timeToTask = Number(Math.round(mainStorage.day) + Number(mainStorage.hours / 24));
					txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min;
				}else{	
					timeToTask = Number((mainStorage.hours) + 1) + 'h';
					txtToTask = Number((mainStorage.min) - 60) + 'min';
				}
			//over due if the hours/mins passed the current hour/mins
			}else if(mainStorage.hours <= hours && mainStorage.min <= mins){
				timeToTask = 'Over';
				txtToTask = 'due';
			} else{
				timeToTask = mainStorage.hours  + 'h';
				txtToTask = mainStorage.hours + 'min';
			}	
		}else{
			//over due if the hours/mins/day passed the current hour/mins/day
			if(mainStorage.hours <= hours && mainStorage.min <= mins && mainStorage.day <= days){
				timeToTask = 'Over';
				txtToTask = 'due';
			//add +1 to day if hours > 24
			}else if(mainStorage.hours >= 24){
				timeToTask = Number(Math.round(mainStorage.day)) + Number(Math.round(mainStorage.hours / 24)); 
				txtToTask = Number(Math.round(mainStorage.hours / 24))+ ':' + mainStorage.min;
			}else if(mainStorage.min >= 60){
				if(mainStorage.hours >= 24){
					timeToTask = Number(Math.round(mainStorage.day) + Number(mainStorage.hours / 24)); 
					txtToTask = Number(Math.round((mainStorage.hours / 24) - timeToTask))+ ':' + mainStorage.min; 
				}else{	
					timeToTask = Number((mainStorage.hours) + 1) + 'h';
					txtToTask = Number((mainStorage.min) - 60) + 'min';
				}					
			}else{
				txtToTask = mainStorage.hours + ':' + mainStorage.min;
				timeToTask = mainStorage.day;
			}
		}		
	}
}
var searchToDo = new searchToDo();

// build list of deleted to do's in the deleted html page
var deletedToDos = function(){
	var deletedToDos = document.getElementById('deletedToDos');
	var toDoStorage = localStorage.getItem("toDoList");
	var parseList = JSON.parse(toDoStorage);
	var emptyList = document.getElementById('emptyList');
	//check for storage if exists and there are deleted build html list
	if(toDoStorage){
		if(deletedToDos){
			var createList = document.createElement('ul');
				createList.setAttribute('id', 'deletedLi');
				deletedToDos.appendChild(createList);

			for(var i = 0; i < parseList.length; i++){
				if(parseList[i].deleted === 1){
					emptyList.style.display = 'none';
					theList = document.createElement('li');
					theList.setAttribute('class', 'deleted')
					theList.innerHTML += ('<div>'+
											'<div class="info">Deleted</div><div class="title">'+ parseList[i].title+ '</div></div>'+
											'<div class="clear"><!-- empty -->'+
										  '</div>'
					);
					createList.appendChild(theList);
				}
			}
		}
	}	
}
// build list of finished to do's in the finished html page
var finishedToDos = function(){
	var finished = document.getElementById('finishedToDos');
	var toDoStorage = localStorage.getItem("toDoList");
	var parseList = JSON.parse(toDoStorage);
	var emptyList = document.getElementById('emptyList');	
	//check for storage if exists and there are finished build html list
	if(toDoStorage){
		if(finished){
			var createList = document.createElement('ul');
				createList.setAttribute('id', 'finishedLi');
				finished.appendChild(createList);
				
			for(var i = 0; i < parseList.length; i++){
				if(parseList[i].finished === 1){
					emptyList.style.display = 'none';
					theList = document.createElement('li');
					theList.setAttribute('class', 'finished')
					theList.innerHTML += ('<div>'+
											'<div class="info">Finished</div><div class="title">'+ parseList[i].title+ '</div></div>'+
											'<div class="clear"><!-- empty -->'+
										  '</div>'
					);
					createList.appendChild(theList);
				}
			}
		}
	}
}
					
/* ---------------------------------------
 * create function that makes the ajax call
 * based on target
 * ---------------------------------------- */
var ajaxRequest = function(url, target){
    var _request = this;
	
    this._options = {
        url: url,
        target:'pageTarget',
		isActive:true
    }
    if(_request._options.target) {
        var el = document.getElementById(_request._options.target);
    }
    if(_request._options.url){
        var urlSend = url;
    }
    //check for xmlhttprequest
    var request;
    if(window.XMLHttpRequest){
        request = new XMLHttpRequest();
    }else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if(request){
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200) {
				el.innerHTML = request.responseText;
                el.style.display = 'block';
				addToDo = new addToDo();
				deletedToDos = new deletedToDos();
				finishedToDos = new finishedToDos();
				var menuHome = document.getElementById('menuHome'),
					menuNew = document.getElementById('menuNew'),
					menuDel = document.getElementById('menuDel'),
					menuFinish = document.getElementById('menuFinish');
				switch(url){
					case 'new.html':
						menuNew.setAttribute('class', 'active');
						menuHome.removeAttribute('class', 'active');
						break;
					case 'deleted.html':
						menuDel.setAttribute('class', 'active');
						menuHome.removeAttribute('class', 'active');
						break;
					case 'finished.html':
						menuFinish.setAttribute('class', 'active');
						menuHome.removeAttribute('class', 'active');
						break;
					default:
						menuHome.setAttribute('class', 'active');
				}					
					

            }
        }
    }
    request.open("GET", _request._options.url, true);
    request.send(null);
}

 //prevent default fn for IE
function mousedown(e){
    var evt = e || window.event; // IE compatibility
    if(evt.preventDefault){  
        evt.preventDefault();  
    }else{  
        evt.returnValue = false;  
		evt.cancelBubble=true;  
    }
};