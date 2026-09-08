const express = require("express");
const { GetUsers, PostUsers } = require("../controller/userController");
const {
  paginationMiddleware,
  buildQueryMiddleware,
} = require("../middleware/paginationMiddleware");
const { listUsersSchema } = require("../validators/paginationValidator");

const router = express.Router();

router.get(
  "/users",
  paginationMiddleware(listUsersSchema),
  buildQueryMiddleware(
    ["name", "email", "number", "phone"],
    ["name", "email", "number", "phone", "createdAt"],
  ),
  GetUsers,
);
router.post("/users", PostUsers);

module.exports = router;
