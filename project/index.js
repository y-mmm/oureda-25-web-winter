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
let state = "UNFINISHED";

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
 * 1. 在怎样的时刻需要调用 initialize 函数
 * 2. 程序的交互信息是什么（猜测的单词？）
 * 3. 内部状态会如何根据交互信息而改变（state 变量的作用？）
 * 4. 程序内部状态变化之后会作出怎样的反馈（页面重新渲染？）
 * 5. 如何读取交互信息
 * 6. 程序在什么时候会终止
 */
function start() {
  // TODO
  // 1. 初始化程序的运行状态 (因为初始化涉及读取文件是异步的，所以用 then 接续)
  initialize().then(() => {
    
    // 2. 绑定实体键盘监听
    document.addEventListener("keydown", (e) => {
      if (state !== "UNFINISHED") return; // 游戏结束则停止交互
      let key = e.key.toLowerCase();
      handleInput(key);
    });

    // 3. 绑定屏幕虚拟键盘监听 (兼容你的 HTML 设计)
    let virtualKeys = document.querySelectorAll(".key");
    virtualKeys.forEach(btn => {
      btn.addEventListener("click", function() {
        if (state !== "UNFINISHED") return;
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
    if (/^[a-z]$/.test(key)) {
      if (guess.length < answerLength) {
        guess += key;
        index++;
        render(key);
      }
    } else if (key === "backspace") {
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
          alert("单词不在词库中 (Not in word list)");
        }
      } else {
        alert("字母不够 (Not enough letters)");
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
 * 1. 什么是 DOM，这项技术有怎样的作用
 * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计
 * 3. 应该在怎样的时刻调用 render 函数
 */
function render(letter) {
  // TODO
  // 1. 渲染当前正在输入的这一行
  for (let i = 0; i < answerLength; i++) {
    // 你的 HTML ID 是 tile-0 开始的
    let tileId = "tile-" + (currentGuessTime * answerLength + i);
    let tile = document.getElementById(tileId);
    if (tile) {
      let char = guess[i] ? guess[i].toUpperCase() : "";
      tile.innerText = char;
      
      // 添加边框高亮效果
      if (char !== "") tile.classList.add("filled");
      else tile.classList.remove("filled");
    }
  }

  // 2. 当按下回车，处理颜色和游戏结果的渲染
  if (letter === "enter") {
    let currentSeq = colorSequence[colorSequence.length - 1]; // 例如 "bggyy"
    let rowStart = (currentGuessTime - 1) * answerLength; // handleAnswer 已经把次数+1了，所以要-1找回上一行

    // 渲染格子颜色
    for (let i = 0; i < answerLength; i++) {
      let tile = document.getElementById("tile-" + (rowStart + i));
      let colorCode = currentSeq[i];
      if (tile) {
        if (colorCode === green) tile.classList.add("correct");
        else if (colorCode === yellow) tile.classList.add("present");
        else if (colorCode === grey) tile.classList.add("absent");
      }
    }

    let submittedWord = wordSequence[wordSequence.length - 1]; 
    for (let i = 0; i < answerLength; i++) {
      let char = submittedWord[i].toUpperCase();
      let colorCode = currentSeq[i];
      
      let keyButtons = document.querySelectorAll(".key");
      keyButtons.forEach(btn => {
        if (btn.innerText.toUpperCase() === char) {
            let className = colorCode === green ? "correct" : (colorCode === yellow ? "present" : "absent");
            
            // 颜色优先级判定：绿 > 黄 > 灰 (防止高级颜色被降级)
            if (btn.classList.contains("correct")) return;
            if (btn.classList.contains("present") && className === "absent") return;
            
            btn.classList.remove("correct", "present", "absent");
            btn.classList.add(className);
        }
      });
    }

    // 渲染游戏结束状态
    if (state === "SOLVED") {
      setTimeout(() => alert("你猜对了！\n正确答案是：" + answer.toUpperCase()), 100);
    } else if (state === "FAILED") {
      setTimeout(() => alert("游戏结束！很遗憾，正确答案是：" + answer.toUpperCase()), 100);
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
  // TODO
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];
  
  // 生成随机答案，并存入全局变量
  answer = await generateRandomAnswer();
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
 * 1. 如何读取 json 文件
 * 2. 如何随机抽取一个单词
 *
 * @return {string} answer
 */
async function generateRandomAnswer() {
  // TODO
  try {
    // 读取 json 文件
    const response = await fetch('words.json');
    const data = await response.json(); // 拿到整个大对象
    globalWordList = data.words; // ✅ 加上 .words，精准提取出里面的数组！
    
    // 随机抽取一个单词
    const randomIndex = Math.floor(Math.random() * globalWordList.length);
    return globalWordList[randomIndex].toLowerCase();
  } catch (error) {
    console.warn("⚠️ 无法读取 words.json，使用备用词库运行", error);
    // 如果没有 json 文件，提供一个备用词库以防报错
    globalWordList = ["apple", "world", "react", "super", "ghost"];
    return globalWordList[0];
  }
}

/**
 * isValidWord()
 *
 * 判断一个单词是否合法
 *
 * 请思考：
 * 1. 判断一个单词是否合法的规则有哪些
 * 2. 是否存在多条判断规则
 * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
 * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈
 *
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
  // TODO
  if (word.length !== answerLength) return false;
  
  // 规则2：必须在词库 json 中存在
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
 * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么
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