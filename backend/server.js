// const express = require("express");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const mysql = require("mysql2");
// const multer = require("multer");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// /* =========================
//    DATABASE (MySQL)
// ========================= */
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "garage_db"
// });

// db.connect(err => {
//   if (err) console.log("❌ MySQL Error:", err.message);
//   else console.log("✅ MySQL Connected");
// });

// /* =========================
//    AUTH (LOGIN)
// ========================= */
// app.post("/api/auth/login", (req, res) => {
//   const token = jwt.sign({ garage: "TecnoCraft" }, "SECRET_KEY", {
//     expiresIn: "1d"
//   });
//   res.json({ token });
// });

// /* =========================
//    SIGNUP (REGISTER USER)
// ========================= */
// app.post("/api/auth/signup", (req, res) => {
//   const { name, email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Missing fields" });
//   }

//   // Demo signup (no DB yet)
//   res.json({
//     message: "Signup successful",
//     user: { name, email }
//   });
// });
// /* =========================
//    DASHBOARD STATS
// ========================= */
// app.get("/api/dashboard/stats", (req, res) => {
//   res.json({
//     totalBills: 120,
//     today: 3500,
//     month: 84500
//   });
// });

// /* =========================
//    FILE UPLOAD (BIKE PHOTOS)
// ========================= */
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });
// const upload = multer({ storage });

// /* =========================
//    CREATE BILL
// ========================= */
// app.post("/api/bills", upload.array("images", 5), (req, res) => {
//   const { customer, vehicle, total } = req.body;

//   res.json({
//     message: "Bill created",
//     customer,
//     vehicle,
//     total,
//     images: req.files.map(f => f.filename)
//   });
// });

// /* =========================
//    GET ALL BILLS
// ========================= */
// app.get("/api/bills", (req, res) => {
//   res.json([
//     { id: 1, customer: "Ravi", vehicle: "KA01AB1234", total: 1200 },
//     { id: 2, customer: "Amit", vehicle: "KA05CD5678", total: 900 }
//   ]);
// });

// /* =========================
//    GET SINGLE BILL
// ========================= */
// app.get("/api/bills/:id", (req, res) => {
//   res.json({
//     bill: {
//       id: req.params.id,
//       customer: "Ravi",
//       vehicle: "KA01AB1234",
//       total: 1200
//     },
//     items: [
//       { service: "Oil Change", price: 500 },
//       { service: "Brake Service", price: 700 }
//     ],
//     images: []
//   });
// });

// /* =========================
//    PDF GENERATION
// ========================= */
// app.get("/api/bills/:id/pdf", (req, res) => {
//   const doc = new PDFDocument();
//   const filePath = path.join(__dirname, `bill-${req.params.id}.pdf`);

//   doc.pipe(fs.createWriteStream(filePath));
//   doc.fontSize(20).text("Tecno Craft Bike Service", { align: "center" });
//   doc.moveDown();
//   doc.text(`Bill ID: ${req.params.id}`);
//   doc.text("Customer: Ravi");
//   doc.text("Vehicle: KA01AB1234");
//   doc.text("Total: ₹1200");
//   doc.end();

//   res.download(filePath);
// });

// /* =========================
//    SERVER START
// ========================= */
// app.get("/", (req, res) => {
//   res.send("🚲 Tecno Craft Garage Billing Backend Running");
// });

// app.listen(5000, () => {
//   console.log("✅ Backend running on http://localhost:5000");
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   DATABASE CONNECTION
========================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) console.error("❌ DB Error:", err.message);
  else console.log("✅ MySQL Connected");
});

/* =========================
   AUTH: SIGNUP
========================= */
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Signup successful" });
    }
  );
});

/* =========================
   AUTH: LOGIN
========================= */
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token });
    }
  );
});

/* =========================
   DASHBOARD STATS
========================= */
app.get("/api/dashboard/stats", (req, res) => {
  db.query("SELECT COUNT(*) total FROM bills", (err, total) => {
    if (err) return res.status(500).json(err);

    res.json({
      totalBills: total[0].total,
      today: 0,
      month: 0
    });
  });
});

