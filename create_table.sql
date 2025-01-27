CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT,
  author TEXT,
  description TEXT
);

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