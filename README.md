# supabase-cn-text-search-demo
Demo for cn text-search based on supabase(postgresql).
## 项目要求
### GitHub bounty地址：[地址](https://github.com/orgs/NonceGeek/discussions/333)

### Q & A
Q：中文全文检索是要达成怎样的效果呢?

A：
> 需要在 Supabase 里调用，最好使用 deno 方案。
> 可以参考这篇英文全文检索的文档：[地址](https://supabase.com/docs/guides/database/full-text-search?queryGroups=example-view&example-view=sql&queryGroups=language&language=sql)。
> 把它改成中文检索指南。目标就是实现一个建议搜索引擎。
> 我理解是在查询前做分词，然后将分词结果存储在一个 array 字段里，全文检索通过检索 array 字段实现。
> 用 sql 写查询方法。然后通过 supabase.rpc调用。
> 这里有一个我之前写的例子：[地址](https://github.com/NonceGeek/bodhi-searcher/blob/main/deno_edge_functions/bodhi_data_getter.tsx)

Q：可以能给我看一下SQL函数`embedding_search_bodhi_text_assets_k_v_space_145`是怎么写的吗?

A：
```SQL
create or replace function embedding_search_bodhi_text_assets_k_v_space_145 (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id int,
  data text,
  metadata json,
  creator text,
  id_on_chain int,
  similarity float
)
language sql stable
as $$
  select
    bodhi_text_assets_k_v_space_145.id,
    bodhi_text_assets_k_v_space_145.data,
    bodhi_text_assets_k_v_space_145.metadata,
    bodhi_text_assets_k_v_space_145.creator,
    bodhi_text_assets_k_v_space_145.id_on_chain,
    1 - (bodhi_text_assets_k_v_space_145.embedding_1024 <=> query_embedding) as similarity
  from bodhi_text_assets_k_v_space_145
  where bodhi_text_assets_k_v_space_145.embedding_1024 <=> query_embedding < 1 - match_threshold
  order by bodhi_text_assets_k_v_space_145.embedding_1024 <=> query_embedding
  limit match_count;
$$;
```
### 项目提交地址：[地址](https://github.com/NonceGeek/supabase-cn-text-search-demo)

## 项目实现原理
1. 在supabase中新建一个数据库，获取到SUPABASE_KEY和SUPABASE_URL，在env文件里写入这两个值
```shell
SUPABASE_KEY=XXX
SUPABASE_URL=https://XXX.supabase.co
```
2. 使用以下SQL语句创建测试用例表并且插入测试用例数据

```SQL
CREATE TABLE books (  
  id SERIAL PRIMARY KEY,  
  title TEXT,  
  author TEXT,  
  description TEXT  
);  

create index books_description_pgroonga_idx
on books
using pgroonga (description);
  
INSERT INTO books  
  (title, author, description)  
VALUES  
  (  
    '小懒狗',  
    '简妮特·塞布林·洛里',  
    '这只小狗比其他更大些的动物动作更慢。'  
  ),  
  (  
    '彼得兔的故事',  
    '碧翠克斯·波特',  
    '小兔子彼得爱吃各种蔬菜。'  
  ),  
  (  
    '托特尔',  
    '葛丽塔·克兰普顿',  
    '小火车托特尔怀揣着伟大的梦想。'  
  ),  
  (  
    '绿鸡蛋和火腿',  
    '苏斯博士',  
    '萨姆改变了饮食偏好，开始吃颜色不寻常的食物。'  
  ),  
  (  
    '哈利·波特与火焰杯',  
    'J.K. 罗琳',  
    '哈利迎来第四年的霍格沃茨生活，随之而来的是巨大的挑战和戏剧性事件。'  
  ),  
  (  
    '彼得兔的故事2',  
    '彼得兔的故事2',  
    '彼得兔的故事2'  
  );
```
3. 写一个postgreSQL函数来支持中文搜索

```SQL
create or replace function search_books (  
  query_text text,  
  max_results int  
)  
returns table (  
  id int,  
  title text,  
  author text,  
  description text  
)  
language sql stable  
as $$  
  select  
    books.id,  
    books.title,  
    books.author,  
    books.description  
  from books  
  where description &@~ '兔';  
  order by books.id  
  limit max_results;  
$$;
```
4. 使用DENO来调用该PostgreSQL函数

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";  
// Import the load function from deno-dotenv  
import { config } from "https://deno.land/x/dotenv/mod.ts";  
  
// Load environment variables from the .env file  
const env = config();  
// Access the environment variables  
const supabaseUrl = env.SUPABASE_URL ?? "";  
const supabaseKey = env.SUPABASE_KEY ?? "";  
// create a new Supabase client  
const supabase = createClient(supabaseUrl, supabaseKey)  
// perform a stored procedure call  
const { data, error } = await supabase.rpc("search_books", {  
    query_text: "兔",  
    max_results: 2  
})  
  
console.log(data, error)
```
