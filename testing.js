var fs = require('fs');

files = fs.readdirSync("./").filter(function(file) {
	return file.indexOf("000.json") != -1;
});


function sortAuctions (a, b) {
	return a.auc - b.auc;
};

files.sort();

console.log(files);

auctionsOld = JSON.parse(fs.readFileSync("./" + files[files.length-2]))["horde"].auctions.sort(sortAuctions);
auctionsNew = JSON.parse(fs.readFileSync("./" + files[files.length-1]))["horde"].auctions.sort(sortAuctions);

console.log(auctionsNew.length);

auctionsNew.forEach(function(elem) {
	console.log(elem.auc + " , " + elem.item + " and " + elem.owner + " with price " + elem.buyout / 100 / 100);
});