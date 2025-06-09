// --- HTML Element Getirme ve Kontroller ---
const canvas = document.getElementById('gameCanvas');
const scoreDisplay = document.getElementById('score');
const targetScoreDisplay = document.getElementById('targetScore');
const timeDisplay = document.getElementById('time');
const livesDisplay = document.getElementById('lives');
const messageBoard = document.getElementById('messageBoard');
const restartButton = document.getElementById('restartButton');
const gameContainer = document.getElementById('gameContainer');

let ctx = null;
let pauseOverlay = null;
let canvasWidth = 800;
let canvasHeight = 400;

// --- Oyun Ayarları ---
const gravity = 0.6;
const friction = 0.85;
let score = 0;
let targetScore = 100;
let currentLevelIndex = 0;
let isGameOver = false;
let isLevelComplete = false;
let isGameWon = false;
let isPaused = false;
let gameLoopId = null;
let levelTimeLimit = 60; // <<< BAŞLANGIÇ SÜRESİ 1 DAKİKA
let currentTime = 60;
let timerIntervalId = null;

// --- Kamera ---
const camera = { x: 0, y: 0, bufferX: 250, bufferY: 100 };

// --- Ses Efekti Yer Tutucuları ---
function playSound(soundName) { console.log(`Ses çalınıyor: ${soundName}`); }

// --- Oyuncu (Mario Renkleri, Kol/Ayakkabı Boyutları) ---
const player = {
    width: 28, originalHeight: 48, crouchHeight: 28, height: 48,
    x: 100, y: canvasHeight - 100,
    speedX: 0, speedY: 0, moveSpeed: 4, jumpPower: 12.5,
    isJumping: false, isOnGround: false, initialY: 0,
    jumpsLeft: 1, maxJumps: 2, isCrouching: false,
    lives: 3, isInvincible: false, invincibilityTimer: 0, invincibilityDuration: 90,
    // Görsel Ayarlar (Mario Renkleri)
    headRadius: 8, bodyWidth: 16, bodyHeight: 20, legWidth: 6, legHeight: 15,
    armWidth: 5, armHeight: 18, // <<< Kol Boyutları
    shoeWidth: 8, shoeHeight: 6, // <<< Ayakkabı Boyutları
    skinColor: '#f0c0a0', // Ten Rengi
    shirtColor: 'red',     // <<< Gömlek/Şapka Rengi
    pantsColor: 'blue',    // <<< Tulum/Pantolon Rengi
    shoeColor: '#8B4513',  // <<< Ayakkabı Rengi (SaddleBrown)
    stompPower: 0.5
};

// --- Nesneler ---
let platforms = [];
let enemies = [];
let coins = [];
let finishPoint = null;

