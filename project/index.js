/**
 * 本文件是在构建 Wordle 程序过程中需要使用的脚本
 * ! 在编写代码之前请您务必仔细阅读每一行注释并不要删除或修改注释
 * 其中部分函数已经给出，需要您根据实际需求进行补全
 * 函数的具体作用请参考注释
 * 请确保所有的 TODO 都被补全
 * 若无特殊需要请尽量不要定义新的函数
 */

/**
 * Global Variables
 *
 * 您的所有全局变量需要在此处定义
 * 我们已经预先为您定义了一部分全局变量
 *
 */

// 固定的答案长度
const answerLength = 5;
// 最多尝试次数
const maxGuessTime = 6;

// Wordle 中出现的三种颜色，更推荐使用枚举
// 此处 green 用字母 b 表示，具体原因请参见代码任务
// const Color = {
//   GREY: "g",
//   YELLOW: "y",
//   GREEN: "b"
// };
//枚举版

const grey = "g";
const yellow = "y";
const green = "b";

// 颜色序列，类型为 string[]
let colorSequence = [];
// 单词序列，类型为 string[]
let wordSequence = [];

// 本次 Wordle 的答案
let answer = "";
// 当前猜测的答案
let guess = "";
// 当前已经使用的猜测次数
let currentGuessTime = 0;
// 当前游标位置（1~30）
let index = 1;

/**
 * 程序当前的状态，更推荐使用枚举
 *
 * 预计会使用到的状态：
 * 1. "UNFINISHED": 表示 Wordle 未被解决即仍有剩余猜测次数
 * 2. "SOLVED": 表示当前 Wordle 已被解决
 * 3. "FAILED": 表示当前 Wordle 解决失败
 * 可以根据需要设计新的状态
 */
const GameState = Object.freeze({
  PLAYING: "UNFINISHED",
  WON: "SOLVED",
  LOST: "FAILED"
});
let state = GameState.PLAYING;

/**
 * 预定义的 JavaScript 程序的入口
 * 请不要额外定义其他的程序入口
 */
start();

/**
 * start()
 *
 * 整个程序的入口函数，这里为了简化程序的运行逻辑违背了单一指责原则和最小权限原则，在实际开发时不推荐这样处理
 *
 * 您需要完成的任务：
 * 1. 初始化程序的运行状态
 * 2. 接收交互信息后改变内部状态并作出反馈
 *
 * 请思考：
 * 1. 在怎样的时刻需要调用 initialize 函数  //初始化，游戏一加载，或者点“重置”按钮的时候
 * 2. 程序的交互信息是什么（猜测的单词？）  //玩家输入的字母，或者回车，或者退格
 * 3. 内部状态会如何根据交互信息而改变（state 变量的作用？）//猜中了变 SOLVED，机会用完变 FAILED，否则保持 UNFINISHED
 * 4. 程序内部状态变化之后会作出怎样的反馈（页面重新渲染？）//格子变色了、跳出弹窗了、字母蹦出来了
 * 5. 如何读取交互信息 //监听键盘按下的那个动作
 * 6. 程序在什么时候会终止 //赢了、输了，或者关掉网页
 */
