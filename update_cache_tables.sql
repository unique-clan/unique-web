CREATE TABLE IF NOT EXISTS cache_ranks (
    Map VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    Name VARCHAR(15) COLLATE utf8mb4_bin NOT NULL,
    Rank INT NOT NULL,
    PRIMARY KEY (Map, Name)
);
REPLACE INTO cache_ranks SELECT Map, Name, RANK() OVER (PARTITION BY Map ORDER BY MIN(Time)) FROM record_race GROUP BY Map, Name;

CREATE TABLE IF NOT EXISTS cache_points (
    Map VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    Name VARCHAR(15) COLLATE utf8mb4_bin NOT NULL,
    Points INT NOT NULL,
    PRIMARY KEY (Map, Name)
);
REPLACE INTO cache_points SELECT t1.Map, Name, FLOOR(100*EXP(-Const*(Time/Record-1)))
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

REPLACE INTO record_points SELECT Name, SUM(Points) FROM cache_points GROUP BY Name;