// --- SEVİYE VERİLERİ ---
const TILE_SIZE = 40;
const allLevels = [
    // Seviye 1
    [
        "                                        ", // 0
        "                                        ", // 1
        "                                        ", // 2
        "    C       XXXXXXXXXXXXXXXF          ", // 3
        "   X X          C                       ", // 4
        "                     C                  ", // 5
        "        P    XXX          E        C    ", // 6
        "       XXXXX     C C C XXXXXX     XXX   ", // 7
        "    XXXXXXXXX   XXXXXXX       E         ", // 8
        "                 X X           XXXXXXXXX", // 9
        "         E            C                 ", // 10
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 11
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 12
    ],
    // Seviye 2
    [
        "                                          ", // 0
        "  C                                       ", // 1
        " C C C                                    ", // 2
        " XXXXX      E            C              XX ", // 3
        "            X X                           ", // 4
        "      XXXXX         C C C       E         ", // 5
        " P C               XXXXXXX                ", // 6
        "XXX      E                     C C C      ", // 7
        "       XXXXXX    XXXXXXXXX     XXXXX      ", // 8
        "                 X         X              ", // 9
        "    C   E        X    E    X            F ", // 10
        "XXXXXXXXXXXXX    XXXXXXXXXXX     XXXXXXXXX", // 11
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 12
    ],
    // Seviye 3
    [
        "                            E        F    ", // 0
        "                           XXX       X    ", // 1
        "                          C          X    ", // 2
        "                C        XXX         X    ", // 3
        "             C           X X E     EX     ", // 4
        "            XXX      C  X XXXXXXXXXXXX     ", // 5
        "   P    E          C                      ", // 6
        "  XXXXX           XXX       E             ", // 7
        "    C  XXX C XXX     XXXXXXXX        C    ", // 8
        " E              E            C            ", // 9
        "XXXXXXXXXX     XXXXXXXXXXXXXXXXXXXXXXXXXXX", // 10
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 11
    ],
    // Seviye 4
    [
        "                                          ", // 0
        "  C C C    C C C    C C C    C C C        ", // 1
        "                                          ", // 2
        " C                                     XX ", // 3
        " XXXXX    XXXXX E  XXXXX    XXXXX      F  ", // 4
        "      E        E        E        E        ", // 5
        "   XXXXX    XXXXX    XXXXX    XXXXX       ", // 6
        " P                                        ", // 7
        "XXXXXX                                    ", // 8
        "       XXX         E         XXX          ", // 9
        "    C    XXXXXXXXXXXXXXX   XXXXXXXX   C   ", // 10
        "                                          ", // 11
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 12
    ],
    // Seviye 5
    [
        "                      E                   ", // 0
        " C                   XXX      X           ", // 1
        " XXXXX                E      X X          ", // 2
        "              E     XXXX    X   X         ", // 3
        "  C        XXXXX     C     X     X    E   ", // 4
        " XXXX               XXXX  X       X       ", // 5
        " C C C         E     C X         X      ", // 6
        "XXXXXXX         E   XXXXX           X     ", // 7
        "      C       XXXXX    X       E F   X    ", // 8
        "     P            C   X      C C      X   ", // 9
        "   XXXXX         XXXXXX      XXXXX      X  ", // 10
        " E          E       X         E       X   ", // 11
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 12
    ]
];

// --- Zamanlayıcı Fonksiyonları ---
function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds; return `${minutes}:${paddedSeconds}`; }
function updateTimerDisplay() { if (timeDisplay) timeDisplay.textContent = formatTime(currentTime); }
function startTimer() {
    stopTimer();
    // Seviyeye göre süreyi ayarla
    levelTimeLimit = (currentLevelIndex === 0) ? 60 : (60 + currentLevelIndex * 30);
    currentTime = levelTimeLimit;
    updateTimerDisplay();
    timerIntervalId = setInterval(() => {
        if (!isPaused && !isGameOver && !isGameWon && !isLevelComplete) {
            currentTime--; updateTimerDisplay();
            if (currentTime <= 0) { stopTimer(); triggerGameOver("Süre Doldu!"); }
        }
    }, 1000);
}
function stopTimer() { if (timerIntervalId) { clearInterval(timerIntervalId); timerIntervalId = null; } }

// --- Can Göstergesi Güncelleme ---
function updateLivesDisplay() { if (livesDisplay) livesDisplay.textContent = player.lives; }