function start() {
  // TODO
  // 1. 初始化程序的运行状态 (因为初始化涉及读取文件是异步的，所以用 then 接续)
  initialize().then(() => {
  // 执行初始化任务，等（then）你任务成功完成了，就请（=>）立刻开始做大括号（{）里的这些事

    // 2. 绑定实体键盘监听
    document.addEventListener("keydown", (e) => {
      if (state !== GameState.PLAYING) return; // 游戏结束则停止交互
      let key = e.key.toLowerCase();
      handleInput(key);
    });

    // 3. 绑定屏幕虚拟键盘监听
    let virtualKeys = document.querySelectorAll(".key");
    virtualKeys.forEach(btn => {
      btn.addEventListener("click", function() {
        if (state !== GameState.PLAYING) return;
        let key = this.innerText.toLowerCase();
        if (key === "enter") key = "enter";
        else if (key === "⌫" || key === "backspace") key = "backspace";
        handleInput(key);
      });
    });

    let hintBtn = document.getElementById("btn-hint");
    if (hintBtn) {
        hintBtn.addEventListener("click", () => {
            alert("本局答案是 " + answer.toUpperCase());
        });
    }

    let resetBtn = document.getElementById("btn-reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            initialize().then(() => {
                // 清空 HTML 棋盘
                for (let i = 0; i < 30; i++) {
                    let tile = document.getElementById("tile-" + i);
                    if (tile) {
                        tile.innerText = "";
                        tile.className = "tile"; // 扒掉所有颜色
                    }
                }
                // 清空虚拟键盘颜色
                let allKeys = document.querySelectorAll(".key");
                allKeys.forEach(k => k.classList.remove("correct", "present", "absent"));
                
                alert("棋盘已重置！");
            });
        });
    }
  });

  // 内部辅助逻辑：处理输入的分发
  function handleInput(key) {
    //正则表达式
    if (/^[a-z]$/.test(key)) {
      if (guess.length < answerLength) {
        guess += key;
        index++;
        render(key);
      }
    } else if (key === "backspace") {
      //guess储存已经输入的字母
      //slice(0, -1) 的意思是：从开头开始，一直切到倒数第一个之前
      if (guess.length > 0) {
        guess = guess.slice(0, -1);
        index--;
        render("backspace");
      }
    } else if (key === "enter") {
      if (guess.length === answerLength) {
        if (isValidWord(guess)) {
          handleAnswer(guess);
        } else {
          alert("单词不在词库中");
        }
      } else {
        alert("字母不够");
      }
    }
  }
}

/**
 * render()
 *
 * 根据程序当前的状态渲染对应的用户页面
 *
 * 您需要完成的任务：
 * 1. 基于 DOM 实现程序状态和 HTML 组件的绑定
 * 2. 当程序内部状态发生改变时需要重新渲染页面
 *
 * 请思考：
 * 1. 什么是 DOM，这项技术有怎样的作用 //连接静态 HTML和动态 JS 逻辑
 * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计 //在HTML中起了唯一的ID，通过 DOM 抓取
 * 3. 应该在怎样的时刻调用 render 函数 //状态改变时调用
 */
function render(letter) {
  // 1. 渲染当前正在输入的这一行 (保持不变)
  for (let i = 0; i < answerLength; i++) {
    let tileId = "tile-" + (currentGuessTime * answerLength + i);
    let tile = document.getElementById(tileId);
    if (tile) {
      let char = guess[i] ? guess[i].toUpperCase() : "";
      tile.innerText = char;
      if (char !== "") tile.classList.add("filled");
      else tile.classList.remove("filled");
    }
  }

  // 2. 当按下回车，处理翻转动画和颜色同步
  if (letter === "enter") {
    let currentSeq = colorSequence[colorSequence.length - 1]; 
    let submittedWord = wordSequence[wordSequence.length - 1];
    let rowStart = (currentGuessTime - 1) * answerLength; 

    for (let i = 0; i < answerLength; i++) {
      let tile = document.getElementById("tile-" + (rowStart + i));
      let colorCode = currentSeq[i];
      
      if (tile) {
        // 顺序翻转效果
        setTimeout(() => {
          tile.classList.add("flip"); // 触发 CSS 翻转动画

          // 在翻转到一半（0.25s）时，颜色换
          setTimeout(() => {
            if (colorCode === green) tile.classList.add("correct");
            else if (colorCode === yellow) tile.classList.add("present");
            else if (colorCode === grey) tile.classList.add("absent");
          }, 250); 

        }); // 每个格子比前一个延迟 150ms，形成波浪感
      }

      // 虚拟键盘同步变色
      let char = submittedWord[i].toUpperCase();
      let keyButtons = document.querySelectorAll(".key");
      keyButtons.forEach(btn => {
        if (btn.innerText.toUpperCase() === char) {
          setTimeout(() => {
            let className = colorCode === green ? "correct" : (colorCode === yellow ? "present" : "absent");
            if (btn.classList.contains("correct")) return;
            if (btn.classList.contains("present") && className === "absent") return;
            btn.classList.remove("correct", "present", "absent");
            btn.classList.add(className);
          }, i * 150 + 400); // 键盘变色稍晚于格子翻转
        }
      });
    }

    // 渲染游戏结束状态
    if (state !== GameState.PLAYING) {
      setTimeout(() => {
        if (state === "SOLVED") {
          alert("你猜对了！\n正确答案是：" + answer.toUpperCase());
        } else if (state === "FAILED") {
          alert("游戏结束！很遗憾，正确答案是：" + answer.toUpperCase());
        }
      }, answerLength * 150 + 600); 
    }
  }
}

