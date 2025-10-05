/*
  Warnings:

  - You are about to drop the column `estado` on the `Tab` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "urlYoutube" TEXT,
    "urlImagen" TEXT,
    "urlPdf" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    CONSTRAINT "Tab_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tab" ("createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId") SELECT "createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId" FROM "Tab";
DROP TABLE "Tab";
ALTER TABLE "new_Tab" RENAME TO "Tab";
CREATE UNIQUE INDEX "Tab_title_key" ON "Tab"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_name_key" ON "Instrument"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
