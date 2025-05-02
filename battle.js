import { itemData } from './items/itemData.js';
import { playMainMusic, stopAllMusic } from './music/music.js';

export function getPlayerDamage() {
    const slots = document.querySelectorAll('.backpack-slot');
    let swords = 0;
    slots.forEach(slot => {
        if (slot.firstChild && slot.firstChild.classList.contains('sword')) swords++;
    });
    return swords * itemData.sword.damage;
}

export function hasShield() {
    const slots = document.querySelectorAll('.backpack-slot');
    return Array.from(slots).some(slot => slot.firstChild && slot.firstChild.classList.contains('shield'));
}

export function hasPotion() {
    const slots = document.querySelectorAll('.backpack-slot');
    return Array.from(slots).some(slot => slot.firstChild && slot.firstChild.classList.contains('potion'));
}

export function usePotionIfNeeded(player) {
    if (player.health <= itemData.potion.triggerHealth && hasPotion()) {
        const slots = document.querySelectorAll('.backpack-slot');
        for (let slot of slots) {
            if (slot.firstChild && slot.firstChild.classList.contains('potion')) {
                slot.removeChild(slot.firstChild);
                break;
            }
        }
        player.health = player.maxHealth;
        logBattle('Зелье восстановило здоровье героя!');
        updateHealthbars(player, null);
    }
}

export function updateHealthbars(player, enemy) {
    document.querySelectorAll('.player-healthbar').forEach(bar => {
        bar.querySelector('.health-text').textContent = `${player.health} / ${player.maxHealth}`;
        bar.querySelector('.health-bar-inner').style.width = `${(player.health/player.maxHealth)*100}%`;
    });
    if (enemy) {
        document.querySelectorAll('.enemy-healthbar').forEach(bar => {
            bar.querySelector('.health-text').textContent = `${enemy.health} / ${enemy.maxHealth}`;
            bar.querySelector('.health-bar-inner').style.width = `${(enemy.health/enemy.maxHealth)*100}%`;
        });
    }
}

export function logBattle(msg) {
    const log = document.querySelector('.location.active .battle-log');
    if (log) {
        log.classList.remove('hidden');
        log.innerHTML += `<div>${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }
}

export function clearBattleLog() {
    const log = document.querySelector('.location.active .battle-log');
    if (log) log.innerHTML = '';
}

export function startBattle() {
    console.log('startBattle вызвана');
    const enemyBar = document.querySelector('.location.active .enemy-healthbar');
    if (!enemyBar) return;
    clearBattleLog();
    const player = { health: 10, maxHealth: 10 };
    const enemy = { health: 7, maxHealth: 7, damage: 2 };
    updateHealthbars(player, enemy);
    let turn = 0;
    let battleOver = false;
    logBattle('Бой начался!');
    const interval = setInterval(() => {
        if (battleOver) return;
        if (turn % 2 === 0) {
            let dmg = getPlayerDamage();
            if (dmg <= 0) {
                logBattle('Герой не может атаковать (нет меча)!');
            } else {
                enemy.health = Math.max(0, enemy.health - dmg);
                logBattle(`Герой атакует на ${dmg} урона!`);
                updateHealthbars(player, enemy);
            }
            if (enemy.health <= 0) {
                logBattle('Враг повержен!');
                playMainMusic();
                battleOver = true;
                clearInterval(interval);
                return;
            }
        } else {
            let dmg = enemy.damage;
            if (hasShield()) dmg = Math.max(0, dmg - itemData.shield.block);
            player.health = Math.max(0, player.health - dmg);
            logBattle(`Враг атакует на ${dmg} урона!`);
            updateHealthbars(player, enemy);
            usePotionIfNeeded(player);
            if (player.health <= 0) {
                logBattle('Герой пал в бою!');
                stopAllMusic();
                battleOver = true;
                clearInterval(interval);
                setTimeout(() => {
                    const startScreen = document.getElementById('start-screen');
                    if (startScreen) {
                        startScreen.style.display = 'flex';
                    } else {
                        location.reload();
                    }
                }, 1500);
                return;
            }
        }
        turn++;
    }, 1000);
} 