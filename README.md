<div align="center">
  <h1 align="center">
    <img src="https://github.com/GrinZero/extreme/assets/70185413/a10b90e8-8ddf-4aef-b32c-4fb773b4f3c1" width="100" />
    <br>Extreme</h1>

 <h3 align="center">🚀 体积极小的纯运行时框架 </h3>
 <h3 align="center">🪀 作为一个玩具框架存在，框架源码初学者入门可选</h3>
 <h3 align="center">⚙️  Powered by Vite</h3>
  <p align="center">
   <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript" />
   <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite"/>
 </p>

</div>

---

## 📖 介绍

Extreme 是一个极小的运行时框架，它的目标是提供一个极小的框架，让初学者可以快速入门，了解一个框架的基本结构。目前来讲，Extreme更像是一个玩具框架，它的功能非常有限，但是它的代码量非常少，非常适合初学者入门。

## 🎮 TODO

- [ ] 编译时
- [x] 响应性更新  
- [ ] 事件系统
  - [x] 事件绑定
  - [ ] 事件流
- [x] 批量渲染 :for
  - [x] 批量更新
  - [x] 批量细粒度响应性
- [x] 条件渲染 :if
  - [x] 条件渲染
  - [x] 条件更新
- [x] 生命周期
  - [x] useMount
  - [ ] useUpdated
  - [ ] ...
- [x] 依赖收集
  - [x] 依赖收集
  - [x] 依赖更新
- [ ] 调度渲染
  - [x] 异步渲染
  - [ ] 调度更新
- [ ] 服务端渲染
- [ ] Diff算法
- [ ] 插件系统
- [ ] 路由
- [ ] 状态管理
- [ ] 单元测试
- [x] 性能测试
- [ ] 文档
- [ ] 社区
- [ ] 生态
- [ ] 发布

## 📦 快速开始

### 1. 安装

```bash
pnpm create vite my-project --template vanilla-ts
pnpm add @sourcebug/extreme 
pnpm add @sourcebug/vite-extreme-plugin html-minifier -D
```

### 2. 配置

- 新增`vite.config.ts`

```ts
import { defineConfig } from "vite";
import { rawMinifyPlugin } from "@sourcebug/vite-extreme-plugin";

export default defineConfig(() => ({
  plugins: [rawMinifyPlugin()],
}));
```

### 3. 使用

首先清理掉所有Vite初始化的代码，然后开始创建目录，现在你的目录应该是这样的：

```ts
- src
  - components
    - main
      - index.ts
      - index.html
    - index.ts
  - main.ts
```

接着我们填内容：

- 在`main.ts`中：

```ts
import { Main } from "./components";

Main(document.getElementById("main")!, {});
```

别急，我们还没有创建`Main`组件，现在我们先创建一个这样的目录：

- 在`components/main/index.ts`中：

```ts
import { createComponent, useState } from "@sourcebug/extreme";
import template from "./index.html?raw";

export const Main = createComponent("Main", () => {
  const [count, setCount] = useState(0);

  return {
    template,
    state: {
      count,
    },
    methods: {
      increment: () => setCount(count() + 1),
      decrement: () => setCount(count() - 1),
    },
  };
});

```

- 在`components/main/index.html`中：

```html
<div>
  <h1>Count: {{ count }}</h1>
  <button @click="{{increment}}">Increment</button>
  <button @click="{{decrement}}">Decrement</button>
</div>
```

- 在`components/index.ts`中：

```ts
export * from "./main";
```

### 4, 点赞

敬佩，我没有做初始化脚手架的工作，而屏幕前的你居然真的手搭了一个启动项目，了不起。

## 🪄 性能

### 1. 体积

[![extreme](https://github.com/GrinZero/extreme/assets/70185413/183d554b-a72f-4905-9c3c-00f4e0fa947a)]()

### 2. 渲染性能

[![extreme](https://github.com/GrinZero/extreme/assets/70185413/59693c7c-456e-4239-aded-c2521af3c3e8)]()