/* =========================
   IMAGE UPLOAD
========================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });
/* =========================
   CREATE BILL (UPDATED)
========================= */
app.post("/api/bills", upload.array("images", 5), (req, res) => {
  try {
    const {
      customer_name,
      mobile1,
      mobile2,
      vehicle_number,
      vehicle_type,
      mechanic_name,
      total_amount,
      paid_amount,
      next_service_remarks,
      services,
      spares
    } = req.body;

    if (!customer_name || !vehicle_number || !services) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedServices = JSON.parse(services);
    const parsedSpares = spares ? JSON.parse(spares) : [];

    const total = Number(total_amount) || 0;
    const paid = Number(paid_amount) || 0;
    const pending = Math.max(total - paid, 0);
    const payment_status = pending === 0 ? "PAID" : "PENDING";

    /* CUSTOMER */
    db.query(
      `INSERT INTO customers 
       (name, mobile1, mobile2, vehicle_number, vehicle_type)
       VALUES (?,?,?,?,?)`,
      [customer_name, mobile1, mobile2, vehicle_number, vehicle_type],
      (err, customerResult) => {
        if (err) return res.status(500).json(err);

        const customerId = customerResult.insertId;

        /* BILL */
        db.query(
          `INSERT INTO bills 
           (customer_id, bill_date, total_amount, paid_amount, pending_amount,
            payment_status, mechanic_name, next_service_remarks)
           VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            total,
            paid,
            pending,
            payment_status,
            mechanic_name,
            next_service_remarks
          ],
          (err, billResult) => {
            if (err) return res.status(500).json(err);

            const billId = billResult.insertId;

            /* SERVICES */
            if (parsedServices.length) {
              const serviceValues = parsedServices.map(s => [
                billId,
                s.service_name,
                s.price
              ]);

              db.query(
                `INSERT INTO bill_services 
                 (bill_id, service_name, price) VALUES ?`,
                [serviceValues]
              );
            }

            /* SPARES */
            if (parsedSpares.length) {
              const spareValues = parsedSpares.map(s => [
                billId,
                s.spare_name,
                s.qty,
                s.price
              ]);

              db.query(
                `INSERT INTO bill_spares
                 (bill_id, spare_name, qty, price) VALUES ?`,
                [spareValues]
              );
            }

            /* IMAGES */
            if (req.files?.length) {
              const imgValues = req.files.map(f => [
                billId,
                f.filename
              ]);

              db.query(
                `INSERT INTO bill_images 
                 (bill_id, image_path) VALUES ?`,
                [imgValues]
              );
            }

            res.json({
              message: "✅ Bill created successfully",
              billId,
              payment_status
            });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid data format" });
  }
});


/* =========================
   GET ALL BILLS
========================= */
app.get("/api/bills", (req, res) => {
  db.query(
    `SELECT 
      b.id,
      b.bill_date,
      b.total_amount,
      b.payment_status,
      c.name,
      c.mobile,
      c.vehicle_number,
      c.vehicle_type
     FROM bills b
     JOIN customers c ON b.customer_id = c.id
     ORDER BY b.id DESC`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(rows);
    }
  );
});


/* =========================
   GET SINGLE BILL
========================= */
app.get("/api/bills/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    `SELECT 
      b.*, 
      c.name, 
      c.mobile1,
      c.mobile2,
      c.vehicle_number, 
      c.vehicle_type
     FROM bills b
     JOIN customers c ON b.customer_id = c.id
     WHERE b.id=?`,
    [id],
    (err, bill) => {
      if (err || !bill.length)
        return res.status(404).json({ message: "Bill not found" });

      db.query(
        "SELECT service_name, price FROM bill_services WHERE bill_id=?",
        [id],
        (err, services) => {

          db.query(
            "SELECT spare_name, qty, price FROM bill_spares WHERE bill_id=?",
            [id],
            (err, spares) => {

              db.query(
                "SELECT image_path FROM bill_images WHERE bill_id=?",
                [id],
                (err, images) => {
                  res.json({
                    bill: bill[0],
                    services,
                    spares,
                    images
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

app.get("/api/bills/:id/pdf", (req, res) => {
  const billId = req.params.id;

  db.query(
    `SELECT 
        b.id,
        b.total_amount,
        b.bill_date,
        c.vehicle_number,
        c.vehicle_type
     FROM bills b
     JOIN customers c ON b.customer_id = c.id
     WHERE b.id = ?`,
    [billId],
    (err, billResult) => {
      if (err || !billResult.length) {
        return res.status(404).json({ message: "Bill not found" });
      }

      db.query(
        `SELECT service_name, price FROM bill_services WHERE bill_id=?`,
        [billId],
        (err, services) => {
          if (err) services = [];

          db.query(
            `SELECT spare_name, qty, price FROM bill_spares WHERE bill_id=?`,
            [billId],
            (err, spares) => {
              if (err) spares = [];

              const bill = billResult[0];

              const PDFDocument = require("pdfkit");
              const fs = require("fs");
              const path = require("path");

              const doc = new PDFDocument({ size: "A4", margin: 40 });
              const pageWidth = doc.page.width;
              const pageHeight = doc.page.height;

              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                `attachment; filename=bill-${billId}.pdf`
              );

              doc.pipe(res);

              /* ================= PAGE BORDER ================= */
              doc
                .lineWidth(1)
                .rect(25, 25, pageWidth - 50, pageHeight - 50)
                .stroke("#000");

              /* ================= HEADER ================= */
              const headerTop = 40;
              const logoPath = path.join(__dirname, "uploads", "LOGO.png");
              const logoRightPath = path.join(__dirname, "uploads", "shell logo.png");

              // LOGO (LEFT, ALIGNED WITH TEXT)
              if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 20, headerTop + -30, { width: 85 });
              }

              // RIGHT LOGO (Shell)
              if (fs.existsSync(logoRightPath)) {
              doc.image(logoRightPath, pageWidth - 120, headerTop - 10, { width: 80 });
              }

              // CENTER TEXT
              doc
                .font("Helvetica-Bold")
                .fontSize(20)
                .text("Tecno Craft Bike Service", 0, headerTop, {
                  align: "center",
                });

              doc
                .font("Helvetica")
                .fontSize(11)
                .text("SHELL BIKE SERVICE POINT", 0, headerTop + 24, {
                  align: "center",
                });

              doc
                .fontSize(8)
                .text(
                  "No 2/3, Opp Model LIC Colony, Basaveshwaranagar, Bengaluru -79",
                  0,
                  headerTop + 40,
                  { align: "center" }
                );

              doc.y = headerTop + 75;

              /* ================= BILL INFO ================= */
              const infoY = doc.y;

              doc
                .font("Helvetica")
                .fontSize(11)
                .text(`Vehicle No : ${bill.vehicle_number}`, 50, infoY)
                .text(`Vehicle Type : ${bill.vehicle_type}`, 300, infoY)
                .text(
                  `Bill Date : ${new Date(bill.bill_date).toLocaleDateString()}`,
                  50,
                  infoY + 20
                );

              doc.moveDown(2);

           /* ================= SPARES ================= */
let y = doc.y;

if (spares.length) {
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Spares", 50);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();

  y = doc.y + 10;

  // Column headers (optional but professional)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Item", 60, y)
    .text("Qty", pageWidth - 220, y, { align: "center", width: 40 })
    .text("Amount", pageWidth - 120, y, { align: "right" });

  y += 12;
  doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke();
  y += 6;

  spares.forEach((s, i) => {
    const amount = Number(s.qty) * Number(s.price);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`${i + 1}. ${s.spare_name || "-"}`, 60, y)
      .text(`x${s.qty}`, pageWidth - 220, y, {
        align: "center",
        width: 40,
      })
      .text(`Rs. ${amount.toFixed(2)}`, pageWidth - 120, y, {
        align: "right",
      });

    y += 18;
  });

  doc.y = y + 10;
}

                  /* ================= SERVICES ================= */
                      if (services.length) {
                      doc
                     .font("Helvetica-Bold")
                     .fontSize(13)
                     .text("Services", 50);

                      doc.moveDown(0.5);
                      doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
 
                       y = doc.y + 8;

                       services.forEach((s, i) => {
                       doc
                        .font("Helvetica")
                        .fontSize(11)
                       .text(`${i + 1}. ${s.service_name}`, 60, y)
                       .text(`Rs. ${Number(s.price).toFixed(2)}`, pageWidth - 120, y, {
                        align: "right",
                        });

                      y += 18;
                   });

                  doc.y = y;
                }


              /* ================= TOTAL (FULL WIDTH) ================= */
              y += 20;

              doc
                .moveTo(50, y)
                .lineTo(pageWidth - 50, y)
                .lineWidth(1.2)
                .stroke();

              doc
                .font("Helvetica-Bold")
                .fontSize(15)
                .text( `TOTAL AMOUNT : Rs. ${Number(bill.total_amount).toFixed(2)}`,
                 0,
                 y + 10,
                   { align: "right", width: pageWidth - 60 }
                );


              /* ================= FOOTER ================= */
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(
                  "Thank you! Visit again",
                  0,
                  pageHeight - 55,
                  { align: "center" }
                );

              doc.end();
            }
          );
        }
      );
    }
  );
});

/* =========================
   DELETE BILL (SAFE)
========================= */
app.delete("/api/bills/:id", (req, res) => {
  const billId = req.params.id;

  // Step 1: delete services
  db.query(
    "DELETE FROM bill_services WHERE bill_id = ?",
    [billId],
    (err) => {
      if (err) return res.status(500).json(err);

      // Step 2: delete spares
      db.query(
        "DELETE FROM bill_spares WHERE bill_id = ?",
        [billId],
        (err) => {
          if (err) return res.status(500).json(err);

          // Step 3: delete images
          db.query(
            "DELETE FROM bill_images WHERE bill_id = ?",
            [billId],
            (err) => {
              if (err) return res.status(500).json(err);

              // Step 4: delete bill
              db.query(
                "DELETE FROM bills WHERE id = ?",
                [billId],
                (err, result) => {
                  if (err) return res.status(500).json(err);

                  if (result.affectedRows === 0) {
                    return res.status(404).json({
                      message: "Bill not found"
                    });
                  }

                  res.json({
                    message: " Bill deleted successfully"
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

//  autofill api spares //
app.get("/api/autocomplete/spares", (req, res) => {
  const q = req.query.q || "";

  db.query(
    `SELECT spare_name, price
     FROM spare_master
     WHERE spare_name LIKE ?
     ORDER BY spare_name
     LIMIT 8`,
    [`${q}%`],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

app.get("/api/autocomplete/services", (req, res) => {
  const q = req.query.q || "";

  db.query(
    `SELECT service_name, price
     FROM service_master
     WHERE service_name LIKE ?
     ORDER BY service_name
     LIMIT 8`,
    [`${q}%`],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});



/* =========================
   ROOT   
========================= */
app.get("/", (req, res) => {
  res.send("🚲 Tecno Craft Backend Running");
});

/* =========================
   SERVER
========================= */
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
});
