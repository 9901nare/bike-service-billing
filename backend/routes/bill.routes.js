const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const billCtrl = require("../controllers/bill.controller");

const storage = multer.diskStorage({
  destination: "uploads/bills",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post(
  "/create",
  auth,
  upload.array("images", 5),
  billCtrl.createBill
);

router.get("/", auth, billCtrl.getAllBills);
router.get("/:id", auth, billCtrl.getBillById);

module.exports = router;
