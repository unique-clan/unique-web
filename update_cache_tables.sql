CREATE TABLE IF NOT EXISTS cache_ranks (
    Map VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    Name VARCHAR(15) COLLATE utf8mb4_bin NOT NULL,
    Rank INT NOT NULL,
    PRIMARY KEY (Map, Name)
);
SET @section_start = UNIX_TIMESTAMP();
START TRANSACTION;
DELETE FROM cache_ranks;
INSERT INTO cache_ranks SELECT Map, Name, RANK() OVER (PARTITION BY Map ORDER BY MIN(Time)) FROM record_race GROUP BY Map, Name;
COMMIT;
SELECT CONCAT('cache_ranks update took: ', UNIX_TIMESTAMP() - @section_start, ' seconds') AS timing;

CREATE TABLE IF NOT EXISTS cache_points (
    Map VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    Name VARCHAR(15) COLLATE utf8mb4_bin NOT NULL,
    Points INT NOT NULL,
    PRIMARY KEY (Map, Name)
);
SET @section_start = UNIX_TIMESTAMP();
START TRANSACTION;
DELETE FROM cache_points;
INSERT INTO cache_points SELECT t1.Map, Name, FLOOR(100*EXP(-Const*(Time/Record-1)))
FROM (SELECT Map, Name, MIN(Time) as Time FROM record_race GROUP BY Map, Name) t1
JOIN (SELECT Map, MIN(Time) AS Record FROM record_race GROUP BY Map) t2 ON t1.Map = t2.Map
JOIN (SELECT Map, CASE
    WHEN Server = 'Short' THEN 5.0
    WHEN Server = 'Middle' THEN 3.5
    WHEN Server = 'Long Easy' THEN 2.0
    WHEN Server = 'Long Advanced' THEN 1.0
    WHEN Server = 'Long Hard' THEN 0.03
    WHEN Server = 'Fastcap' THEN 5.0
    WHEN Server = 'Fastcap No Weapons' THEN 5.0
END AS Const FROM record_maps) t3 ON t1.Map = t3.Map;
COMMIT;
SELECT CONCAT('cache_points update took: ', UNIX_TIMESTAMP() - @section_start, ' seconds') AS timing;

SET @section_start = UNIX_TIMESTAMP();
START TRANSACTION;
DELETE FROM record_points;
INSERT INTO record_points SELECT Name, SUM(Points) FROM cache_points GROUP BY Name;
COMMIT;
SELECT CONCAT('record_points update took: ', UNIX_TIMESTAMP() - @section_start, ' seconds') AS timing;

CREATE TABLE IF NOT EXISTS cache_records (
    Map VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    Name VARCHAR(15) COLLATE utf8mb4_bin NOT NULL,
    Timestamp TIMESTAMP NOT NULL,
    Time FLOAT NOT NULL,
    PRIMARY KEY (Map, Name, Timestamp, Time)
);
SET @section_start = UNIX_TIMESTAMP();
START TRANSACTION;
DELETE FROM cache_records;
SET @best_so_far = NULL;
SET @prev_map = '';
INSERT INTO cache_records SELECT Map, Name, Timestamp, Time FROM (
    SELECT
        Map,
        Name,
        Timestamp,
        Time,
        @best_so_far := CASE 
            WHEN @prev_map != Map THEN Time
            ELSE LEAST(@best_so_far, Time)
        END AS BestSoFar,
        @prev_map := Map
    FROM record_race WHERE Timestamp != 0 ORDER by Map, Timestamp
) t WHERE Time = BestSoFar;
COMMIT;
SELECT CONCAT('cache_records update took: ', UNIX_TIMESTAMP() - @section_start, ' seconds') AS timing;
