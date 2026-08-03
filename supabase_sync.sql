-- 生活工作台 · 云端同步建表 SQL
-- 在 Supabase 控制台 → SQL Editor 里粘贴执行即可。
-- 安全模型：数据由浏览器端到端加密（AES-GCM），云端每行只存「密文」。
--   vault_id = SHA-256(同步密码)，不可猜测；payload = 密文。
--   即使有人拿到 anon 公钥，也只能读到一堆解不开的密文，没有密码无法还原。
--   因此 RLS 允许 anon 读写（安全性由加密保证，而非由 ACL 保证）。

create table if not exists sync_vault (
  vault_id   text primary key,
  payload    text not null,
  updated_at timestamptz not null default now()
);

-- 给 updated_at 自动刷新（上传时也会显式带，这里兜底）
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_sync_vault_upd on sync_vault;
create trigger trg_sync_vault_upd before update on sync_vault
  for each row execute function set_updated_at();

-- 开启行级安全
alter table sync_vault enable row level security;

-- 允许 anon 全部操作（数据本身是密文，vault_id 不可猜测，故无泄露风险）
drop policy if exists "anon_all_sync" on sync_vault;
create policy "anon_all_sync" on sync_vault
  for all to anon
  using (true) with check (true);
