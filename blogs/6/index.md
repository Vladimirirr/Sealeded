# 队列的按次存储结构（循环队列）（C 语言实现）

```c
#include <stdio.h>
#include <stdlib.h>

#define OK 1
#define ERR 2
#define TRUE 1
#define FALSE 0
#define MAXSIZE 4 // 定义队列的最大长度

typedef int status;    // 定义函数返回的状态，OK & ERR
typedef char datatype; // 定义队列中每个元素的数据类型，这里暂定字符

typedef struct
{
  datatype data[MAXSIZE]; // 每个元素
  int front, rear;        // 指针
} SequenceQueue;

/* 函数 */
SequenceQueue *createSequenceQueue(void);
status isEmpty(SequenceQueue *L);
void clear(SequenceQueue *L);
datatype getTop(SequenceQueue *L);
int getLength(SequenceQueue *L);
status push(SequenceQueue *L, datatype node_to_push);
datatype pop(SequenceQueue *L);
void showQueue(SequenceQueue *L);

int main()
{
  /* 测试 */
  SequenceQueue *root;
  root = createSequenceQueue();
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  push(root, '1');
  push(root, '2');
  push(root, '3');
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  showQueue(root);
  putchar('\n');
  printf("can continue to push? %d\n", push(root, '4'));
  printf("getTop = %c\n", getTop(root));
  printf("pop = %c\n", pop(root));
  printf("pop = %c\n", pop(root));
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));
  push(root, '5');
  showQueue(root);
  putchar('\n');
  clear(root);
  printf("isEmpty = %d\n", isEmpty(root));
  printf("Length = %d\n", getLength(root));

  return 0;
}

SequenceQueue *createSequenceQueue(void)
{
  SequenceQueue *tmp;
  tmp = malloc(sizeof(SequenceQueue)); // void*类型指针能自己转到其他类型的指针
  tmp->front = tmp->rear = 0;          // 初始化队列的头尾指针
  return tmp;
}
status isEmpty(SequenceQueue *L)
{
  if (L->front == L->rear) // front=rear表示队列是空的
    return TRUE;
  else
    return FALSE;
}
void clear(SequenceQueue *L)
{
  L->front = L->rear = 0;
}
datatype getTop(SequenceQueue *L)
{
  // 返回队头元素的值
  return L->data[L->front];
}
int getLength(SequenceQueue *L)
{
  return (L->rear - L->front + MAXSIZE) % MAXSIZE;
}
status push(SequenceQueue *L, datatype node_to_push)
{
  // node_to_insert表示想要入队的元素
  if ((L->rear + 1) % MAXSIZE == L->front)
    return ERR;                      // 队列已满
  L->data[L->rear] = node_to_push;   // 将新元素入队
  L->rear = (L->rear + 1) % MAXSIZE; // 指针rear下移
  return OK;
}
datatype pop(SequenceQueue *L)
{
  datatype q;
  if (isEmpty(L))
    return ERR;                        // 队列是空
  q = L->data[L->front];               // 将要出队的元素先赋值给临时变量s
  L->front = (L->front + 1) % MAXSIZE; // 指针front下移
  return q;                            // 返回出队的元素的值
}
void showQueue(SequenceQueue *L)
{
  int i;
  int total = getLength(L);
  for (i = 0; i < total; i++)
  {
    printf("%c\t", L->data[(L->front + i) % MAXSIZE]);
  }
}

/* 环境: Code::Blocks with GCC 5.1 */
```

> 2020-01-23
