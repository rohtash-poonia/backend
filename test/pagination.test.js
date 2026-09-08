const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculatePagination,
  buildListQuery,
} = require("../src/utils/paginationUtils");

test("calculatePagination normalizes invalid page and limit values", () => {
  assert.deepStrictEqual(calculatePagination("0", "5"), {
    skip: 0,
    limit: 5,
    page: 1,
  });

  assert.deepStrictEqual(calculatePagination("-2", "-3"), {
    skip: 0,
    limit: 10,
    page: 1,
  });
});

test("buildListQuery uses page-based skip and limit values", () => {
  const query = buildListQuery(
    { page: "3", limit: "4" },
    { searchFields: ["name"] },
  );

  assert.strictEqual(query.skip, 8);
  assert.strictEqual(query.limit, 4);
  assert.strictEqual(query.page, 3);
});

test("buildListQuery applies search, filter, sort, and pagination together", () => {
  const query = buildListQuery(
    {
      page: "2",
      limit: "3",
      search: "ali",
      sortBy: "name",
      sortOrder: "asc",
      role: "admin",
      email: "ali@example.com",
    },
    {
      searchFields: ["name", "email"],
      sortFields: ["name", "email", "createdAt"],
    },
  );

  assert.strictEqual(query.skip, 3);
  assert.strictEqual(query.limit, 3);
  assert.strictEqual(query.page, 2);
  assert.deepStrictEqual(query.sort, { name: 1 });
  assert.deepStrictEqual(query.filter, {
    $or: [{ name: { $regex: /ali/i } }, { email: { $regex: /ali/i } }],
    role: "admin",
    email: "ali@example.com",
  });
});