/**
 * initialize()
 *
 * 初始化程序的状态
 *
 * 请思考：
 * 1. 有哪些状态或变量需要被初始化
 * 2. 初始化时 state 变量处于怎样的状态
 */
async function initialize() {
  // 使用 await，你必须先用 async 把这个函数声明为“异步函数”
  // TODO
  state = GameState.PLAYING;
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];
  
  // 生成随机答案，并存入全局变量
  answer = await generateRandomAnswer();
  // 等 generateRandomAnswer() 真正把单词从库里拿回来交到你手上，你才准往下一行跑
  console.log("本局答案是:", answer); // 方便测试
}

/**
 * generateRandomAnswer()
 *
 * 从题库中随机选取一个单词作为答案
 *
 * 题库文件为 words.json
 *
 * 请思考：
 * 1. 如何读取 json 文件 //fetch() 它就指定的 URL（words.json）把数据取回来，
 *                  然后用 .json() 方法把包裹拆开，转换成 JavaScript 能看懂的数组。
 * 2. 如何随机抽取一个单词  //利用Math
 *
 * @return {string} answer
 */
async function generateRandomAnswer() {
  // TODO
  try {
    // 读取 json 文件
    const response = await fetch('words.json');
    const data = await response.json(); // 拿到整个大对象
    globalWordList = data.words; 
    
    // 随机抽取一个单词
    const randomIndex = Math.floor(Math.random() * globalWordList.length);
    return globalWordList[randomIndex].toLowerCase();
  } catch (error) {
    console.warn("无法读取 words.json", error);
  }
}

/**
 * isValidWord()
 *
 * 判断一个单词是否合法
 *
 * 请思考：
 * 1. 判断一个单词是否合法的规则有哪些  //5 个字母，必须在词库里，a-z 组成（虚拟键盘只能输入a-z，故不用）
 * 2. 是否存在多条判断规则
 * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
 *   //长度，词库
 * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈  //弹出一个提示
 *
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
  // TODO
  // 长度
  if (word.length !== answerLength) return false;
  
  // 必须在词库中存在
  if (globalWordList && globalWordList.length > 0) {
    return globalWordList.includes(word.toLowerCase());
  }
  
  return true;
}

/**
 * handleAnswer()
 *
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 *
 * 请思考：
 * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么 //统一大小写
 *
 * @param {string} guess
 */
function handleAnswer(currentGuess) {
  // TODO
  // 1. 计算颜色序列
  let seq = calculateColorSequence(guess.toLowerCase(), answer.toLowerCase());
  
  // 2. 存入历史记录
  colorSequence.push(seq);
  wordSequence.push(currentGuess);

  // 3. 判断状态变化
  if (guess.toLowerCase() === answer.toLowerCase()) {
    state = "SOLVED";
  } else if (currentGuessTime >= maxGuessTime - 1) {
    state = "FAILED";
  }
  guess = "";
  // 4. 更新回合数并渲染
  currentGuessTime++;
  render("enter");
  
  // 5. 清空当前猜测，准备下一行
  guess = "";
}

/**
 * calculateColorSequence()
 *
 * 计算两个单词的颜色匹配序列
 *
 * 例如：
 * 给定 answer = "apple", guess = "angel"
 *
 * 那么返回结果为："bggyy"
 *
 * 请思考：
 * 1. Wordle 的颜色匹配算法是如何实现的
 * 2. 有哪些特殊的匹配情况
 *
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
  // TODO
  let guessArr = guess.split("");
  let answerArr = answer.split("");
  let colors = [grey, grey, grey, grey, grey]; // 默认全灰 (g)

  // 第一遍扫描：找绝对位置正确的绿色 (b)
  for (let i = 0; i < answerLength; i++) {
    if (guessArr[i] === answerArr[i]) {
      colors[i] = green;
      answerArr[i] = null; // 消耗掉该字母
      guessArr[i] = null;
    }
  }

  // 第二遍扫描：找位置不对但存在的黄色 (y)
  for (let i = 0; i < answerLength; i++) {
    if (guessArr[i] !== null && answerArr.includes(guessArr[i])) {
      colors[i] = yellow;
      answerArr[answerArr.indexOf(guessArr[i])] = null; // 消耗掉该字母
    }
  }

  // 将数组拼接成字符串返回
  return colors.join("");
}