

-- CreateTable
CREATE TABLE IF NOT EXISTS "_cities" (
    "city_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "title_ru" VARCHAR(150),
    CONSTRAINT "pk_city_cid" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_countries" (
    "country_id" INTEGER NOT NULL,
    "title_ru" VARCHAR(60),
    "title_en" VARCHAR(60),

    CONSTRAINT "pk_country_cid" PRIMARY KEY ("country_id")
);
