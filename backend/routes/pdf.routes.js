const router = require("express").Router();
const db = require("../config/db");
const generatePDF = require("../utils/generateInvoice");

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const file = `invoice-${id}.pdf`;

  db.query(
    `SELECT * FROM bills b JOIN customers c ON b.customer_id=c.id WHERE b.id=?`,
    [id],
    (e, bill) => {
      db.query("SELECT * FROM bill_items WHERE bill_id=?", [id], (e, items) => {
        db.query("SELECT * FROM bill_images WHERE bill_id=?", [id], (e, imgs) => {
          generatePDF(bill[0], items, imgs, file);
          res.download(file);
        });
      });
    }
  );
});

module.exports = router;