// --- Seviye Yükleme ---
function loadLevel(levelIndex) {
    console.log(`Seviye ${levelIndex + 1} yükleniyor...`);
    if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } stopTimer();
    if (levelIndex >= allLevels.length) { triggerGameWon(); return; }
    const data = allLevels[levelIndex]; currentLevelIndex = levelIndex;
    isGameOver = false; isLevelComplete = false; isGameWon = false; isPaused = false;
    if (messageBoard) messageBoard.style.display = 'none'; if (restartButton) restartButton.style.display = 'none'; if (pauseOverlay) pauseOverlay.style.display = 'none';
    platforms = []; enemies = []; coins = []; finishPoint = null;
    score = 0;
    player.lives = 3; // Canları her seviye başında sıfırla
    targetScore = 100 + levelIndex * 100;
    // levelTimeLimit burada startTimer içinde ayarlanıyor
    updateScoreDisplay(); updateTargetScoreDisplay(); updateLivesDisplay();
    startTimer(); // Zamanlayıcıyı başlat (doğru süreyle)

    let playerStartX = 100, playerStartY = 100;
    data.forEach((row, rowIndex) => { row.split('').forEach((char, colIndex) => { const x = colIndex * TILE_SIZE; const y = rowIndex * TILE_SIZE; if (char === 'X') { const isGround = (rowIndex + 1 < data.length && data[rowIndex + 1][colIndex] === 'X'); platforms.push({ x, y, width: TILE_SIZE, height: TILE_SIZE, isGround, color: isGround ? 'saddlebrown' : 'sienna' }); } else if (char === 'P') { playerStartX = x + TILE_SIZE / 2 - player.width / 2; playerStartY = y + TILE_SIZE - player.height; } else if (char === 'E') { const enemyHeight = 25; enemies.push({ x, y: y + TILE_SIZE - enemyHeight, width: 35, height: enemyHeight, shellColor: '#228B22', bodyColor: '#90EE90', speedX: 1 + (levelIndex * 0.25), speedY: 0, isOnGround: false, originalX: x, patrolRange: 60 + (levelIndex * 5), isStomped: false, stompTimer: 0 }); } else if (char === 'C') { coins.push({ x: x + TILE_SIZE / 2 - 10, y: y + TILE_SIZE / 2 - 10, width: 20, height: 20, color: 'gold', collected: false }); } else if (char === 'F') { finishPoint = { x: x, y: y, width: TILE_SIZE, height: TILE_SIZE * 1.5, color: '#654321' }; } }); });

    player.x = playerStartX; player.y = playerStartY; player.initialY = playerStartY;
    player.speedX = 0; player.speedY = 0; player.isJumping = false; player.isOnGround = false;
    player.jumpsLeft = player.maxJumps; player.isCrouching = false; player.height = player.originalHeight;
    player.isInvincible = false; player.invincibilityTimer = 0;

    camera.y = player.y - canvasHeight / 2 + player.height / 2; const levelHeight = data.length * TILE_SIZE; if (camera.y < 0) camera.y = 0; if (camera.y + canvasHeight > levelHeight) camera.y = levelHeight - canvasHeight; camera.x = 0;
    console.log(`Seviye ${levelIndex + 1} Yüklendi. Hedef Skor: ${targetScore}, Süre: ${levelTimeLimit}s`);
    if (!gameLoopId) { gameLoopId = requestAnimationFrame(gameLoop); }
}

// --- Klavye Kontrolü ---
const keys = { right: false, left: false, up: false, down: false };
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'p') { togglePause(); return; }
    if (key === ' ' && (isGameOver || isGameWon)) { handleRestartAction(); return; }
    if (!isGameOver && !isLevelComplete && !isGameWon && !isPaused) {
        if (key === 'arrowright' || key === 'd') keys.right = true;
        if (key === 'arrowleft' || key === 'a') keys.left = true;
        if (key === 'arrowup' || key === 'w') keys.up = true; // Zıplama tuşu
        if (key === 'arrowdown' || key === 's') keys.down = true;
    }
});
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'arrowright' || key === 'd') keys.right = false;
    if (key === 'arrowleft' || key === 'a') keys.left = false;
    if (key === 'arrowup' || key === 'w') keys.up = false; // Zıplama tuşu
    if (key === 'arrowdown' || key === 's') keys.down = false;
});

// --- Yeniden Başlat Butonu Olay Dinleyicisi ---
if (restartButton) { restartButton.addEventListener('click', handleRestartAction); }

// --- Yeniden Başlatma Mantığı ---
function handleRestartAction() { if (isGameWon) { startGame(); } else if (isGameOver) { restartCurrentLevel(); } }

// --- Duraklatma Fonksiyonu ---
function togglePause() { if (isGameOver || isGameWon || isLevelComplete) return; isPaused = !isPaused; if (isPaused) { if(pauseOverlay) pauseOverlay.style.display = 'flex'; console.log("Oyun Duraklatıldı"); } else { if(pauseOverlay) pauseOverlay.style.display = 'none'; console.log("Oyun Devam Ediyor"); if (!gameLoopId) { gameLoopId = requestAnimationFrame(gameLoop); } } }

// --- Çarpışma Kontrolü ---
function checkCollision(rect1, rect2) { if (!rect1 || !rect2) return false; return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y; }

