const db = require("../config/db");

exports.createBill = (req, res) => {
  const {
    name,
    mobile,
    vehicle_number,
    vehicle_type,
    bill_date,
    items,
    total,
    payment_status
  } = req.body;

  // 1. Customer
  db.query(
    "INSERT INTO customers (name,mobile,vehicle_number,vehicle_type) VALUES (?,?,?,?)",
    [name, mobile, vehicle_number, vehicle_type],
    (err, customerRes) => {
      if (err) return res.status(500).json(err);

      const customerId = customerRes.insertId;

      // 2. Bill
      db.query(
        "INSERT INTO bills (customer_id,bill_date,total_amount,payment_status) VALUES (?,?,?,?)",
        [customerId, bill_date, total, payment_status],
        (err, billRes) => {
          if (err) return res.status(500).json(err);

          const billId = billRes.insertId;

          // 3. Bill Items
          JSON.parse(items).forEach(item => {
            db.query(
              "INSERT INTO bill_items (bill_id,service_name,qty,price) VALUES (?,?,?,?)",
              [billId, item.service, item.qty, item.price]
            );
          });

          // 4. Images
          req.files.forEach(file => {
            db.query(
              "INSERT INTO bill_images (bill_id,image_path) VALUES (?,?)",
              [billId, file.path]
            );
          });

          res.json({ message: "Bill created", billId });
        }
      );
    }
  );
};

exports.getAllBills = (req, res) => {
  db.query(
    `SELECT b.id,c.name,c.vehicle_number,b.total_amount,b.payment_status,b.created_at
     FROM bills b
     JOIN customers c ON b.customer_id=c.id
     ORDER BY b.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

exports.getBillById = (req, res) => {
  const id = req.params.id;

  db.query(
    `SELECT * FROM bills b
     JOIN customers c ON b.customer_id=c.id
     WHERE b.id=?`,
    [id],
    (err, bill) => {
      if (err) return res.status(500).json(err);

      db.query(
        "SELECT * FROM bill_items WHERE bill_id=?",
        [id],
        (err, items) => {
          db.query(
            "SELECT * FROM bill_images WHERE bill_id=?",
            [id],
            (err, images) => {
              res.json({ bill: bill[0], items, images });
            }
          );
        }
      );
    }
  );
};
