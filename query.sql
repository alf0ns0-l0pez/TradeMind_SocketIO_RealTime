/*ACTIVATE OUR PG_NOTIFY*/
CREATE OR REPLACE FUNCTION dataset.notify_update_sampler()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
 BEGIN 
 	PERFORM pg_notify('new_update_sampler', row_to_json(NEW)::text);
	RETURN NULL;
END;
$function$

/*CREATE TRIGGER EVENT AND CONDITIONS*/
CREATE TRIGGER update_sampler_trigger AFTER INSERT ON dataset.bitcoin_samples
FOR EACH ROW EXECUTE PROCEDURE dataset.notify_update_sampler();

/*bitcoin_samples Table*/
SELECT * FROM dataset.bitcoin_samples
/*LINE CHART fearandgreed_value and price*/
SELECT DATE_PART('Year',datetime) AS dt_year, 
DATE_PART('Month',datetime) AS dt_month,
DATE_PART('Day',datetime) AS dt_day,
DATE_PART('Hour',datetime) AS dt_hour, 
body->'utc_datetime' AS utc_datetime,
DATE_PART('Year',(body->>'utc_datetime')::timestamp) AS utc_year,
DATE_PART('Month',(body->>'utc_datetime')::timestamp) AS utc_month,
DATE_PART('Day',(body->>'utc_datetime')::timestamp) AS utc_day,
DATE_PART('Hour',(body->>'utc_datetime')::timestamp) AS utc_hour,
body->'fearandgreed_value' AS fearandgreed_value,
body->'bitcoin_price' AS bitcoin_price,
body->'bitcoin_market_cap' AS bitcoin_market_cap,
body->'bitcoin_volume_24h' AS bitcoin_volume_24h,
body->'fearandgreed_value_classification' AS fearandgreed_value_classification
FROM dataset.bitcoin_samples
ORDER BY datetime ASC 

