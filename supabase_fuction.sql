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