// --- Güncelleme Fonksiyonları ---
function updatePlayer() {
    if (player.isInvincible) { player.invincibilityTimer--; if (player.invincibilityTimer <= 0) { player.isInvincible = false; } }
    // Eğilme
    const wasCrouching = player.isCrouching; player.isCrouching = keys.down && player.isOnGround; player.height = player.isCrouching ? player.crouchHeight : player.originalHeight;
    if (wasCrouching && !player.isCrouching) { let canStand = true; const standHitbox = {x: player.x, y: player.y - (player.originalHeight - player.crouchHeight), width: player.width, height: player.originalHeight}; platforms.forEach(p => { if (checkCollision(standHitbox, p)) { canStand = false; } }); if (!canStand) { player.isCrouching = true; player.height = player.crouchHeight; } else { player.y -= (player.originalHeight - player.crouchHeight); } } else if (!wasCrouching && player.isCrouching) { player.y += (player.originalHeight - player.crouchHeight); }
    // Yatay Hareket
    let currentMoveSpeed = player.moveSpeed; if (keys.right) { player.speedX = currentMoveSpeed; } else if (keys.left) { player.speedX = -currentMoveSpeed; } else { player.speedX *= friction; if (Math.abs(player.speedX) < 0.1) player.speedX = 0; }
    // Zıplama
    if (keys.up) { if (player.jumpsLeft > 0 && !player.isCrouching) { player.speedY = -player.jumpPower; player.isJumping = true; player.isOnGround = false; player.jumpsLeft--; playSound('jump'); keys.up = false; } else { keys.up = false; } }
    // Yerçekimi
    player.speedY += gravity; let nextX = player.x + player.speedX; let nextY = player.y + player.speedY;
    // Platform Çarpışmaları
    let landed = false; player.isOnGround = false;
    platforms.forEach(platform => { const playerHitboxY = { x: player.x, y: nextY, width: player.width, height: player.height }; const playerHitboxX = { x: nextX, y: player.y, width: player.width, height: player.height }; if (checkCollision(playerHitboxY, platform)) { if (player.speedY >= 0 && player.y + player.height <= platform.y + 1) { player.isOnGround = true; landed = true; player.isJumping = false; player.speedY = 0; nextY = platform.y - player.height; } else if (player.speedY < 0 && player.y >= platform.y + platform.height - 1) { player.speedY = 0; nextY = platform.y + platform.height; } } if (checkCollision(playerHitboxX, platform)) { if (player.y + player.height > platform.y + 1 && player.y < platform.y + platform.height - 1) { player.speedX = 0; if (keys.right) nextX = platform.x - player.width; else if (keys.left) nextX = platform.x + platform.width; else nextX = player.x; } } });
    if (landed) { player.jumpsLeft = player.maxJumps; }
    player.x = nextX; player.y = nextY;
    // Görsel Renk Ayarı (artık player nesnesindeki renkler kullanılacak)
    // Bitiş Noktası
    if (finishPoint && checkCollision(player, finishPoint)) { if (score >= targetScore) { triggerLevelComplete(); } }
    // Düşme
    if (player.y > allLevels[currentLevelIndex].length * TILE_SIZE + 100) { handlePlayerFall(); }
}
function updateEnemies() { enemies.forEach((enemy, index) => { if (enemy.isStomped) { enemy.stompTimer--; if (enemy.stompTimer <= 0) enemies.splice(index, 1); return; } enemy.speedY += gravity; let nextY = enemy.y + enemy.speedY; enemy.isOnGround = false; platforms.forEach(platform => { const enemyHitboxY = { x: enemy.x, y: nextY, width: enemy.width, height: enemy.height }; if (checkCollision(enemyHitboxY, platform)) { if (enemy.speedY >= 0 && enemy.y + enemy.height <= platform.y + 1) { enemy.isOnGround = true; enemy.speedY = 0; nextY = platform.y - enemy.height; } else if (enemy.speedY < 0 && enemy.y >= platform.y + platform.height - 1) { enemy.speedY = 0; nextY = platform.y + platform.height; } } }); enemy.y = nextY; let dx = enemy.speedX; let nextX = enemy.x + dx; let wallCheckX = nextX + (enemy.speedX > 0 ? enemy.width : 0); let groundCheckX = nextX + enemy.width / 2 + (enemy.speedX > 0 ? 5 : -5); let groundCheckY = enemy.y + enemy.height + 5; let facingWall = false; let edgeOfPlatform = enemy.isOnGround; platforms.forEach(p => { if (p.y < enemy.y + enemy.height && p.y + p.height > enemy.y) { if ((enemy.speedX > 0 && nextX + enemy.width > p.x && enemy.x <= p.x) || (enemy.speedX < 0 && nextX < p.x + p.width && enemy.x + enemy.width >= p.x + p.width)) { facingWall = true; } } if (enemy.isOnGround && groundCheckX >= p.x && groundCheckX <= p.x + p.width && groundCheckY >= p.y && groundCheckY < p.y + p.height + 10) { edgeOfPlatform = false; } }); let outOfPatrolRange = (enemy.speedX < 0 && nextX < enemy.originalX - enemy.patrolRange) || (enemy.speedX > 0 && nextX + enemy.width > enemy.originalX + TILE_SIZE + enemy.patrolRange); if (facingWall || edgeOfPlatform || outOfPatrolRange) { enemy.speedX *= -1; dx = 0; } enemy.x += dx; if (!enemy.isStomped && !player.isInvincible) { const playerHitbox = { x: player.x, y: player.y, width: player.width, height: player.height }; if (checkCollision(playerHitbox, enemy)) { const isStomping = player.speedY > 0 && (player.y + player.height) < (enemy.y + enemy.height * 0.6) && !player.isOnGround; if (isStomping) { enemy.isStomped = true; enemy.stompTimer = 30; enemy.speedX = 0; enemy.speedY = -2; score += 50; updateScoreDisplay(); playSound('stomp'); player.speedY = -player.jumpPower * player.stompPower; player.isJumping = true; player.isOnGround = false; player.jumpsLeft = player.maxJumps -1; } else { handlePlayerDamage(); } } } }); }
function updateCoins() { coins = coins.filter(coin => { if (!coin.collected && checkCollision(player, coin)) { coin.collected = true; score += 10; updateScoreDisplay(); playSound('coin'); return false; } return true; }); }
function updateCamera() { const playerCenterX = player.x + player.width / 2; const cameraCenterX = camera.x + canvasWidth / 2; if (playerCenterX > cameraCenterX + camera.bufferX / 2) camera.x = playerCenterX - canvasWidth / 2 - camera.bufferX / 2; else if (playerCenterX < cameraCenterX - camera.bufferX / 2) camera.x = playerCenterX - canvasWidth / 2 + camera.bufferX / 2; const playerCenterY = player.y + player.height / 2; const cameraCenterY = camera.y + canvasHeight / 2; if (playerCenterY > cameraCenterY + camera.bufferY / 2) camera.y = playerCenterY - canvasHeight / 2 - camera.bufferY / 2; else if (playerCenterY < cameraCenterY - camera.bufferY / 2) camera.y = playerCenterY - canvasHeight / 2 + camera.bufferY / 2; const levelWidth = allLevels[currentLevelIndex][0].length * TILE_SIZE; const levelHeight = allLevels[currentLevelIndex].length * TILE_SIZE; if (camera.x < 0) camera.x = 0; if (camera.x + canvasWidth > levelWidth) camera.x = levelWidth - canvasWidth; if (camera.y < 0) camera.y = 0; if (camera.y + canvasHeight > levelHeight) camera.y = levelHeight - canvasHeight; camera.x = Math.floor(camera.x); camera.y = Math.floor(camera.y); }
function updateScoreDisplay() { if (scoreDisplay) scoreDisplay.textContent = score; }
function updateTargetScoreDisplay() { if(targetScoreDisplay) targetScoreDisplay.textContent = targetScore; }
function updateLivesDisplay() { if (livesDisplay) livesDisplay.textContent = player.lives; }

