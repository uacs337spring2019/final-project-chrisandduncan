/**
Christopher Loper and Duncan Rover
sps_service.js
**/
const express = require("express");
const app = express();
const fs = require('fs');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

//app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", 
//               "Origin, X-Requested-With, Content-Type, Accept");
// next();
//});

app.use(express.static(__dirname));
console.log("service started");
app.get('/', function (req, res) {
	console.log("go in");
	if (req.query.mode === "plants" || req.query.mode === "description" || req.query.mode === "info") {
		res.header("Access-Control-Allow-Origin", "*");
		let plant = req.query.title;
		console.log(plant);
		let mode = req.query.mode;
		console.log(mode);
		let directory = fs.readdirSync("plants/");
		let json = {};
		if (mode === "info") {
			json = get_info(plant);
			res.send(JSON.stringify(json));
		} else if (mode === "description") {
			let info = fs.readFileSync("plants/" + plant + "/description.txt", "utf8");
			res.send(JSON.stringify(info));
		} else if (mode === "plants") {
			json = get_plants(directory);
			console.log("hello");
			console.log(JSON.stringify(json));
			res.send(JSON.stringify(json));
		} else {
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

app.listen(process.env.PORT);

/** Gets all plants **/
function get_plants(directory) {
	let json = {};
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

