// ?name=Ade&limit=10&page=2&sort=date&sort=-name&spaceUsed[gt]=50&select=name,type

class QueryBuilder {
  private queryBuild: any;
  public query: any;
  private hasFiltered = false;
  private hasSort = false;
  private hasSelect = false;
  private hasPaginate = false;

  constructor(query?: string) {
    this.query = query || {};
  }

  filter() {
    const filterObj = this.excludeFields(this.query, [
      "sort",
      "select",
      "page",
      "perPage",
      "populate",
    ]);

    let where = this.normalizeMathOperatorsRecursive(filterObj);
    where = this.filterRecursive(where);
    const filtered = { where };

    this.queryBuild = { ...this.queryBuild, ...filtered };
    this.hasFiltered = true;
    return this;
  }

  sort() {
    const sort =
      this.selectOnlyFields(this.query, ["sort"]).sort || "-created_at";
    const orderBy = sort.split(",").map((s: string) => ({
      [s.startsWith("-") ? s.slice(1, s.length) : s]: s.startsWith("-")
        ? "desc"
        : "asc",
    }));

    this.queryBuild = { ...this.queryBuild, orderBy };
    this.hasSort = true;
    return this;
  }

  select() {
    const selectFields = this.selectOnlyFields(this.query, ["select"]).select;
    const selections = this.getRecursiveSelection(selectFields);
    this.queryBuild = {
      ...this.queryBuild,
      ...selections,
    };
    this.hasSelect = true;
    return this;
  }

  paginate() {
    let { page, perPage } = this.selectOnlyFields(this.query, [
      "page",
      "perPage",
    ]);

    page = parseInt(page) || 1;
    perPage = parseInt(perPage) || 10;

    this.queryBuild = {
      ...this.queryBuild,
      skip: perPage * (page - 1),
      take: perPage,
    };

    this.hasPaginate = true;
    return this;
  }

  build(actions?: string[]) {
    if (!this.hasFiltered && actions?.includes("filter")) {
      this.filter();
    }

    if (!this.hasSort && actions?.includes("sort")) {
      this.sort();
    }

    if (!this.hasSelect && actions?.includes("select")) {
      this.select();
    }

    if (!this.hasPaginate && actions?.includes("paginate")) {
      this.paginate();
    }

    return this.queryBuild;
  }

  private excludeFields(o: Record<string, unknown>, ex: string[]) {
    const e = { ...o };

    for (const t in e) {
      if (ex.includes(t)) delete e[t];
    }

    return e;
  }

  private selectOnlyFields(o: Record<string, unknown>, ex: string[]) {
    const e: any = {};

    ex.forEach((i) => (e[i] = o[i]));

    return e;
  }

  private normalizeMathOperatorsRecursive(filters: any) {
    if (!filters || Object.keys(filters).length < 1) return {};

    let normalized = {};
    for (const key in filters) {
      const value = filters[key];
      if (typeof value !== "string")
        normalized = {
          ...normalized,
          [key]: this.normalizeMathOperatorsRecursive(value),
        };
      else if (!isNaN(value as any))
        normalized = { ...normalized, [key]: parseInt(value) };
      else normalized = { ...normalized, [key]: value };
    }

    return normalized;
  }

  private filterRecursive(filters: any) {
    if (!filters || Object.keys(filters).length < 1) return {};

    let normalized = {};
    for (const key in filters) {
      const value = filters[key];
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        normalized = {
          ...normalized,
          [parent]: { [child]: value },
        };
      } else {
        normalized = { ...normalized, [key]: value };
      }
    }

    return normalized;
  }

  private getRecursiveSelection(selectClause: string): Record<string, unknown> {
    if (!selectClause) return {};

    if (selectClause.includes(",")) {
      let r = {};
      const s = selectClause.split(",");
      for (const i of s) {
        r = { ...r, ...this.getRecursiveSelection(i) };
      }
      return { select: r };
    }

    if (selectClause.includes(".")) {
      const [c, ...rest] = selectClause.split(".");
      const rj = rest.join();
      const sd = rj.slice(1, rj.length - 1);

      return {
        [c]: { ...this.getRecursiveSelection(sd) },
      };
    }

    if (selectClause.includes("|")) {
      let r = {};
      const s = selectClause.split("|");
      for (const i of s) {
        r = { ...r, ...this.getRecursiveSelection(i) };
      }
      return { select: r };
    }

    return {
      [selectClause]: true,
    };
  }
}

export default QueryBuilder;
