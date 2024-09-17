# Truth Table Generator

一键生成LaTeX/Markdown真值表

# 开发框架
- React
- Katex
- Ant Design

# 程序原理
- 将中缀表达式转换为后缀表达式
- 将后缀表达式转换为抽象语法树(AST)
- 枚举各种情况，记录每个AST节点信息（子式）
- 输出/渲染