// --- Yeni Yardımcı Fonksiyonlar ---
function handlePlayerDamage() { if (player.isInvincible) return; player.lives--; updateLivesDisplay(); playSound('hurt'); console.log("Can Azaldı:", player.lives); if (player.lives <= 0) { triggerGameOver("Canın bitti!"); } else { player.isInvincible = true; player.invincibilityTimer = player.invincibilityDuration; } }
function handlePlayerFall() { if (player.isInvincible) return; console.log("Oyuncu düştü."); player.lives--; updateLivesDisplay(); playSound('hurt'); if (player.lives <= 0) { triggerGameOver("Boşluğa düştün!"); } else { if (messageBoard) { messageBoard.textContent = `Bir can kaybettin! Dikkatli ol!`; messageBoard.style.display = 'block'; } stopTimer(); if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } setTimeout(()=>{ restartCurrentLevel(); }, 1500); } }

// --- Oyun Durumu Tetikleyicileri ---
function triggerGameOver(message) { if (isGameOver || isGameWon || isLevelComplete) return; isGameOver = true; stopTimer(); if (messageBoard) { messageBoard.textContent = `Oyun Bitti! ${message}`; messageBoard.style.display = 'block'; } if (restartButton) restartButton.style.display = 'block'; playSound('gameOver'); if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } }
function triggerLevelComplete() { if (isGameOver || isGameWon || isLevelComplete) return; isLevelComplete = true; stopTimer(); playSound('levelComplete'); if (messageBoard) { messageBoard.textContent = `Seviye ${currentLevelIndex + 1} Geçildi!`; messageBoard.style.display = 'block'; } setTimeout(() => { loadLevel(currentLevelIndex + 1); }, 2000); }
function triggerGameWon() { if (isGameOver || isGameWon) return; isGameWon = true; isLevelComplete = false; stopTimer(); if (messageBoard) { messageBoard.textContent = `Tebrikler! Oyunu Kazandın!`; messageBoard.style.display = 'block'; } if (restartButton) restartButton.style.display = 'block'; playSound('gameWon'); if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } }

// --- Çizim Fonksiyonları ---
function drawPlayer() { // Mario Görünümü ve Kollar/Ayakkabılar Eklendi
    const drawX = player.x - camera.x;
    const drawY = player.y - camera.y;
    let shouldDraw = true;
    if (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) { shouldDraw = false; }

    if (shouldDraw) {
        const bodyHeightFactor = player.isCrouching ? 0.6 : 1;
        const legHeightFactor = player.isCrouching ? 0.5 : 1;

        const bodyDrawY = drawY + player.headRadius * 2;
        const bodyDrawHeight = player.bodyHeight * bodyHeightFactor;
        const legDrawY = bodyDrawY + bodyDrawHeight; // Bacaklar gövdenin altından başlar
        const legDrawHeight = player.legHeight * legHeightFactor;
        const shoeDrawY = legDrawY + legDrawHeight; // Ayakkabılar bacakların altından

        // Ayakkabılar (Bacakların altında)
        ctx.fillStyle = player.shoeColor;
        ctx.fillRect(drawX + player.width * 0.1 - (player.shoeWidth - player.legWidth)/2, shoeDrawY, player.shoeWidth, player.shoeHeight); // Sol Ayakkabı
        ctx.fillRect(drawX + player.width * 0.9 - player.legWidth + (player.shoeWidth - player.legWidth)/2 - player.shoeWidth, shoeDrawY, player.shoeWidth, player.shoeHeight); // Sağ Ayakkabı (X pozisyonu düzeltildi)


        // Bacaklar (Tulum)
        ctx.fillStyle = player.pantsColor;
        ctx.fillRect(drawX + player.width * 0.1, legDrawY, player.legWidth, legDrawHeight); // Sol Bacak
        ctx.fillRect(drawX + player.width * 0.9 - player.legWidth, legDrawY, player.legWidth, legDrawHeight); // Sağ Bacak

        // Kollar (Gömlek Rengi) - Gövdenin yanında
        ctx.fillStyle = player.shirtColor;
        const armDrawY = bodyDrawY + bodyDrawHeight * 0.1; // Kolun başlangıç Y'si
        const armDrawHeight = player.armHeight * bodyHeightFactor; // Eğilince kol da kısalsın
        ctx.fillRect(drawX + (player.width - player.bodyWidth) / 2 - player.armWidth, armDrawY, player.armWidth, armDrawHeight); // Sol Kol
        ctx.fillRect(drawX + (player.width + player.bodyWidth) / 2, armDrawY, player.armWidth, armDrawHeight); // Sağ Kol


        // Gövde (Tulumun üst kısmı gibi düşünebiliriz)
        ctx.fillStyle = player.pantsColor; // Tulum rengi
        ctx.fillRect(drawX + (player.width - player.bodyWidth) / 2, bodyDrawY, player.bodyWidth, bodyDrawHeight);
         // Gömlek kısmı (Gövdenin üzerine daha küçük bir kare)
         ctx.fillStyle = player.shirtColor;
         ctx.fillRect(drawX + (player.width - player.bodyWidth*0.8) / 2, bodyDrawY + bodyDrawHeight*0.1, player.bodyWidth*0.8, bodyDrawHeight*0.8);


        // Kafa
        const headDrawY = player.isCrouching ? (drawY + player.headRadius * 0.5) : drawY;
        ctx.fillStyle = player.skinColor;
        ctx.beginPath(); ctx.arc(drawX + player.width / 2, headDrawY + player.headRadius, player.headRadius, 0, Math.PI * 2); ctx.fill();
        // Gözler
        ctx.fillStyle = 'black'; ctx.fillRect(drawX + player.width/2 - 3, headDrawY + player.headRadius - 2, 2, 2); ctx.fillRect(drawX + player.width/2 + 1, headDrawY + player.headRadius - 2, 2, 2);
        // Basit Kırmızı Şapka (Opsiyonel)
        // ctx.fillStyle = player.shirtColor; // Kırmızı
        // ctx.fillRect(drawX + player.width * 0.15, headDrawY - player.headRadius * 0.2, player.width * 0.7, player.headRadius * 0.8); // Şapka üstü
        // ctx.beginPath(); ctx.arc(drawX + player.width / 2, headDrawY + player.headRadius*0.2, player.headRadius * 0.8, Math.PI, 2*Math.PI); ctx.fill(); // Şapka yuvarlaklığı
    }
}
function drawPlatforms() { const grassHeight = TILE_SIZE * 0.3; platforms.forEach(p => { if (p.x + p.width > camera.x && p.x < camera.x + canvasWidth && p.y + p.height > camera.y && p.y < camera.y + canvasHeight) { const dX = p.x - camera.x; const dY = p.y - camera.y; ctx.fillStyle = p.color; ctx.fillRect(dX, dY + grassHeight, p.width, p.height - grassHeight); ctx.fillStyle = '#6B8E23'; ctx.fillRect(dX, dY, p.width, grassHeight); ctx.fillStyle = 'rgba(0,0,0,0.1)'; for(let i=0; i< p.width; i+= 5) ctx.fillRect(dX + i, dY, 1, grassHeight); } }); }
function drawEnemies() { enemies.forEach(e => { if (e.x + e.width > camera.x && e.x < camera.x + canvasWidth && e.y + e.height > camera.y && e.y < camera.y + canvasHeight) { const dX = e.x - camera.x; const dY = e.y - camera.y; if (e.isStomped) { ctx.fillStyle = e.shellColor; ctx.fillRect(dX, dY + e.height * 0.6, e.width, e.height * 0.4); } else { ctx.fillStyle = e.bodyColor; ctx.fillRect(dX + 2, dY + e.height - 5, 5, 5); ctx.fillRect(dX + e.width - 7, dY + e.height - 5, 5, 5); ctx.fillStyle = e.shellColor; ctx.fillRect(dX, dY + e.height * 0.2, e.width, e.height * 0.8); ctx.beginPath(); ctx.arc(dX + e.width / 2, dY + e.height * 0.6, e.width / 2, Math.PI, 0); ctx.fill(); ctx.fillStyle = e.bodyColor; const hX = (e.speedX >= 0) ? (dX + e.width - 5) : (dX - 5); ctx.fillRect(hX, dY + e.height * 0.3, 10, 8); ctx.fillStyle = 'black'; const eX = (e.speedX >= 0) ? (hX + 6) : (hX + 2); ctx.fillRect(eX, dY + e.height * 0.3 + 2, 2, 2); } } }); }
function drawCoins() { coins.forEach(c => { if (!c.collected && c.x + c.width > camera.x && c.x < camera.x + canvasWidth && c.y + c.height > camera.y && c.y < camera.y + canvasHeight) { const dX = c.x - camera.x; const dY = c.y - camera.y; ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(dX + c.width / 2, dY + c.height / 2, c.width / 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255, 255, 0, 0.7)'; ctx.beginPath(); ctx.arc(dX + c.width *0.6, dY + c.height*0.4, c.width * 0.2, 0, Math.PI * 2); ctx.fill(); } }); }
function drawFinishPoint() { if (finishPoint && finishPoint.x + finishPoint.width > camera.x && finishPoint.x < camera.x + canvasWidth && finishPoint.y + finishPoint.height > camera.y && finishPoint.y < camera.y + canvasHeight) { const dX = finishPoint.x - camera.x; const dY = finishPoint.y - camera.y; const doorWidth = finishPoint.width * 0.8; const doorHeight = finishPoint.height; const frameWidth = finishPoint.width; const frameHeight = finishPoint.height; const frameThickness = 4; ctx.fillStyle = '#A0522D'; ctx.fillRect(dX, dY, frameWidth, frameHeight); ctx.fillStyle = '#8B4513'; ctx.fillRect(dX + frameThickness, dY + frameThickness, doorWidth - frameThickness*1.5 , doorHeight - frameThickness*1.5); ctx.fillStyle = 'gold'; ctx.beginPath(); ctx.arc(dX + doorWidth * 0.8, dY + doorHeight / 2, 4, 0, Math.PI * 2); ctx.fill(); } }
function draw() { if (!ctx) return; ctx.fillStyle = '#87ceeb'; ctx.fillRect(0, 0, canvasWidth, canvasHeight); drawPlatforms(); drawCoins(); drawFinishPoint(); drawEnemies(); drawPlayer(); }

// --- Oyun Döngüsü ---
function gameLoop() {
    gameLoopId = null; // ID'yi sıfırla, böylece durdurulduğunda tekrar istenmez

    // Durum kontrolleri
    if (isGameOver || isGameWon) {
        draw(); // Son durumu çiz
        return; // Döngüyü durdur
    }

    // Güncelleme (sadece duraklatılmadıysa ve seviye bitmediyse)
    if (!isPaused && !isLevelComplete) {
        updatePlayer();
        updateEnemies();
        updateCoins();
        updateCamera();
    }

    // Her zaman çizim yap
    draw();

    // Bir sonraki frame'i iste (eğer oyun hala aktifse)
    if (!isGameOver && !isGameWon) { // isLevelComplete durumunda da timeout beklerken istemeye devam etmeli
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}


// --- Oyunu Başlatma / Yeniden Başlatma Fonksiyonları ---
function startGame() {
    console.log("Oyun Tamamen Baştan Başlatılıyor...");
    if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } stopTimer();
    currentLevelIndex = 0; score = 0; player.lives = 3; // Canları sıfırla
    updateScoreDisplay(); updateLivesDisplay();
    loadLevel(currentLevelIndex);
}
function restartCurrentLevel() {
    console.log(`Seviye ${currentLevelIndex + 1} Yeniden Başlatılıyor...`);
    if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; } stopTimer();
    score = 0;
    player.lives = 3; // Canları her seviye yeniden başlatmada sıfırla
    updateScoreDisplay(); updateLivesDisplay();
    loadLevel(currentLevelIndex);
}

// --- DOM Yüklendiğinde Başlat ---
document.addEventListener('DOMContentLoaded', (event) => {
    // Canvas ve Context kontrolü
    if (!canvas) { console.error("DOM Yüklendi: Canvas elementi bulunamadı."); return; }
    ctx = canvas.getContext('2d');
    if (!ctx) { console.error("DOM Yüklendi: Canvas context alınamadı."); return; }
    canvasWidth = canvas.width; canvasHeight = canvas.height;

    // Pause overlay'i oluştur
    if (gameContainer) {
        pauseOverlay = document.createElement('div'); pauseOverlay.id = 'pauseOverlay'; pauseOverlay.textContent = 'DURAKLATILDI (P)';
        Object.assign(pauseOverlay.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', fontSize: '3em', fontWeight: 'bold', display: 'none', justifyContent: 'center', alignItems: 'center', textShadow: '2px 2px 4px black', zIndex: '20' });
        gameContainer.appendChild(pauseOverlay);
    } else { console.error("Hata: 'gameContainer' bulunamadı, pause overlay eklenemedi."); }

    // Diğer UI Elementlerini kontrol et
    if (!scoreDisplay || !targetScoreDisplay || !timeDisplay || !livesDisplay || !messageBoard || !restartButton || !pauseOverlay) { console.error("Hata: Gerekli UI elementlerinden biri veya birkaçı bulunamadı!"); return; }

    // Oyunu başlat
    startGame();
});