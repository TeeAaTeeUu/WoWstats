var CronJob = require('cron').CronJob;
var fs = require('fs');
var pg = require('pg');
var request = require('request').defaults({
  gzip: true,
  json: true
});

var time = 1411469913000; // just something

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
		console.log("create tables done");
	});
}

function readFile (file) {
	return fs.readFileSync("./" + file, "utf8");
};

function syncIt() {
	if(!sync) {
		console.log("waiting");
		setTimeout(syncIt, 200);
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
		if(error) {
			return console.error('could not download time information', err);
		};
		body = body;

		console.log("last update at " + body.files[0].lastModified);

		if(body.files[0].lastModified > time) {
			time = body.files[0].lastModified;

			request(body.files[0].url, function (error, response, body) {
				if(error) {
					return console.error('could not download snapshot', err);
				};

				console.log("Downloaded at " + new Date().getTime());

				data = body["horde"].auctions.sort(sortAuctions);

				var conString = "postgres://postgres:password@localhost/testdb";

				pg.connect(conString, function(err, client, done) {
					if(err) {
						return console.error('error fetching client from pool', err);
					}
					if(howManyTimes == 0) {
						createTables(client);
					}

					syncIt();

					copyToSQL("auctions_new", client, loopData(data));
					calculateEverything(client);

					howManyTimes++;
					if(howManyTimes <= 2) {
						client.query(readFile("emptySuccess.sql"), function (err, result) {
							if(err) {
								return console.error('error running query', err);
							}
						});
					};

					done();
				});
			});

			console.log("download complete at " + new Date().getTime());
		}
	});
}, null, true);