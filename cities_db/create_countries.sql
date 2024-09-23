CREATE TABLE if not exists _countries
(
    country_id integer NOT NULL,
    title_ru   character varying(60),
    title_ua   character varying(60),
    title_be   character varying(60),
    title_en   character varying(60),
    title_es   character varying(60),
    title_pt   character varying(60),
    title_de   character varying(60),
    title_fr   character varying(60),
    title_it   character varying(60),
    title_pl   character varying(60),
    title_ja   character varying(60),
    title_lt   character varying(60),
    title_lv   character varying(60),
    title_cz   character varying(60),
    CONSTRAINT pk_country_cid PRIMARY KEY (country_id)
);
