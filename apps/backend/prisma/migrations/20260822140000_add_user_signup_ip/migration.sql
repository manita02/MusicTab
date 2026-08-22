-- AlterTable
ALTER TABLE "User" ADD COLUMN "signupIp" TEXT;

-- CreateIndex
CREATE INDEX "User_signupIp_idx" ON "User"("signupIp");
