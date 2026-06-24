import { Migration } from '@mikro-orm/migrations';

export class Migration20260622023909 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "article" ("id" serial primary key, "title" varchar(255) not null, "content" text not null, "status" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "author_id" int not null);`,
    );

    this.addSql(
      `alter table "article" add constraint "article_author_id_foreign" foreign key ("author_id") references "user" ("id");`,
    );
    this.addSql(
      `alter table "article" add constraint "article_status_check" check ("status" in ('draft', 'published'));`,
    );

    this.addSql(
      `alter table "user" alter column "password" type text using ("password"::text);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "article" cascade;`);

    this.addSql(
      `alter table "user" alter column "password" type varchar(255) using ("password"::varchar(255));`,
    );
  }
}
