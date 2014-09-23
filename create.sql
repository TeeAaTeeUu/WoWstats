--drop table auctions_new;
--drop table auctions_old;
--drop view auctions_short_count;
--drop table auctions_short;
--drop table auctions_success;

create table if not exists auctions_new(
   auc int8 PRIMARY KEY,
   item int,
   owner varchar(20),
   realm varchar(20),
   bid int8,
   buyout int8,
   quantity int,
   timeleft varchar(9),
   rand int,
   seed int8
);

create table if not exists auctions_old(
   auc int8 PRIMARY KEY,
   item int,
   owner varchar(20),
   realm varchar(20),
   bid int8,
   buyout int8,
   quantity int,
   timeleft varchar(9),
   rand int,
   seed int8
);

create table if not exists auctions_success(
   auc int8 UNIQUE,
   item int,
   owner varchar(20),
   realm varchar(20),
   bid int8,
   buyout int8,
   quantity int,
   timeleft varchar(9),
   rand int,
   seed int8,
   PRIMARY KEY (item, auc)
);

create table if not exists auctions_success_temp(
   auc int8 PRIMARY KEY,
   item int,
   owner varchar(20),
   realm varchar(20),
   bid int8,
   buyout int8,
   quantity int,
   timeleft varchar(9),
   rand int,
   seed int8
);

create table if not exists auctions_short(
   id serial PRIMARY KEY,
   auc int8
);

CREATE OR REPLACE VIEW auctions_short_count AS
SELECT auc, COUNT(auctions_short.auc) AS times
FROM  auctions_short
GROUP BY auc;

CREATE OR REPLACE VIEW auctions_top AS
SELECT item, AVG(auctions_success.buyout / auctions_success.quantity) / 10000 AS mean,
STDDEV_POP(auctions_success.buyout / auctions_success.quantity) / 10000 AS stddev,
(STDDEV_POP(auctions_success.buyout / auctions_success.quantity) - (0.05 * AVG(auctions_success.buyout / auctions_success.quantity))) / 10000 AS stddev_cut,
(STDDEV_POP(auctions_success.buyout / auctions_success.quantity) - (0.05 * AVG(auctions_success.buyout / auctions_success.quantity))) * SUM(auctions_success.quantity) / 10000 AS stddev_cut_profit,
SUM(auctions_success.quantity) AS amount
FROM  auctions_success
GROUP BY item
HAVING COUNT(*) > 1
ORDER BY stddev_cut_profit DESC;