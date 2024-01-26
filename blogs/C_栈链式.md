# 栈的链式存储结构（C 语言实现）

```c
#include <stdio.h>
#include <stdlib.h>

#define OK 1
#define ERR 2
#define TRUE 1
#define FALSE 0

typedef int status;    // 定义函数返回的状态，OK & ERR
typedef char datatype; // 定义栈数据类型，字符

typedef struct LinkStack_anon
{
  datatype data;               // 数据区
  struct LinkStack_anon *next; // 指针区
} LinkStack;

/* 栈的基本操作 */
LinkStack *createLinkStack(datatype first_node_value);
status isEmpty(LinkStack *L);
void clear(LinkStack **L);
datatype getTop(LinkStack *L);
int getLength(LinkStack *L);
status push(LinkStack *L, datatype node_to_push);
datatype pop(LinkStack *L);
void showStack(LinkStack *L);

int main()
{
  /* 测试 */
  LinkStack *root; // 指向一个通过createLinkStack函数创建的栈
  root = createLinkStack('f');
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  push(root, 'a');
  push(root, 'b');
  push(root, 'c');
  push(root, 'd');
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  showStack(root);
  putchar('\n');
  printf("pop = %c\n", pop(root));
  printf("pop = %c\n", pop(root));
  printf("getTop = %c\n", getTop(root));
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  showStack(root);
  putchar('\n');
  clear(&root);
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));

  return 0;
}

LinkStack *createLinkStack(datatype first_node_value)
{
  LinkStack *tmp;
  tmp = malloc(sizeof(LinkStack)); // void*类型指针能自己转到其他类型的指针
  tmp->data = first_node_value;    // 初始化栈顶的数据区
  tmp->next = NULL;                // 初始化栈顶的指针区
  return tmp;
}
status isEmpty(LinkStack *L)
{
  if (L == NULL)
    return TRUE;
  else
    return FALSE;
}
void clear(LinkStack **L)
{
  // 这个函数需要修改传入的实参的值，因此参数是双重指针
  // 函数clear将栈清空，这时实参应当指向NULL，因此需要在这个函数内修改实参的值
  if (isEmpty(*L) == FALSE)
  {
    // 不空才执行移除
    LinkStack *p, *q; // p始终指向当前要被移除的节点，而q始终指向要被移除的节点的下一个
    p = *L;           // 将p指向单链表的头节点，即栈的栈顶
    while (p != NULL)
    {
      // 不是NULL就继续
      q = p->next; // q始终指向下一个节点
      free(p);     // 释放p所指的节点
      p = q;       // 交换
    }
    *L = NULL; // 将指向栈的指针设为NULL
  }
}
datatype getTop(LinkStack *L)
{
  LinkStack *p = L;
  while (p && p->next != NULL) // 直到末节点
    p = p->next;
  return p->data;
}
int getLength(LinkStack *L)
{
  int i = 0;
  LinkStack *p = L;
  while (p)
  {
    i++;
    p = p->next;
  }
  return i;
}
status push(LinkStack *L, datatype node_to_push)
{
  // node_to_insert表示想要入栈的元素
  // 单链表中的尾插法
  LinkStack *s = malloc(sizeof(LinkStack)); // 等待入栈的新节点
  LinkStack *p = L;
  s->data = node_to_push;
  s->next = NULL;
  while (p && p->next != NULL) // 找到栈的末节点
    p = p->next;
  p->next = s;
  return OK;
}
datatype pop(LinkStack *L)
{
  // 尾移法
  datatype s;
  LinkStack *p = L;
  if (isEmpty(L))
    return ERR;                      // 空栈
  while (p && p->next->next != NULL) // 找到栈的末节点的前一个节点
    p = p->next;
  s = p->next->data; // 先将末节点的值保存
  free(p->next);     // 释放末节点
  p->next = NULL;
  return s; // 返回出栈的元素的值
}
void showStack(LinkStack *L)
{
  int i;
  int total = getLength(L);
  LinkStack *p = L;
  for (i = 0; i < total; i++)
  {
    printf("%c\t", p->data);
    p = p->next;
  }
}
/*
    对于链式存储的栈，不存在栈满的情况，除非已经没有任何的内存了，如果真的发生，操作系统早已经卡住了
*/
/* 环境: Code::Blocks with GCC 5.1 */
```

> 2020-01-22
