/*
  Warnings:

  - You are about to drop the column `area_be` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_cz` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_de` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_en` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_es` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_fr` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_it` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_ja` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_lt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_lv` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_pl` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_pt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_ru` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `area_ua` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `important` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_be` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_cz` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_de` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_en` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_es` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_fr` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_id` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_it` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_ja` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_lt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_lv` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_pl` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_pt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_ru` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `region_ua` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_be` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_cz` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_de` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_en` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_es` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_fr` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_it` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_ja` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_lt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_lv` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_pl` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_pt` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_ua` on the `_cities` table. All the data in the column will be lost.
  - You are about to drop the column `title_be` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_cz` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_de` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_es` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_fr` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_it` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_ja` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_lt` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_lv` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_pl` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_pt` on the `_countries` table. All the data in the column will be lost.
  - You are about to drop the column `title_ua` on the `_countries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "_cities" DROP COLUMN "area_be",
DROP COLUMN "area_cz",
DROP COLUMN "area_de",
DROP COLUMN "area_en",
DROP COLUMN "area_es",
DROP COLUMN "area_fr",
DROP COLUMN "area_it",
DROP COLUMN "area_ja",
DROP COLUMN "area_lt",
DROP COLUMN "area_lv",
DROP COLUMN "area_pl",
DROP COLUMN "area_pt",
DROP COLUMN "area_ru",
DROP COLUMN "area_ua",
DROP COLUMN "important",
DROP COLUMN "region_be",
DROP COLUMN "region_cz",
DROP COLUMN "region_de",
DROP COLUMN "region_en",
DROP COLUMN "region_es",
DROP COLUMN "region_fr",
DROP COLUMN "region_id",
DROP COLUMN "region_it",
DROP COLUMN "region_ja",
DROP COLUMN "region_lt",
DROP COLUMN "region_lv",
DROP COLUMN "region_pl",
DROP COLUMN "region_pt",
DROP COLUMN "region_ru",
DROP COLUMN "region_ua",
DROP COLUMN "title_be",
DROP COLUMN "title_cz",
DROP COLUMN "title_de",
DROP COLUMN "title_en",
DROP COLUMN "title_es",
DROP COLUMN "title_fr",
DROP COLUMN "title_it",
DROP COLUMN "title_ja",
DROP COLUMN "title_lt",
DROP COLUMN "title_lv",
DROP COLUMN "title_pl",
DROP COLUMN "title_pt",
DROP COLUMN "title_ua";

-- AlterTable
ALTER TABLE "_countries" DROP COLUMN "title_be",
DROP COLUMN "title_cz",
DROP COLUMN "title_de",
DROP COLUMN "title_es",
DROP COLUMN "title_fr",
DROP COLUMN "title_it",
DROP COLUMN "title_ja",
DROP COLUMN "title_lt",
DROP COLUMN "title_lv",
DROP COLUMN "title_pl",
DROP COLUMN "title_pt",
DROP COLUMN "title_ua";
