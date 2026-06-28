import { Attributes, DB, Statement, StringMap, Transaction } from "onecore";
import { metadata } from "pg-extension";
import { buildToInsert, buildToUpdate } from "sql-core";

export interface BaseRate {
  rate: number;
  rates: number[];
}
export class SqlRatesRepository<R extends BaseRate> {
  constructor(protected db: DB, protected table: string, protected attributes: Attributes, protected max: number, protected fullTable: string, protected tables: string[],
    protected buildToSave: <K>(obj: K, table: string, attrs: Attributes, ver?: string, buildParam?: (i: number) => string, i?: number) => Statement | undefined,
    protected generateId: () => string, protected rateIdField: string, rateField?: string, count?: string, score?: string, authorCol?: string, id?: string, idField?: string, idCol?: string,
    rateCol?: string) {
    const m = metadata(attributes);
    this.map = m.map;
    this.id = (id && id.length > 0 ? id : 'id');
    this.rate = (rateCol && rateCol.length > 0 ? rateCol : 'rate');
    this.count = (count && count.length > 0 ? count : 'count');
    this.score = (score && score.length > 0 ? score : 'score');
    this.idField = (idField && idField.length > 0 ? idField : 'id');
    this.rateField = (rateField && rateField.length > 0 ? rateField : 'rate');
    this.authorCol = (authorCol && authorCol.length > 0 ? authorCol : 'author');
    if (idCol && idCol.length > 0) {
      this.idCol = idCol;
    } else {
      const c = attributes[this.idField];
      if (c) {
        this.idCol = (c.column && c.column.length > 0 ? c.column : this.idField);
      } else {
        this.idCol = this.idField;
      }
    }
    if (rateCol && rateCol.length > 0) {
      this.rate = rateCol;
    } else {
      const c = attributes[this.rateField];
      if (c) {
        this.rate = (c.column && c.column.length > 0 ? c.column : this.rateField);
      } else {
        this.rate = this.rateField;
      }
    }
    this.load = this.load.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.insertOrUpdateInfo = this.insertOrUpdateInfo.bind(this);
    this.insertOrUpdateFullInfo = this.insertOrUpdateFullInfo.bind(this);
    //this.updateFullInfo = this.updateFullInfo.bind(this);
    //this.updateNewInfo = this.updateNewInfo.bind(this);
    this.updateOldInfo = this.updateOldInfo.bind(this);
  }
  map?: StringMap;
  count: string;
  score: string;
  id: string;
  rate: string;
  idField: string;
  rateField: string;
  idCol: string;
  authorCol: string;

