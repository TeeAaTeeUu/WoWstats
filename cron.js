var CronJob = require('cron').CronJob;
var fs = require('fs');
var pg = require('pg');
var request = require('request')
, Join = require('join').Join
, join = Join.create();

var time = 1410780893000; // just something

var howManyTimes = 0;

var sync = true;

function sortAuctions (a, b) {
	return a.auc - b.auc;
};

function loopData (data) {
	var string = "";

	data.forEach(function(elem) {
		string += elem.auc + "," +
		elem.item + "," +
		elem.owner + "," +
		elem.ownerRealm + "," +
		elem.bid + "," +
		elem.buyout + "," +
		elem.quantity + "," +
		elem.timeLeft + "," +
		elem.rand + "," +
		elem.seed + "\n";
	});

	return string;
}

function copyToSQL (where, client, csv) {
	var stream = client.copyFrom("COPY " + where + "(auc, item, owner, realm, \
		bid, buyout, quantity, timeleft, rand, seed) FROM STDIN WITH CSV");
	stream.write(csv);
	stream.end();
}

function createTables (client) {
	sync = false;
	create = fs.readFileSync("./create.sql", "utf8");
	client.query(create, function(err, result) {
		if(err) {
			return console.error('error running query', err);
		}
		sync = true;
	});
}

function readFile (file) {
	return fs.readFileSync("./" + file, "utf8");
};

function syncIt() {
	if(!sync) {
		setTimeout(syncIt, 100);
	}
};

function calculateEverything (client) {
	client.query(readFile("calculateEverything.sql"), function (err, result) {
		if(err) {
			return console.error('error running query', err);
		}
		console.log("rows " + result.rows.length);
	});
};

console.log("Program starts");

new CronJob('*/20 * * * *', function(){
	console.log("beginning check at " + new Date().getTime());

	request('https://eu.api.battle.net/wow/auction/data/kazzak'
		+ '?apikey=secret', function (error, response, body) {
	body = JSON.parse(body);

	console.log("last update at " + body.files[0].lastModified);

	if(body.files[0].lastModified > time) {
		time = body.files[0].lastModified;

	 	request(body.files[0].url, function (error, response, body) {
			data = JSON.parse(body)["horde"].auctions.sort(sortAuctions);
				// files = fs.readdirSync("./").filter(function(file) {
				// 	return file.indexOf("000.json") != -1;
				// });
				// files.sort();

				// data1 = JSON.parse(fs.readFileSync("./" + files[files.length-6]))["horde"].auctions.sort(sortAuctions);
				// data2 = JSON.parse(fs.readFileSync("./" + files[files.length-5]))["horde"].auctions.sort(sortAuctions);
				// data3 = JSON.parse(fs.readFileSync("./" + files[files.length-4]))["horde"].auctions.sort(sortAuctions);
				// data4 = JSON.parse(fs.readFileSync("./" + files[files.length-3]))["horde"].auctions.sort(sortAuctions);
				// data5 = JSON.parse(fs.readFileSync("./" + files[files.length-2]))["horde"].auctions.sort(sortAuctions);
				// data6 = JSON.parse(fs.readFileSync("./" + files[files.length-1]))["horde"].auctions.sort(sortAuctions);


				var conString = "postgres://postgres:password@localhost/testdb";

				pg.connect(conString, function(err, client, done) {
					if(err) {
						return console.error('error fetching client from pool', err);
					}

// 					createTables(client);

// //					syncIt();

					// copyToSQL("auctions_new", client, loopData(data1));
					// calculateEverything(client);

					// copyToSQL("auctions_new", client, loopData(data2));
					// calculateEverything(client);

					// copyToSQL("auctions_new", client, loopData(data3));
					// calculateEverything(client);

					// copyToSQL("auctions_new", client, loopData(data4));
					// calculateEverything(client);

					// copyToSQL("auctions_new", client, loopData(data5));
					// calculateEverything(client);

					copyToSQL("auctions_new", client, loopData(data));
					calculateEverything(client);

					// howManyTimes++;
					// if(howManyTimes <= 2) {
					// 	client.query(readFile("emptySuccess.sql"), function (err, result) {
					// 		if(err) {
					// 			return console.error('error running query', err);
					// 		}
					// 	});
					// };

					done();
				});
			});
			// // .pipe(
			// // 	fs.createWriteStream(body.files[0].lastModified + ".json")
			// // 	);

			console.log("download complete at " + new Date().getTime());
	}
});
}, null, true);