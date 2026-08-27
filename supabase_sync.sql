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

-- 安全策略：只允许 anon 读/写/更新，不发删除权限。
-- 数据本身是端到端加密密文，vault_id 不可猜测，无泄露风险；
-- 撤掉 DELETE/ALL 可防止拿到 anon key 的人清空云端整表。
-- 先清理旧的危险策略，再建三张安全通行证（可重复执行）。
drop policy if exists "anon_all_sync" on sync_vault;
drop policy if exists "vault_select" on sync_vault;
drop policy if exists "vault_insert" on sync_vault;
drop policy if exists "vault_update" on sync_vault;

create policy "vault_select" on sync_vault
  for select to anon
  using (true);

create policy "vault_insert" on sync_vault
  for insert to anon
  with check (true);

create policy "vault_update" on sync_vault
  for update to anon
  using (true) with check (true);
