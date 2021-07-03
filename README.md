# Prisma Query Builder

A query builder that parse and builds a prisma query format based off your url query parameters (expressjs url format)
**Works with nestjs and any express js application**

# Usage

- simply pass in your request query to a new instance of the query builder
- req.query in regular express js app
- @Query() query: any -- in a nestjs app
- supports filtering, selection, sorting and pagination
