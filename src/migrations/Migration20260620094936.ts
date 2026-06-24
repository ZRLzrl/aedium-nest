import { Migration } from '@mikro-orm/migrations';

export class Migration20260620094936 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "user" ("id" serial primary key, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