  load(id: string, author: string, tx?: Transaction): Promise<R | null> {
    const db = tx ? tx : this.db
    return db.query<R>(`select * from ${this.table} where ${this.idCol} = ${this.db.param(1)} and ${this.authorCol} = ${this.db.param(2)}`, [id, author], this.map).then(rates => {
      return rates && rates.length > 0 ? rates[0] : null;
    });
  }
  create(rate: R, tx?: Transaction): Promise<number> {
    if (rate.rates.length !== this.tables.length) {
      return Promise.reject('Invalid rates length');
    }
    const obj: any = rate;
    obj[this.rateIdField] = this.generateId()
    const id: string = obj[this.idField];
    console.log("JSON rate " + JSON.stringify(rate))
    const mainStmt = buildToInsert<R>(rate, this.table, this.attributes, this.db.param);
    if (!mainStmt.query) {
      return Promise.reject('cannot build to insert rate');
    }
    const stmts: Statement[] = [];
    stmts.push(mainStmt);
    const params: any[] = []
    for (let i = 0; i < rate.rates.length; i++) {
      const sql = this.insertOrUpdateInfo(rate.rates[i], this.tables[i]);
      // console.log(sql)
      stmts.push({ query: sql, params: [id] });
      params.push(id)
    }
    params.push(id)
    const fullStmt: Statement = { query: this.insertOrUpdateFullInfo(rate.rate, this.fullTable, this.tables), params };
    stmts.push(fullStmt);

    // console.log(JSON.stringify(stmts));

    //return this.db.execute(fullStmt.query, fullStmt.params)
    console.log(mainStmt.query)
    return this.db.execute(mainStmt.query, mainStmt.params)
    //return Promise.resolve(1)
    // return this.db.executeBatch(stmts);
  }
  protected insertOrUpdateInfo(r: number, table: string): string {
    const rateCols: string[] = [];
    const ps: string[] = [];
    for (let i = 1; i <= this.max; i++) {
      rateCols.push(`${this.rate}${i}`);
      if (i === r) {
        ps.push('1');
      } else {
        ps.push('0');
      }
    }
    const query = `
      insert into ${table} (${this.id}, ${this.rate}, ${this.count}, ${this.score}, ${rateCols.join(',')})
      values (${this.db.param(1)}, ${r}, 1, ${r}, ${ps.join(',')})
      on conflict (${this.id}) do update set ${this.rate} = (${table}.${this.score} + ${r})/(${table}.${this.count} + 1), ${this.count} = ${table}.${this.count} + 1, ${this.score} = ${table}.${this.score} + ${r}, ${this.rate}${r} = ${table}.${this.rate}${r} + 1`;
    return query;
  }
  protected updateNewInfo(r: number, table: string): string {
    const query = `
      update ${table} set ${this.rate} = (${this.score} + ${r})/(${this.count} + 1), ${this.count} = ${this.count} + 1, ${this.score} = ${this.score} + ${r}, ${this.rate}${r} = ${this.rate}${r} + 1
      where ${this.id} = ${this.db.param(1)}`;
    return query;
  }
  protected insertOrUpdateFullInfo(r: number, table: string, tables: string[]): string {
    const rateCols: string[] = [];
    const s: string[] = [];
    const us: string[] = [];
    let i = 1
    for (i = 1; i <= tables.length; i++) {
      rateCols.push(`${this.rate}${i}`);
      s.push(`coalesce((select avg(${this.rate}) from ${tables[i - 1]} where ${this.id} = ${this.db.param(i)} group by ${this.id}), 0)`);
      us.push(`${this.rate}${i} = coalesce((select avg(${this.rate}) from ${tables[i - 1]} where ${this.id} = ${this.db.param(i)} group by ${this.id}), 0)`);
    }
    const query = `
      insert into ${table} (${this.id}, ${this.rate}, ${this.count}, ${this.score}, ${rateCols.join(', ')})
      values (${this.db.param(i++)}, ${r}, 1, ${r}, ${s.join(',')})
      on conflict (${this.id}) do update set ${this.rate} = (${table}.${this.score} + ${r})/(${table}.${this.count} + 1), ${this.score} = ${table}.${this.score} + ${r},${this.count} = ${table}.${this.count} + 1, ${us.join(',')}`;
    // console.log("query " + query)
    return query;
  }
  /*
  protected updateFullInfo(r: number, table: string, tables?: string[]): string {
    if (tables && tables.length > 0) {
      const s: string[] = [];
      let i = 1
      for (i = 1; i <= tables.length; i++) {
        s.push(`${this.rate}${i} = (select avg(${this.rate}) from ${tables[i - 1]} where ${this.id} = ${this.db.param(i)} group by ${this.id})`);
      }
      const query = `
        update ${table} set ${this.rate} = (${this.score} + ${r})/(${this.count} + 1), ${this.score} = ${this.score} + ${r},${this.count} = ${this.count} + 1, ${s.join(',')}
        where ${this.id} = ${this.db.param(6)}`;
      return query;
    } else {
      const query = `
        update ${table} set ${this.rate} = (${this.score} + ${r})/(${this.count} + 1), ${this.score} = ${this.score} + ${r}, ${this.count} = ${this.count} + 1
        where ${this.id} = ${this.db.param(6)}`;
      return query;
    }
  }*/

