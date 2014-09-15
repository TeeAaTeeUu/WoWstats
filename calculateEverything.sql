INSERT INTO auctions_short (auc)
SELECT auc
FROM auctions_new
WHERE timeLeft IN ('MEDIUM', 'SHORT');

INSERT INTO auctions_success
SELECT * FROM auctions_old old
WHERE NOT EXISTS
	(SELECT NULL
	FROM auctions_new new
	WHERE new.auc = old.auc)
	AND NOT EXISTS
	(SELECT NULL
	FROM auctions_short_count count
	WHERE count.auc = old.auc
	AND count.times >= 3);

TRUNCATE auctions_old;

INSERT INTO auctions_old
SELECT * FROM auctions_new;

TRUNCATE auctions_new;