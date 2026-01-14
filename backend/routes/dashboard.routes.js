const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const db = require("../config/db");

router.get("/stats", auth, (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) total FROM bills", (e, r) => {
    stats.totalBills = r[0].total;

    db.query(
      "SELECT SUM(total_amount) total FROM bills WHERE DATE(created_at)=CURDATE()",
      (e, r) => {
        stats.today = r[0].total || 0;

        db.query(
          "SELECT SUM(total_amount) total FROM bills WHERE MONTH(created_at)=MONTH(CURDATE())",
          (e, r) => {
            stats.month = r[0].total || 0;
            res.json(stats);
          }
        );
      }
    );
  });
});

module.exports = router;
