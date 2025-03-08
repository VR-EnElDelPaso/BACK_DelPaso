-- CreateEnum
CREATE TYPE "CopyType" AS ENUM ('HEADER', 'PARAGRAPH', 'BUTTON', 'SUBTITLE', 'LINK', 'CALLOUT');

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrousel" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "carrousel_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Copy" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "type" "CopyType" NOT NULL,
    "content" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Carrousel_page_id_idx" ON "Carrousel"("page_id");

-- CreateIndex
CREATE INDEX "Slide_carrousel_id_idx" ON "Slide"("carrousel_id");

-- CreateIndex
CREATE INDEX "Copy_entity_id_idx" ON "Copy"("entity_id");

-- CreateIndex
CREATE INDEX "Copy_parent_id_idx" ON "Copy"("parent_id");

-- AddForeignKey
ALTER TABLE "Carrousel" ADD CONSTRAINT "Carrousel_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_carrousel_id_fkey" FOREIGN KEY ("carrousel_id") REFERENCES "Carrousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
