export function playMainMusic() {
    const music = document.getElementById('game-music');
    const battleMusic = document.getElementById('battle-music');
    if (battleMusic) battleMusic.pause();
    if (music && music.paused) music.play();
}

export function playBattleMusic() {
    const music = document.getElementById('game-music');
    const battleMusic = document.getElementById('battle-music');
    if (music) music.pause();
    if (battleMusic) {
        battleMusic.currentTime = 0;
        battleMusic.play();
    }
}

export function stopAllMusic() {
    const music = document.getElementById('game-music');
    const battleMusic = document.getElementById('battle-music');
    if (music) music.pause();
    if (battleMusic) battleMusic.pause();
} 