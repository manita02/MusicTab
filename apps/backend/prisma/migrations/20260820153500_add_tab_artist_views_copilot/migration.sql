-- CreateTable
CREATE TABLE "TabView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tabId" INTEGER NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TabView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TabView_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "Tab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopilotDailyUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopilotDailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL DEFAULT '',
    "urlYoutube" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "urlPdf" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Tab_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tab" ("createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId") SELECT "createdAt", "genreId", "id", "instrumentId", "title", "urlImagen", "urlPdf", "urlYoutube", "userId" FROM "Tab";
DROP TABLE "Tab";
ALTER TABLE "new_Tab" RENAME TO "Tab";
CREATE UNIQUE INDEX "Tab_title_key" ON "Tab"("title");
CREATE INDEX "Tab_artist_idx" ON "Tab"("artist");
CREATE INDEX "Tab_genreId_createdAt_idx" ON "Tab"("genreId", "createdAt");
CREATE INDEX "Tab_instrumentId_createdAt_idx" ON "Tab"("instrumentId", "createdAt");
CREATE INDEX "Tab_viewCount_idx" ON "Tab"("viewCount");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TabView_userId_viewedAt_idx" ON "TabView"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "TabView_tabId_idx" ON "TabView"("tabId");

-- CreateIndex
CREATE UNIQUE INDEX "CopilotDailyUsage_userId_date_key" ON "CopilotDailyUsage"("userId", "date");
