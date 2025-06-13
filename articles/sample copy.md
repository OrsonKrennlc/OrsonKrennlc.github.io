---
title: "深入理解CSS Grid布局"
date: 2025-05-28
categories: [前端开发]
tags: [CSS, 布局]
---

## 一、Grid布局基础

### 1.1 容器属性
```css
.container {
    display: grid;
    grid-template-columns: 1fr 2fr; /* 两列，宽度比例1:2 */
    gap: 20px; /* 间距 */
    padding: 20px;
}