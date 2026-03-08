# AI 使用情况说明

## 心得感悟

<!-- 请在此部分分享你在完成作业中使用 AI 的过程与方法，最好能体现自己的思考（使用层面的思考就行，比如怎么用 AI 的效果更好） -->

分段提问往往比一整个大通套的提问效果要好，比如说整个CSS中我需要实现的翻页动画，搭出框架之后再向他询问“请在反转一半时实现颜色切换”

可以给AI设定一个身份，更容易得到想要的答案

AI 会给出过于复杂的实现方案，在这种情况下，我会要求 AI “换一种更易读、更适合初学者的写法”

有时候一直问容易陷入死循环，越改越麻烦，新建一个对话，自己看一遍已有的代码梳理思路，用简洁但是全面的语言再问他一遍可能有奇效

AI除了辅助编写代码，我认为更大的好处是一个检索方便的十万个为什么，不明白的地方，记不住的api，忘记的命令都可以向他询问，节省百度的时间，并且可以追着不懂的地方一直问

使用过程中告诉他“说人话”往往能用通俗的方式给你解释明白

（Gemini确实好用（雾））

## prompt 记录

<!-- 可以记录一下与 AI 交互的 prompt 记录，以及 AI 给出的大致回答，用于总结改进 -->

<!-- 示例：
Q1: 我想知道如何设置一个元素的背景颜色？
A1: 你可以使用 CSS 来设置一个元素的背景颜色。例如，如果你想将一个元素的背景颜色设置为红色，你可以使用以下 CSS 代码：
```css
element {
  background-color: red;
}
``` -->

```
Q现在有需要一个翻页的特效，就是点了enter以后本行的每个字母沿着中轴翻页
A这个特效在 Wordle 游戏中非常经典，通常被称为“翻转动画（Flip Animation）”。要实现这个效果，我们需要结合 CSS 动画和 JS 逻辑控制。

由于你目前的代码已经实现了逻辑判断，我们只需要在 handleAnswer（处理 Enter 逻辑）的地方给对应的格子加上动画类即可。

第一步：在 style.css 中添加动画定义
我们需要使用 CSS 的 transform: rotateX 来实现绕中轴翻转的效果。

CSS
/* 翻转动画定义 */
@keyframes flip {
    0% {
        transform: rotateX(0);
    }
    45% {
        transform: rotateX(90deg); /* 翻转到一半，完全垂直看不见 */
    }
    55% {
        transform: rotateX(90deg);
    }
    100% {
        transform: rotateX(0);
    }
}

/* 动画类 */
.flip {
    animation: flip 0.6s ease-in-out forwards;
}

/* 为了让翻转更丝滑，建议给 .tile 加上这一行 */
.tile {
    /* ... 你原有的样式 ... */
    backface-visibility: hidden; /* 防止翻转时看到背面闪烁 */
    transition: background-color 0.3s; /* 背景色变化稍微延时，配合动画中点 */
}
第二步：在 index.js 中触发动画
在你的 handleAnswer 函数里，当你遍历本行的 5 个字母并赋予颜色时，同步加上这个 flip 类。

核心逻辑点： 为了达到“一个接一个翻转”的效果，我们需要使用 animation-delay（动画延迟）。

修改 index.js 中的循环部分：

JavaScript
// 在 handleAnswer 函数内部
for (let i = 0; i < 5; i++) {
    const tileIndex = currentGuessTime * 5 + i;
    const tile = document.getElementById(`tile-${tileIndex}`);
  
    // 1. 设置动画延迟：每个格子比前一个晚 0.1s 或 0.2s 翻转
    tile.style.animationDelay = `${i * 0.15}s`;
  
    // 2. 添加翻转类
    tile.classList.add('flip');

    // 3. 关键：背景色的改变应该在翻转到一半（90度）时发生
    // flip 动画总时长 0.6s，延迟 i*0.15s，中点大概在 (0.3 + i*0.15)s
    setTimeout(() => {
        const colorClass = result[i] === green ? 'correct' : (result[i] === yellow ? 'present' : 'absent');
        tile.classList.add(colorClass);
    }, (i * 0.15 + 0.3) * 1000); 
}
第三步：答辩加分项（技术细节）
如果你在答辩中演示了这个特效，老师可能会问：“你是如何保证颜色切换时不会显得突兀的？”

你可以这样回答：

“我利用了 CSS 动画的时间差。当格子翻转到 90度（即 rotateX(90deg)）时，格子侧面对着用户，此时它是不可见的。我通过 JS 的 setTimeout 在这个精确的时间点切换格子的背景色类名。当格子继续翻转回 0 度时，用户看到的就是已经变好颜色的新面貌，从而产生了一种‘翻过去就变色了’的视觉错觉。”

下一步建议
清除状态：在 reset 函数里，记得把所有格子的 flip 类和 style.animationDelay 清空，否则第二轮游戏会乱。

键盘变色：你的键盘变色逻辑也可以加一点微小的 transition 延迟，让它在格子翻转完后再变色，视觉统一感会更强。

```

