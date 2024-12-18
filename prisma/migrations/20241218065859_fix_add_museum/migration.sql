-- DropForeignKey
ALTER TABLE "museum" DROP CONSTRAINT "museum_main_tour_id_fkey";

-- DropIndex
DROP INDEX "museum_main_tour_id_key";

-- CreateTable
CREATE TABLE "open_hour" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "museum_id" TEXT NOT NULL,

    CONSTRAINT "open_hour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "open_hour" ADD CONSTRAINT "open_hour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
