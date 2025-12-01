let spritesheetStop;
let spritesheetRun;
let spritesheetJump;
let spritesheetFight;

// 先給個預設值，真正的幀寬會在 setup() 根據圖片計算
let frameWidthStop = 78; // 近似 548 / 7
let frameHeightStop = 102;
let frameWidthRun = 126; // 近似 2389 / 19
let frameHeightRun = 110;
let frameWidthJump = 68; // 近似 675 / 10
let frameHeightJump = 148;
let frameWidthFight = 190; // 近似 10825 / 57
let frameHeightFight = 225;

let currentFrame = 0;
let animationSpeed = 0.18;

// 角色狀態
let characterX = 0; // 相對於中心的位移
let characterY = 0;
let isMoving = false;
let moveDirection = 0; // 1 = 右, -1 = 左
let lastDirection = 1; // 記住最後的方向
let isJumping = false;
let isFighting = false;

let currentSpritesheet;
let currentFrameWidth;
let currentFrameHeight;
let totalFrames;

let moveSpeed = 6; // 水平移動速度
let maxJumpHeight = 180; // 跳躍高度（像素）

function preload() {
  spritesheetStop = loadImage('1-1 stop/all.png');
  spritesheetRun = loadImage('1-5 run/all.png');
  spritesheetJump = loadImage('1-2 jump/all.png');
  spritesheetFight = loadImage('1-4 fight/all.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 根據載入的圖片計算實際每幀寬度與高度
  frameWidthStop = spritesheetStop.width / 7;
  frameHeightStop = spritesheetStop.height;
  frameWidthRun = spritesheetRun.width / 19;
  frameHeightRun = spritesheetRun.height;
  frameWidthJump = spritesheetJump.width / 10;
  frameHeightJump = spritesheetJump.height;
  frameWidthFight = spritesheetFight.width / 57;
  frameHeightFight = spritesheetFight.height;

  currentSpritesheet = spritesheetStop;
  currentFrameWidth = frameWidthStop;
  currentFrameHeight = frameHeightStop;
  totalFrames = 7;
}

function draw() {
  background('#bde0fe');

  let frameIndex;

  if (isFighting) {
    // 攻擊動畫（一次性播放 totalFrames＝57 幀）
    currentFrame += animationSpeed * 0.9;
    if (currentFrame >= totalFrames) {
      // 攻擊結束，回到待機
      isFighting = false;
      currentFrame = 0;
      currentSpritesheet = spritesheetStop;
      currentFrameWidth = frameWidthStop;
      currentFrameHeight = frameHeightStop;
      totalFrames = 7;
      frameIndex = 0;
    } else {
      frameIndex = floor(currentFrame);
    }
  } else if (isJumping) {
    // 跳躍一次性播放 totalFrames（10）幀，播放完後結束跳躍
    currentFrame += animationSpeed * 1.2;
    if (currentFrame >= totalFrames) {
      // 跳躍結束，回到跑步或待機狀態
      isJumping = false;
      characterY = 0;
      currentFrame = 0;
      if (isMoving) {
        currentSpritesheet = spritesheetRun;
        currentFrameWidth = frameWidthRun;
        currentFrameHeight = frameHeightRun;
        totalFrames = 19;
      } else {
        currentSpritesheet = spritesheetStop;
        currentFrameWidth = frameWidthStop;
        currentFrameHeight = frameHeightStop;
        totalFrames = 7;
      }
      frameIndex = 0;
    } else {
      frameIndex = floor(currentFrame);
      // 使用 sin 讓起落更平滑：progress 從 0 -> 1
      let progress = frameIndex / (totalFrames - 1);
      characterY = -maxJumpHeight * sin(progress * PI);
    }
  } else {
    // 常態（待機或跑步）
    currentFrame = (currentFrame + animationSpeed) % totalFrames;
    frameIndex = floor(currentFrame);
    characterY = 0;
  }

  // 水平移動（無論是否跳躍，只要按著方向鍵就會水平移動）
  if (moveDirection !== 0) {
    characterX += moveSpeed * moveDirection;
    // 邊界處理：讓角色不跑出畫面
    let halfW = currentFrameWidth / 2;
    let minX = -width / 2 + halfW;
    let maxX = width / 2 - halfW;
    if (characterX < minX) characterX = minX;
    if (characterX > maxX) characterX = maxX;
  }

  // 計算精靈來源
  let sourceX = frameIndex * currentFrameWidth;
  let sourceY = 0;

  // 在視窗中間繪製角色
  let centerX = width / 2 + characterX;
  let centerY = height / 2 + characterY;

  push();
  // 若最後方向為左，或目前正在向左移動，則翻轉
  if (moveDirection === -1 || (moveDirection === 0 && lastDirection === -1)) {
    translate(centerX, centerY);
    scale(-1, 1);
    translate(-currentFrameWidth / 2, -currentFrameHeight / 2);
    image(currentSpritesheet,
          0,
          0,
          currentFrameWidth,
          currentFrameHeight,
          sourceX,
          sourceY,
          currentFrameWidth,
          currentFrameHeight);
  } else {
    image(currentSpritesheet,
          centerX - currentFrameWidth / 2,
          centerY - currentFrameHeight / 2,
          currentFrameWidth,
          currentFrameHeight,
          sourceX,
          sourceY,
          currentFrameWidth,
          currentFrameHeight);
  }
  pop();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    // 切換到跑步動畫，向右移動
    currentSpritesheet = spritesheetRun;
    currentFrameWidth = frameWidthRun;
    currentFrameHeight = frameHeightRun;
    totalFrames = 19;
    currentFrame = 0;
    isMoving = true;
    moveDirection = 1;
    lastDirection = 1;
  } else if (keyCode === LEFT_ARROW) {
    // 切換到跑步動畫，向左移動
    currentSpritesheet = spritesheetRun;
    currentFrameWidth = frameWidthRun;
    currentFrameHeight = frameHeightRun;
    totalFrames = 19;
    currentFrame = 0;
    isMoving = true;
    moveDirection = -1;
    lastDirection = -1;
  } else if (keyCode === UP_ARROW) {
    // 跳躍（一次性播放跳躍精靈的所有幀）
    if (!isJumping) {
      isJumping = true;
      currentSpritesheet = spritesheetJump;
      currentFrameWidth = frameWidthJump;
      currentFrameHeight = frameHeightJump;
      totalFrames = 10;
      currentFrame = 0;
    }
  } else if (key === ' ' || keyCode === 32) {
    // 空白鍵：攻擊動畫（一次性播放 57 幀）
    if (!isFighting) {
      isFighting = true;
      // 攻擊時暫停水平移動
      moveDirection = 0;
      isMoving = false;
      currentSpritesheet = spritesheetFight;
      currentFrameWidth = frameWidthFight;
      currentFrameHeight = frameHeightFight;
      totalFrames = 57;
      currentFrame = 0;
    }
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW) {
    moveDirection = 0;
    isMoving = false;
    // 只有在不跳躍時才回到待機
    if (!isJumping) {
      currentSpritesheet = spritesheetStop;
      currentFrameWidth = frameWidthStop;
      currentFrameHeight = frameHeightStop;
      totalFrames = 7;
      currentFrame = 0;
    }
  } else if (keyCode === LEFT_ARROW) {
    moveDirection = 0;
    isMoving = false;
    if (!isJumping) {
      currentSpritesheet = spritesheetStop;
      currentFrameWidth = frameWidthStop;
      currentFrameHeight = frameHeightStop;
      totalFrames = 7;
      currentFrame = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
