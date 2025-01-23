-- CreateTable
CREATE TABLE "_paymentTotour" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_paymentTotour_AB_unique" ON "_paymentTotour"("A", "B");

-- CreateIndex
CREATE INDEX "_paymentTotour_B_index" ON "_paymentTotour"("B");

-- AddForeignKey
ALTER TABLE "_paymentTotour" ADD CONSTRAINT "_paymentTotour_A_fkey" FOREIGN KEY ("A") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_paymentTotour" ADD CONSTRAINT "_paymentTotour_B_fkey" FOREIGN KEY ("B") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
