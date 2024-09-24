/*
  Warnings:

  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_profileId_fkey";

-- DropTable
DROP TABLE "profile";

-- CreateTable
CREATE TABLE "_cities" (
    "city_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "important" BOOLEAN NOT NULL,
    "region_id" INTEGER,
    "title_ru" VARCHAR(150),
    "area_ru" VARCHAR(150),
    "region_ru" VARCHAR(150),
    "title_ua" VARCHAR(150),
    "area_ua" VARCHAR(150),
    "region_ua" VARCHAR(150),
    "title_be" VARCHAR(150),
    "area_be" VARCHAR(150),
    "region_be" VARCHAR(150),
    "title_en" VARCHAR(150),
    "area_en" VARCHAR(150),
    "region_en" VARCHAR(150),
    "title_es" VARCHAR(150),
    "area_es" VARCHAR(150),
    "region_es" VARCHAR(150),
    "title_pt" VARCHAR(150),
    "area_pt" VARCHAR(150),
    "region_pt" VARCHAR(150),
    "title_de" VARCHAR(150),
    "area_de" VARCHAR(150),
    "region_de" VARCHAR(150),
    "title_fr" VARCHAR(150),
    "area_fr" VARCHAR(150),
    "region_fr" VARCHAR(150),
    "title_it" VARCHAR(150),
    "area_it" VARCHAR(150),
    "region_it" VARCHAR(150),
    "title_pl" VARCHAR(150),
    "area_pl" VARCHAR(150),
    "region_pl" VARCHAR(150),
    "title_ja" VARCHAR(150),
    "area_ja" VARCHAR(150),
    "region_ja" VARCHAR(150),
    "title_lt" VARCHAR(150),
    "area_lt" VARCHAR(150),
    "region_lt" VARCHAR(150),
    "title_lv" VARCHAR(150),
    "area_lv" VARCHAR(150),
    "region_lv" VARCHAR(150),
    "title_cz" VARCHAR(150),
    "area_cz" VARCHAR(150),
    "region_cz" VARCHAR(150),

    CONSTRAINT "pk_city_cid" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "_countries" (
    "country_id" INTEGER NOT NULL,
    "title_ru" VARCHAR(60),
    "title_ua" VARCHAR(60),
    "title_be" VARCHAR(60),
    "title_en" VARCHAR(60),
    "title_es" VARCHAR(60),
    "title_pt" VARCHAR(60),
    "title_de" VARCHAR(60),
    "title_fr" VARCHAR(60),
    "title_it" VARCHAR(60),
    "title_pl" VARCHAR(60),
    "title_ja" VARCHAR(60),
    "title_lt" VARCHAR(60),
    "title_lv" VARCHAR(60),
    "title_cz" VARCHAR(60),

    CONSTRAINT "pk_country_cid" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "_regions" (
    "region_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "title_ru" VARCHAR(150),
    "title_ua" VARCHAR(150),
    "title_be" VARCHAR(150),
    "title_en" VARCHAR(150),
    "title_es" VARCHAR(150),
    "title_pt" VARCHAR(150),
    "title_de" VARCHAR(150),
    "title_fr" VARCHAR(150),
    "title_it" VARCHAR(150),
    "title_pl" VARCHAR(150),
    "title_ja" VARCHAR(150),
    "title_lt" VARCHAR(150),
    "title_lv" VARCHAR(150),
    "title_cz" VARCHAR(150),

    CONSTRAINT "pk_region_rid" PRIMARY KEY ("region_id")
);
