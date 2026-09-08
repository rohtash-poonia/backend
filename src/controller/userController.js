const Users = require("../model/userModels");
const { formatListResponse } = require("../utils/paginationUtils");

const GetUsers = async (req, res) => {
  try {
    const mongoQuery = req.mongoQuery || {
      filter: {},
      sort: { createdAt: -1 },
      skip: 0,
      limit: 10,
      page: 1,
    };

    const { filter, sort, skip, limit, page } = mongoQuery;

    const [users, total] = await Promise.all([
      Users.find(filter).sort(sort).skip(skip).limit(limit),
      Users.countDocuments(filter),
    ]);

    const response = formatListResponse(users, total, page, limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const PostUsers = async (req, res) => {
  try {
    const postUsers = await Users.create(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: postUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

module.exports = { GetUsers, PostUsers };
