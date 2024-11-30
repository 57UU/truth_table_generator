# Truth Table Generator

一键生成LaTeX/Markdown/Word真值表

在线使用： https://truth-table.57u.tech/

# 开发目的
虽然市面上已有很多现成的真值表计算器，但是复制起来非常不方便，于是我就自己写了一个，支持latex,markdown,word格式，更便于复制。

# 开发框架
- React
- Katex
- Ant Design

# 程序原理
- 将中缀表达式转换为后缀表达式
- 将后缀表达式转换为抽象语法树(AST)
- 枚举各种情况，记录每个AST节点信息（子式）
- 输出/渲染