  protected updateOldInfo(newRate: number, oldRate: number, table: string, tables?: string[]): string {
    const delta = newRate - oldRate;
    const s: string[] = [];
    let i = 1
    if (tables && tables.length > 0) {
      for (i = 1; i <= tables.length; i++) {
        s.push(`${this.rate}${i} = coalesce((select avg(${this.rate}) from ${tables[i - 1]} where ${this.id} = ${this.db.param(i)} group by ${this.id}), 0)`);
      }
      const query = `
        update ${table} set ${this.rate} = (${this.score} + ${delta})/${this.count}, ${this.score} = ${this.score} + ${delta}, ${this.count} = ${this.count}, ${s.join(',')}
        where ${this.id} = ${this.db.param(i++)}`;
      return query;
    } else {
      const query = `
        update ${table} set ${this.rate} = (${this.score} + ${delta})/${this.count}, ${this.score} = ${this.score} + ${delta}, ${this.count} = ${this.count}
        where ${this.id} = ${this.db.param(i++)}`;
      return query;
    }
  }
  update(rate: R, oldRate: number): Promise<number> {
    const rates = rate.rates;
    const r = rate.rate;
    const stmts: Statement[] = [];
    const stmt = buildToUpdate(rate, this.table, this.attributes, this.db.param);
    if (r && rates && rates.length > 0) {
      if (stmt.query) {
        const obj: any = rate;
        const id: string = obj[this.idField];
        for (let i = 0; i < rate.rates.length; i++) {
          const sql = this.insertOrUpdateInfo(rate.rates[i], this.tables[i]);
          stmts.push({ query: sql, params: [id] });
        }
        const query: Statement = { query: this.updateOldInfo(rate.rate, oldRate, this.fullTable, this.tables), params: [id, id, id, id, id, id] };
        stmts.push(query);
        stmts.push(stmt);
        return this.db.executeBatch(stmts, true);
      } else {
        return Promise.resolve(-1);
      }
    } else {
      if (!stmt.query) {
        return Promise.reject('cannot build to insert rate');
      } else {
        stmts.push(stmt);
        return this.db.executeBatch(stmts, true);
      }
    }
  }
}

export interface History {
  rates: number[];
  time: Date;
  review?: string;
}
export interface Rates {
  id: string;
  author: string;
  rate: number;
  rates: number[];
  time: Date;
  review?: string;
  histories?: History[];
  // usefulCount: number;
  // replyCount: number;
}
export interface BaseRepository<R> {
  create(rate: R): Promise<number>;
  update(rate: R, oldRate: number): Promise<number>;
  load(id: string, author: string): Promise<R | null>;
}
export function avg(n: number[]): number {
  let sum = 0;
  for (const s of n) {
    sum = sum + s;
  }
  return sum / n.length;
}
export interface SubmittedRate {
  id: string;
  author: string;
  rates: number[];
  review?: string;
}
export class Rater {
  constructor(protected repository: BaseRepository<Rates>) {
    this.rate = this.rate.bind(this);
  }
  async rate(rateReq: SubmittedRate): Promise<number> {
    const r = avg(rateReq.rates)
    const rate: Rates = { id: rateReq.id, author: rateReq.author, rate: r, rates: rateReq.rates, time: new Date(), review: rateReq.review }
    rate.time = new Date();
    const exist = await this.repository.load(rate.id, rate.author);
    if (!exist) {
      const r1 = await this.repository.create(rate);
      return r1;
    }
    const sr: History = { review: exist.review, rates: exist.rates, time: exist.time };
    if (exist.histories && exist.histories.length > 0) {
      const history = exist.histories;
      history.push(sr);
      rate.histories = history;
    } else {
      rate.histories = [sr];
    }
    const res = await this.repository.update(rate, exist.rate);
    return res;
  }
}
