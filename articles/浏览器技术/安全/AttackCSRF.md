# CSRF

CSRF (Cross Site Request Forgery)，核心是**造假**攻击。

## 举个很简单的例子

假设，A 网站提供一个移除博文的接口：`http://ASite.me/blogs/center/blog/remove/:id`

如果 A 网站的接口未对请求做任何强校验，导致黑客能构造一个发起该请求的 `<img src="http://ASite.me/blogs/center/blog/remove/2020050301 />"` 标签，而此标签存在在一个钓鱼网站上，当受害者访问此有害网站时，将发出一个移除请求，导致博文莫名其妙地被移除了。

大多数的博文都是公示的，因此黑客能爬取这些博文的 ID 或其他什么的唯一标号。

因此：

1. 移除的请求从其他站点发出的，即 **Cross Site**
2. 移除的请求是黑客造假的，即 **Request Forgery**
