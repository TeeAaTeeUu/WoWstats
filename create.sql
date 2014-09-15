--drop table auctions_new;
--drop table auctions_old;
--drop view auctions_short_count;
--drop table auctions_short;
--drop table auctions_success;

create table if not exists auctions_new(
   id serial PRIMARY KEY,
   auc int8 UNIQUE,
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
   id serial PRIMARY KEY,
   auc int8 UNIQUE,
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
   id serial PRIMARY KEY,
   auc int8 UNIQUE,
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

CREATE VIEW auctions_short_count AS
SELECT auc, COUNT(auctions_short.auc) AS times
FROM  auctions_short
GROUP BY auc;