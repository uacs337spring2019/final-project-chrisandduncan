/**
Duncan Rover, Chris Loper
Final Project - Sonoran Plant Search
sps.js
Purpose: 
**/

"use strict";

(function() {
	let json;

	window.onload = function () {
		loadPlants();
		document.getElementById("home").addEventListener("click", clear);
		document.getElementById("home").addEventListener("click", loadPlants);
		document.getElementById("send").onclick = sendComment;
		document.getElementById("load").onclick = loadComments;
	}

	function sendComment() {
		let name = document.getElementById("name").value;
		let comment = document.getElementById("comment").value;
		comment = comment.replace(/(\r\n|\n|\r)/gm," ");
		let folder = document.getElementById("folder").innerHTML;
		let message = {name: name, 
			comment: comment,
			folder: folder};
		const fetchOptions = {
			method : 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body : JSON.stringify(message)
		};
		let url = "https://spschrisandduncan.herokuapp.com";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log(responseText);
		})
		.catch(function(error) {
			console.log(error);
		});
	}

	/** Loads all of the plants from the web service and displays them on the page**/
	function loadPlants() {
		console.log("loadplants");
		let singlePlant = document.getElementById("singleplant");
		singlePlant.style.visibility = "hidden";
		let url = "https://spschrisandduncan.herokuapp.com?mode=plants";
			fetch(url)
			    .then(checkStatus)
			    .then(function(responseText) {
			    	json = JSON.parse(responseText);
			    	for (let i = 0; i < json.plants.length; i++) {
			    		let plant = document.createElement("div");
			    		plant.addEventListener("click", plantInfo);
			    		plant.addEventListener("click", clear);
			    		plant.folder = json.plants[i].folder;
			    		let plantName = document.createElement("p");
			    		plantName.appendChild(document.createTextNode(json.plants[i].name));
			    		let plantImage = document.createElement("img");
			    		plantImage.setAttribute("src", "plants/" + json.plants[i].folder + "/plant.jpg");
			    		plant.appendChild(plantImage);
			    		plant.appendChild(plantName);
			    		document.getElementById("allplants").append(plant);
			    	}
			    });
	}
	
	/** Clears the page **/
	function clear() {
		document.getElementById("allplants").innerHTML = "";
		document.getElementById("common").innerHTML = "";
		document.getElementById("description").innerHTML = "";
		document.getElementById("commentbox").innerHTML = "";
		document.getElementById("name").value = "";
		document.getElementById("comment").value = "";
		document.getElementById("folder").innerHTML = "";
	}

	/** Gathers all info about a plant when a plant is clicked **/
	function plantInfo() {
		document.getElementById("singleplant").style.visibility = "visible";
		// INFO
		let folder = this.folder;
		let url = "https://spschrisandduncan.herokuapp.com?mode=info&title=" + folder;
		fetch(url)
				.then(checkStatus)
				.then(function(responseText) {
					let json = JSON.parse(responseText);
					let plantImg = document.createElement("img"); // NEEDS EDIT
					document.getElementById("plantimage").setAttribute("src", "plants/"+folder+"/plant.jpg");
					document.getElementById("common").innerHTML = json.plants[0].name;
					document.getElementById("folder").innerHTML = folder;
					loadComments();
					//plantFolderName.style.visibility = "hidden";
				});
		// DESCRIPTION
		url = "http://spschrisandduncan.herokuapp.com?mode=description&title=" + folder;
		fetch(url)
				.then(checkStatus)
				.then(function(responseText) {
					let json = JSON.parse(responseText);
					document.getElementById("description").innerHTML = json;

				});
	}

		/** Loads all comments to the page from the js service **/
	function loadComments() {
		let folder = document.getElementById("folder").innerHTML;
		let commentBox = document.getElementById("commentbox");
		commentBox.innerHTML = "";
		let url = "https://spschrisandduncan.herokuapp.com?mode=" + folder;
		fetch(url)
		    .then(checkStatus)
		    .then(function(responseText) {
		    	let json = JSON.parse(responseText);
		    	for (let i = 0; i < json.messages.length; i++) {
		    		if (json.messages[i].name != "") {
		    			let newCommentDiv = document.createElement("div");
			    		newCommentDiv.className = "comments";
			    		let newName = document.createElement("p");
			    		let newComment =document.createElement("span");
			    		newName.innerHTML = json.messages[i].name + ": ";
			    		newComment.innerHTML = json.messages[i].comment;
			    		newName.appendChild(newComment);
			    		newCommentDiv.appendChild(newName);
			    		commentBox.appendChild(newCommentDiv);
		    		}
		    	}
		    });
	}

	function checkStatus(response) { 
	    if (response.status >= 200 && response.status < 300) {  
	        return response.text();
	    } else if(response.status == 404) {
	    	return Promise.reject(new Error("That page cannot be found."));
	    } else {  
	        return Promise.reject(new Error(response.status+": "+response.statusText)); 
	    }
	}

}) ();