```
Q// 此处 green 用字母 b 表示，具体原因请参见代码任务
const grey = "g";
const yellow = "y";
const green = "b";这是作业给的，为什么

A这是一个非常好的观察，这正是 OurEDA 实验室在作业中为你设置的一个**“陷阱”或“逻辑考察点”**。

在 index.js 中这样定义：

JavaScript
const grey = "g";   // grey -> g
const yellow = "y"; // yellow -> y
const green = "b";  // green -> b (这不符合常理)
为什么实验室要故意把绿色（Green）定义为 "b"，把灰色（Grey）定义为 "g" 呢？主要有以下几个原因：

1. 考察“解耦”意识（最核心原因）
实验室想看你是否在编写逻辑时过度依赖字面量。

错误写法：如果你在代码里直接写 if (result === "b") 来判断是否猜对，那你换个环境就死定了。

正确写法：你应该写 if (result === green)。
这样无论实验室把 green 定义成 "b"、"g" 还是 "apple"，你的逻辑代码（如 handleAnswer 或 render）都不需要改动一个字。这叫常量管理，是大型工程项目的基本素养。

2. 为 CodeWars 任务埋伏笔
任务三要求你去完成 CodeWars 上的题目。

CodeWars 的规则：绿色必须返回 "g"，灰色/黑色必须返回 "b"。

实验室的规则：绿色是 "b"，灰色是 "g"。

这就是在考你： 当你把本地通过的代码复制到 CodeWars 时，如果你不理解这些变量的含义，直接“无脑粘贴”，你的测试一定全红（报错）。你必须意识到不同环境对数据格式的要求不同，从而学会灵活适配。

3. 模拟真实的“屎山”代码或特殊协议
在实际工作中，你经常会遇到前后端约定的字段非常奇葩的情况。比如后端传回 status: 1 代表失败，status: 0 代表成功。
实验室通过这种“反直觉”的赋值，强迫你仔细阅读注释，而不是靠经验主义写代码。

答辩时的加分回答：
如果老师问你：“为什么代码里绿色是 b？”

你可以这样霸气地回答：

“我注意到实验室在全局变量中将 green 定义为 'b'，这虽然反直觉，但在程序逻辑上，我全程使用了变量名 green 而非硬编码字符 'b'。这体现了逻辑与数据分离的思想。同时，在完成 CodeWars 任务时，我也针对该平台 'g' 代表绿色的要求做了相应的数据转换适配。这证明了我不仅能写出逻辑，还能理解并处理不同环境下的数据协议差异。”

总结：这就是为了考你细不细心，以及代码写得够不够“规范（解耦）”！
```

```
Q键盘为什么不好用了
A交互功能之所以“罢工”，全是下面这一个小细节引起的连锁反应。

请打开你的 index.js 文件，找到 generateRandomAnswer() 这个函数（大概在第 170 行左右）。

🚨 错误发生在这里：
你看你现在的代码是这么写的：

JavaScript
    // 读取 json 文件
    const response = await fetch('words.json');
    const words = await response.json();
    globalWordList = words; // ❌ 问题出在这里！
    
    // 随机抽取一个单词
    const randomIndex = Math.floor(Math.random() * words.length); // ❌ 这里崩溃了
🕵️‍♂️ 为什么会错？
因为你刚才创建的 words.json 文件长这样：

JSON
{
    "words": [
        "aback",
        "abase",
        ...
    ]
}
它是一个大括号包起来的对象（Object）。
当你用 await response.json() 读取它时，你拿到的 words 变量其实是整个大对象。
对象是没有 length（长度）属性的，所以 words.length 算出来是 undefined。接着往下走，代码在尝试把 undefined 变成小写字母时直接崩溃了。

因为这一步崩溃，导致最上面 initialize().then(...) 里面的代码全都没有执行，你的键盘监听根本就没有挂载上，所以按什么都没反应。

🛠️ 你只需要自己这样改：
把 generateRandomAnswer() 里的那几行读取代码，精确修改成下面这样（注意看带 . 的地方）：

JavaScript
    // 读取 json 文件
    const response = await fetch('words.json');
    const data = await response.json(); // 拿到整个大对象
    globalWordList = data.words; // ✅ 加上 .words，精准提取出里面的数组！
    
    // 随机抽取一个单词
    const randomIndex = Math.floor(Math.random() * globalWordList.length);
    return globalWordList[randomIndex].toLowerCase();
就改这三四行代码！ 改完之后你保存去刷新页面。只要这里一通，后面的 .then() 就能顺利执行，你的键盘立马就复活了！快去试试看！
```

