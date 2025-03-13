-- CreateTable
CREATE TABLE "TourAccessToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TourAccessToken_token_key" ON "TourAccessToken"("token");

-- CreateIndex
CREATE INDEX "TourAccessToken_tour_id_idx" ON "TourAccessToken"("tour_id");

-- AddForeignKey
ALTER TABLE "TourAccessToken" ADD CONSTRAINT "TourAccessToken_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
