const QueryBuilder = require("./../dist/index.js");

console.log(QueryBuilder);

const qb = new QueryBuilder.default({
  firstname: "Ade",
  lastname: "Tom",
  select: "name,type,body",
  sort: "-createdAt, name",
  spaceUsed: { gt: 10 },
});

console.log(
  qb
    .filter()
    .paginate()
    .select()
    .select()
    .build()
);
