CREATE TABLE if not exists _regions
(
    region_id  integer NOT NULL,
    country_id integer NOT NULL,
    title_ru   character varying(150),
    title_ua   character varying(150),
    title_be   character varying(150),
    title_en   character varying(150),
    title_es   character varying(150),
    title_pt   character varying(150),
    title_de   character varying(150),
    title_fr   character varying(150),
    title_it   character varying(150),
    title_pl   character varying(150),
    title_ja   character varying(150),
    title_lt   character varying(150),
    title_lv   character varying(150),
    title_cz   character varying(150),
    CONSTRAINT pk_region_rid PRIMARY KEY (region_id)

);