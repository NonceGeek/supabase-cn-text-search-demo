# supabase-cn-text-search-demo
## 项目目标

本项目的目标是在supabase中实现中文全文搜索，实现一个建议搜索引擎。

本项目bounty地址：[地址](https://github.com/orgs/NonceGeek/discussions/333)。

项目地址：[地址](https://github.com/NonceGeek/supabase-cn-text-search-demo)。

## 项目要求

1. 项目需要基于Supabase。
2. 项目需要使用Deno来调用。
3. 项目最终暴露给用户的是一个api，输入中文查询内容后返回查询查询结果。

## 项目思路

1. 在Supabase中新建一个数据库。
2. 在数据库中插入测试用例表以及测试用例数据。
3. 打开pgroonga插件，开启该插件后可以使Supabase支持中文检索。
4. 在目标列上建立pgroonga索引。
5. 写一个PostgreSQL函数，在函数中使用pgroonga操作符`&@~`进行中文检索。
6. 在Deno中开启一个web服务器，并且接受`/search`请求。
7. 在`/search`请求中，使用`supabase.rpc`调用PostgreSQL函数，完成将用户请求转化为Supabase全文检索。


## 项目实现
1. 在Supabase中新建一个数据库，然后在输出页面获取到SUPABASE_KEY和SUPABASE_URL这两个值。把这两个值写入`.env`文件，实现敏感信息与生产环境隔离。
```shell
SUPABASE_KEY=XXX
SUPABASE_URL=https://XXX.supabase.co
```
2. 在Supabase数据库插件页面，打开pgroonga插件。开启该插件后可以使Supabase支持中文检索。
3. 执行以下SQL语句创建测试用例表、创建pgroonga插件、在`description`列创建pgroonga索引、插入测试用例数据。

```SQL
# 创建测试用例表
CREATE TABLE books (  
  id SERIAL PRIMARY KEY,  
  title TEXT,  
  author TEXT,  
  description TEXT  
);  
# 创建pgroonga插件
CREATE EXTENSION pgroonga;

# 在description列创建pgroonga索引
create index books_description_pgroonga_idx
on books
using pgroonga (description);

# 插入测试用例数据
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
4. 执行下面SQL即可创建一个PostgreSQL函数，在函数中我们使用pgroonga操作符`&@~`进行中文检索。

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
  where description &@~ '兔' 
  order by books.id  
  limit max_results;  
$$;
```
5. 在Deno中开启一个web服务器，并且接受`/search`请求。在`/search`请求中，使用`supabase.rpc`调用PostgreSQL函数，完成将用户请求转化为Supabase全文检索。

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Import the load function from deno-dotenv
import { config} from "https://deno.land/x/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const router = new Router();

router
    .get("/search", async (context) => {
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

        if (error) {
            context.response.status = 500;
            context.response.body = { error: error.message };
            return;
        }

        context.response.body = data;
    })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```



## Reference

1. [Supabase英文全文检索文档](https://supabase.com/docs/guides/database/full-text-search?queryGroups=example-view&example-view=sql&queryGroups=language&language=sql)。
2. Deno Web服务器示例：[地址](https://github.com/NonceGeek/bodhi-searcher/blob/main/deno_edge_functions/bodhi_data_getter.tsx)。
3. PostgreSQL函数示例：`embedding_search_bodhi_text_assets_k_v_space_145`。
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