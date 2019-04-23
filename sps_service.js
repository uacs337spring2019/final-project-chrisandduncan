/**
Christopher Loper
18 MAR 2019
Homework 7
bestreads_service.js
Purpose: Creates JSON objects about book review info
Linked to bestreads.html
**/
const express = require("express");
const app = express();
const app2 = express();
var fs = require('fs');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));
console.log("service started");
app.get('/', function (req, res) {
	if (req.query.mode == "plants" || req.query.mode == "description" || req.query.mode == "info") {
		res.header("Access-Control-Allow-Origin", "*");
		let plant = req.query.title;
		let mode = req.query.mode;
		let directory = fs.readdirSync("plants/");
		let json = {};
		if (mode == "info") {
			json = get_info(plant);
			res.send(JSON.stringify(json));
		} else if (mode == "description") {
			let info = fs.readFileSync("plants/" + plant + "/description.txt", "utf8");
			res.send(JSON.stringify(info));
		} else if (mode == "plants") {
			json = get_plants(directory);
			res.send(JSON.stringify(json));
		}
	} else {
		let json = {};
		let folder = req.query.mode;
		let file = fs.readFileSync("plants/" + folder + "/comments.txt", "utf8");
		let lines = file.split("\n");
		let holder = [];

		// loop through each line and split it to gather name and comment
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i].split(":::");
			let lineInfo = {};
			lineInfo["name"] = line[0];
			lineInfo["comment"] = line[1];
			holder[i] = lineInfo;
		}

		// create JSON as such:
		// {"messages" : [{"name" : "Merlin", "comment" : "meow"},
	 	// {"name" : "Purcy", "comment" : "meow meow meow"},
		// {"name" : "Merlin", "comment" : "grumble meow"}]}
		json["messages"] = holder;
		res.send(JSON.stringify(json)); 
	}
 
});

app.post('/', jsonParser, function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let name = req.body.name;
	let comment = req.body.comment;
	let folder = req.body.folder;
	// append name and comment to file as a new line like:
	// NAME:::COMMENT
	fs.appendFile("plants/" + folder + "/comments.txt", name + ":::" + comment + "\r\n", function(err) {
		if (err) {
			return console.log(err);
		}
		console.log("Message was posted");
	});
});

app.listen(3000);

/** Gets all plants **/
function get_plants(directory) {
	let json = {}
	json["plants"] = [];
	for (let i = 0; i < directory.length; i++) {
		let currPlant = {};
		let folder = directory[i];
		let infoText = fs.readFileSync("plants/" + folder + "/info.txt", "utf8");
		let lines = infoText.split("\n");
		currPlant["name"] = lines[0];
		currPlant["folder"] = folder;
		json["plants"].push(currPlant);
	}
	return json;
}
/** Gets plant information **/
function get_info(plant) {
	let json = {};
	json["plants"] = [];
	let plants = {};
	let data = fs.readFileSync("plants/" + plant + "/info.txt", "utf8");
	let lines = data.split("\n");
	plants["name"] = lines[0];
	json["plants"].push(plants);
	return json;
}
/** Get books reviews **/
function get_reviews(book) {
	let json = {};
	json["reviews"] = [];  
	for (let i = 3; i < fs.readdirSync("books/" + book + "/").length; i++) {
		let curr = i-2;
		let reviewText = fs.readFileSync("books/" + book + "/review" + curr + ".txt", "utf8");
		let lines = reviewText.split("\n");
		let review = {};
		review["name"] = lines[0];
		review["stars"] = lines[1];
		review["review"] = lines[2];
		json["reviews"].push(review);
	}
	return json;
}