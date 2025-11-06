-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "urlYoutube" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "urlPdf" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    CONSTRAINT "Tab_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tab" ("createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId") SELECT "createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId" FROM "Tab";
DROP TABLE "Tab";
ALTER TABLE "new_Tab" RENAME TO "Tab";
CREATE UNIQUE INDEX "Tab_title_key" ON "Tab"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
