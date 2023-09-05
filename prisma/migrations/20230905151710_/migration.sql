/*
  Warnings:

  - A unique constraint covering the columns `[code,guild_id]` on the table `vex_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `vex_codes_code_guild_id_key` ON `vex_codes`(`code`, `guild_id`);