```
Q为什么下一行直接填充了
A这其实是一个非常经典的**“变量名冲突（变量提升/遮蔽）”加上“执行顺序”**导致的 Bug。

🕵️‍♂️ 为什么会发生这种事？
在你的 index.js 里，老师给的模板定义了一个全局变量叫 let guess = ""。
但是，模板里处理答案的函数名叫 function handleAnswer(guess)。

名字冲突了：因为函数的参数名也叫 guess，所以当你在函数最后写 guess = "" 时，你其实只清空了那个“局部参数”，而全局的那个 guess 根本没有被清空，它依然记着 "apple"！

时机晚了一步：在你的代码里，你是先执行了 currentGuessTime++ 和 render("enter")，最后才去清空 guess。当 render 去渲染第二行的时候，它发现全局的 guess 还是 "apple"，于是就顺手把 "APPLE" 写进了第二行的格子里。

🛠️ 怎么修复？（微创手术）
我们只需要修改 index.js 里的 handleAnswer 这一个函数。

请找到 function handleAnswer(guess) { ... } 这一段（大概在 230 行左右），把它整段替换成下面这样：

JavaScript
/**
 * handleAnswer()
 */
// 🌟 修复 1：把参数名改成 currentGuess，防止和全局变量 guess 名字打架！
function handleAnswer(currentGuess) {
  // 1. 计算颜色序列
  let seq = calculateColorSequence(currentGuess.toLowerCase(), answer.toLowerCase());
  
  // 2. 存入历史记录
  colorSequence.push(seq);
  wordSequence.push(currentGuess);

  // 3. 判断状态变化
  if (currentGuess.toLowerCase() === answer.toLowerCase()) {
    state = "SOLVED";
  } else if (currentGuessTime >= maxGuessTime - 1) {
    state = "FAILED";
  }

  // 🌟 修复 2：必须在 render 之前，先把全局的 guess 彻底清空！
  guess = ""; 

  // 4. 更新回合数并渲染
  currentGuessTime++;
  render("enter");
}
保存后刷新页面！
现在你再输入 APPLE 按下回车，第一行会完美变色，第二行也会保持干干净净的空白等待你输入新的单词了！快去试试看！
```

```
Q匿名函数看不懂
A完全理解！“匿名函数”这个词听起来很高大上，但其实非常简单。这是很多刚接触 JavaScript 的朋友都会卡住的一个点。

简单来说：匿名函数（Anonymous Function）就是没有名字的函数。

我们可以通过对比“有名字的函数（具名函数）”来理解它。

1. 有名字的函数（具名函数）
通常我们写一个函数，会给它起个名字，方便以后反复调用。

JavaScript
// 这个函数有名字，叫 "washClothes" (洗衣服)
function washClothes() {
    console.log("3. 衣服洗完了！");
}

console.log("1. 开始洗衣服");

// 我们把有名字的函数 washClothes 传给 setTimeout
setTimeout(washClothes, 2000); 

console.log("2. 洗衣服的同时去扫地");
在这个例子里，我们先定义了一个叫 washClothes 的函数，然后把它当成回调函数传给了 setTimeout。

2. 没有名字的函数（匿名函数）
如果一个函数只在这个地方用一次，以后再也不会用到了，我们其实没必要费劲给它想个名字（毕竟程序员最头疼的事情之一就是给变量起名字）。

这个时候，我们可以直接把函数的“内容”写在参数的位置上，省略掉名字。

JavaScript
console.log("1. 开始洗衣服");

// 我们直接在 setTimeout 的括号里，写了一个没有名字的 function() { ... }
setTimeout(function() {
    console.log("3. 衣服洗完了！");
}, 2000);

console.log("2. 洗衣服的同时去扫地");
上面代码里的 function() { console.log("3. 衣服洗完了！"); } 就是一个匿名函数。

为什么要用匿名函数？
省事、代码紧凑： 不需要跑到别的地方去单独定义一个函数，代码读起来是一连串的，很顺畅。

避免命名冲突： 名字起多了容易重复，匿名函数用完即焚，不占地方。

💡 延伸：更简洁的匿名函数（箭头函数）
在现代 JavaScript 中，匿名函数经常被写成更短的样子，叫做箭头函数（Arrow Function）。你以后看别人的代码会经常见到它：

把 function 这个词去掉，加上一个箭头 =>：

JavaScript
// 传统的匿名函数
setTimeout(function() {
    console.log("衣服洗完了！");
}, 2000);

// 箭头函数（更短的匿名函数）
setTimeout(() => {
    console.log("衣服洗完了！");
}, 2000);
它们的作用几乎是一样的，只是箭头函数写起来更酷、更省键盘！

怎么样，用“一次性指令”去理解匿名函数是不是清晰一点了？需要我出个小题目考考你，看看你能不能区分它们吗？
```