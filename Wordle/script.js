//记忆变量
let currentRow = 0;       // 当前在哪一行
let currentGuess = "";    // 当前行已经打出的词

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];

console.log("本局答案是：", targetWord);

//打字指令
function handleKeyPress(key) {
    
    if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
            currentGuess = currentGuess + key; 
            let tileIndex = (currentRow * 5) + (currentGuess.length - 1);
            let tile = document.getElementById("tile-" + tileIndex);
            
            tile.innerText = key;          // 显示字母
            tile.classList.add("filled");  // 触发 CSS 的放大动画和边框变亮
        }
    } 
    
    //按下了退格!!!
    else if (key === "BACKSPACE" || key === "⌫") {
        if (currentGuess.length > 0) {
            // 找到最后一个填字的格子
            let tileIndex = (currentRow * 5) + (currentGuess.length - 1);
            let tile = document.getElementById("tile-" + tileIndex);
            
            tile.innerText = "";             // 清空格子里的字
            tile.classList.remove("filled"); //边框恢复暗色
            
            currentGuess = currentGuess.slice(0, -1); 
        }
    }
    
    // 按下回车
    else if (key === "ENTER") {
        if (currentGuess.length === 5) {
            
            // 检查玩家猜的词在不在词库里
            if (WORDS.includes(currentGuess)) {
                checkGuess(); 
            } else {
                alert("单词不在词库中！");
                
                //动画
                for (let i = 0; i < 5; i++) {
                    let tileIndex = (currentRow * 5) + i;
                    let tile = document.getElementById("tile-" + tileIndex);
                    
                    // 先清空旧动画，再重新加上，保证每次敲回车都能摇晃
                    tile.classList.remove("shake"); 
                    setTimeout(() => tile.classList.add("shake"), 10);
                }
            }
            
        } else {
            // 字母还没打满 5 个
            alert("字母不够 5 个，不能提交！");
            
            // 动画
            for (let i = 0; i < 5; i++) {
                let tileIndex = (currentRow * 5) + i;
                let tile = document.getElementById("tile-" + tileIndex);
                tile.classList.remove("shake");
                setTimeout(() => tile.classList.add("shake"), 10);
            }
        }
    }
}

// 绿、黄、灰
function checkGuess() {
    let guessArr = currentGuess.split(""); // 玩家猜的词
    let targetArr = targetWord.split("");  // 答案词
    
    // 默认这 5 个格子全是灰色
    let colors = ["absent", "absent", "absent", "absent", "absent"];

    // 找绿色
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === targetArr[i]) {
            colors[i] = "correct";
            targetArr[i] = null; 
            guessArr[i] = null;
        }
    }

    // 找黄色
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] !== null && targetArr.includes(guessArr[i])) {
            colors[i] = "present";
            targetArr[targetArr.indexOf(guessArr[i])] = null; // 标记已消耗
        }
    }

    for (let i = 0; i < 5; i++) {
        let tileIndex = (currentRow * 5) + i;
        let tile = document.getElementById("tile-" + tileIndex);
        tile.classList.add(colors[i]); // 给格子戴上颜色的类名
        tile.style.animation = ""; // 清除之前的放大动画，防止干扰
    }

    //把颜色也同步给虚拟键盘的按键
    for (let i = 0; i < 5; i++) {
        let letter = currentGuess[i]; // 获取这个位置的字母
        let color = colors[i];        // 获取这个字母的颜色

        // 找到键盘上对应的那个按键
        // 用 Array.from 把所有按键变成数组，然后 find 找到文字匹配的那一个
        let keyButton = Array.from(document.querySelectorAll(".key")).find(
            (btn) => btn.innerText === letter
        );

        if (keyButton) {
            
            let oldColor = "";
            if (keyButton.classList.contains("correct")) oldColor = "correct";
            else if (keyButton.classList.contains("present")) oldColor = "present";
            else if (keyButton.classList.contains("absent")) oldColor = "absent";

            let shouldUpdate = false;
            // 如果新颜色是绿色，永远更新（最高级）
            if (color === "correct") {
                shouldUpdate = true;
            } 
            // 如果新颜色是黄色，只有当现在不是绿色时，才更新
            else if (color === "present" && oldColor !== "correct") {
                shouldUpdate = true;
            } 
            // 如果新颜色是灰色，只有当现在完全没颜色时，才更新
            else if (color === "absent" && oldColor === "") {
                shouldUpdate = true;
            }

            // 如果符合更新条件就变色
            if (shouldUpdate) {
                // 防止样式冲突
                keyButton.classList.remove("correct", "present", "absent");
                // 再穿上新的颜色衣服
                keyButton.classList.add(color);
            }
        }
    }

    if (currentGuess === targetWord) {
        setTimeout(() => alert("你猜对了！\n答案就是：" + targetWord), 100); 
    } else {
        currentRow++;      // 行数往下挪一排
        currentGuess = ""; // 清空手里的词
        
        if (currentRow === 6) {
            setTimeout(() => alert("游戏结束！正确答案是：" + targetWord), 100);
        }
    }
}
// 实体电脑键盘
document.addEventListener("keydown", function(event) {
    let key = event.key.toUpperCase();
    handleKeyPress(key); 
});

//屏幕虚拟键盘
let virtualKeys = document.querySelectorAll(".key");

for (let i = 0; i < virtualKeys.length; i++) {
    virtualKeys[i].addEventListener("click", function() {
        let key = this.innerText.toUpperCase();
        handleKeyPress(key); 
    });
}

// 悬浮按钮
// 答案
document.getElementById("btn-hint").addEventListener("click", function() {
    alert("本局答案是：" + targetWord);
});

// 重置
document.getElementById("btn-reset").addEventListener("click", function() {
    currentRow = 0;
    currentGuess = "";

    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log("游戏已重置，答案是：", targetWord);

    //清空棋盘上的字，颜色
    for (let i = 0; i < 30; i++) {
        let tile = document.getElementById("tile-" + i);
        tile.innerText = "";
        // 把格子的 class 恢复成出厂设置
        tile.className = "tile"; 
    }

    // 清空虚拟键盘上的颜色
    let allKeys = document.querySelectorAll(".key");
    for (let i = 0; i < allKeys.length; i++) {
        allKeys[i].classList.remove("correct", "present", "absent");
    }

    showToast("已重置", 2000);
});