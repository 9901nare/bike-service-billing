const PDFDocument = require("pdfkit");
const fs = require("fs");

module.exports = (bill, items, images, filePath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Tecno Craft Bike Service", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Customer: ${bill.name}`);
  doc.text(`Vehicle: ${bill.vehicle_number}`);
  doc.text(`Date: ${bill.bill_date}`);
  doc.moveDown();

  items.forEach(i => {
    doc.text(`${i.service_name}  x${i.qty}  ₹${i.price}`);
  });

  doc.moveDown().text(`Total: ₹${bill.total_amount}`);

  images.forEach(img => {
    doc.addPage().image(img.image_path, { width: 300 });
  });

  doc.end();
};
