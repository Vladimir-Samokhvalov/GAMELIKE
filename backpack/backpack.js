import { itemData } from './items/itemData.js';

const backpackIcon = document.getElementById('backpack-icon');
const backpackModal = document.getElementById('backpack-modal');

if (backpackIcon && backpackModal) {
    backpackIcon.addEventListener('click', () => {
        backpackModal.classList.toggle('hidden');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            backpackModal.classList.add('hidden');
        }
    });
}

function addItemToBackpack(type) {
    const slots = document.querySelectorAll('.backpack-slot');
    for (let slot of slots) {
        if (!slot.hasChildNodes()) {
            const item = document.createElement('div');
            item.classList.add('backpack-item', type);
            // Визуализация предмета
            if (type === 'sword') {
                item.style.width = '18px';
                item.style.height = '40px';
                item.style.background = 'linear-gradient(180deg, #eee 70%, #888 100%)';
                item.style.border = '3px solid #b36b00';
                item.style.borderRadius = '6px';
                item.style.margin = 'auto';
            } else if (type === 'shield') {
                item.style.width = '32px';
                item.style.height = '32px';
                item.style.background = '#b3b3b3';
                item.style.border = '3px solid #b36b00';
                item.style.borderRadius = '6px';
                item.style.margin = 'auto';
            } else if (type === 'potion') {
                item.style.width = '32px';
                item.style.height = '32px';
                item.style.background = '#e74c3c';
                item.style.border = '3px solid #b36b00';
                item.style.borderRadius = '50%';
                item.style.margin = 'auto';
            }
            slot.appendChild(item);
            break;
        }
    }
}

function setupChests() {
    const chests = document.querySelectorAll('.chest');
    const modal = document.getElementById('item-select-modal');
    const options = document.querySelectorAll('.item-option');
    let currentChest = null;
    chests.forEach(chest => {
        chest.addEventListener('click', () => {
            if (chest.classList.contains('opened')) return;
            modal.classList.remove('hidden');
            currentChest = chest;
        });
    });
    options.forEach(option => {
        option.addEventListener('click', () => {
            if (!currentChest) return;
            const type = option.getAttribute('data-item');
            addItemToBackpack(type);
            modal.classList.add('hidden');
            currentChest.classList.add('opened');
            currentChest.style.display = 'none';
            currentChest = null;
        });
    });
    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function setupBackpackTooltips() {
    const tooltip = document.getElementById('backpack-tooltip');
    document.addEventListener('mouseover', function(e) {
        const item = e.target.closest('.backpack-item');
        if (item) {
            let type = 'unknown';
            if (item.classList.contains('sword')) type = 'sword';
            if (item.classList.contains('shield')) type = 'shield';
            if (item.classList.contains('potion')) type = 'potion';
            if (itemData[type]) {
                tooltip.textContent = itemData[type].description;
                tooltip.classList.remove('hidden');
            }
        }
    });
    document.addEventListener('mousemove', function(e) {
        if (!tooltip.classList.contains('hidden')) {
            tooltip.style.left = (e.clientX + 18) + 'px';
            tooltip.style.top = (e.clientY + 18) + 'px';
        }
    });
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.backpack-item')) {
            tooltip.classList.add('hidden');
        }
    });
}

function getPlayerDamage() {
    // Считаем количество мечей в рюкзаке
    const slots = document.querySelectorAll('.backpack-slot');
    let swords = 0;
    slots.forEach(slot => {
        if (slot.firstChild && slot.firstChild.classList.contains('sword')) swords++;
    });
    return swords * itemData.sword.damage;
}

function hasShield() {
    const slots = document.querySelectorAll('.backpack-slot');
    return Array.from(slots).some(slot => slot.firstChild && slot.firstChild.classList.contains('shield'));
}

function hasPotion() {
    const slots = document.querySelectorAll('.backpack-slot');
    return Array.from(slots).some(slot => slot.firstChild && slot.firstChild.classList.contains('potion'));
}

function usePotionIfNeeded(player) {
    if (player.health <= itemData.potion.triggerHealth && hasPotion()) {
        // Удаляем первое зелье
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

function updateHealthbars(player, enemy) {
    // Обновляем полоски и текст
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

function logBattle(msg) {
    const log = document.querySelector('.location.active .battle-log');
    if (log) {
        log.classList.remove('hidden');
        log.innerHTML += `<div>${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }
}

function clearBattleLog() {
    const log = document.querySelector('.location.active .battle-log');
    if (log) log.innerHTML = '';
}

function showBattleButtonIfEnemy() {
    const btn = document.querySelector('.location.active .battle-start-btn');
    const enemyBar = document.querySelector('.location.active .enemy-healthbar');
    if (btn && enemyBar) {
        btn.classList.remove('hidden');
        btn.onclick = () => {
            console.log('Кнопка нажата, запуск боя через 1 секунду');
            btn.classList.add('hidden');
            setTimeout(() => {
                try {
                    startBattle();
                } catch (e) {
                    console.error('Ошибка при запуске боя:', e);
                }
            }, 1000);
        };
    } else if (btn) {
        btn.classList.add('hidden');
    }
}

function startBattle() {
    console.log('startBattle вызвана');
    // Только если есть враг на локации
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
            // Ход игрока
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
                // Включаем основную музыку, выключаем боевую
                const music = document.getElementById('game-music');
                const battleMusic = document.getElementById('battle-music');
                if (battleMusic) battleMusic.pause();
                if (music) {
                    music.currentTime = 0;
                    music.play();
                }
                battleOver = true;
                clearInterval(interval);
                return;
            }
        } else {
            // Ход врага
            let dmg = enemy.damage;
            if (hasShield()) dmg = Math.max(0, dmg - itemData.shield.block);
            player.health = Math.max(0, player.health - dmg);
            logBattle(`Враг атакует на ${dmg} урона!`);
            updateHealthbars(player, enemy);
            usePotionIfNeeded(player);
            if (player.health <= 0) {
                logBattle('Герой пал в бою!');
                // Останавливаем всю музыку
                const music = document.getElementById('game-music');
                const battleMusic = document.getElementById('battle-music');
                if (battleMusic) battleMusic.pause();
                if (music) music.pause();
                battleOver = true;
                clearInterval(interval);
                setTimeout(() => {
                    // Показываем стартовый экран
                    const startScreen = document.getElementById('start-screen');
                    if (startScreen) {
                        startScreen.style.display = 'flex';
                    } else {
                        // Если стартовый экран не загружен, перезагружаем страницу
                        location.reload();
                    }
                }, 1500);
                return;
            }
        }
        turn++;
    }, 1000);
}

window.startBattle = startBattle;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showBattleButtonIfEnemy();
    }, 800);
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupChests();
        setupBackpackTooltips();
    });
} else {
    setupChests();
    setupBackpackTooltips();
}

window.resetGame = function resetGame() {
    // 1. Сбросить активную локацию на первую
    document.querySelectorAll('.location').forEach((loc, i) => {
        if (i === 0) {
            loc.classList.add('active');
        } else {
            loc.classList.remove('active');
        }
    });
    // Сбросить индекс локации
    window.currentLocation = 0;
    // 2. Сбросить здоровье игрока
    document.querySelectorAll('.player-healthbar').forEach(bar => {
        bar.querySelector('.health-text').textContent = '10 / 10';
        bar.querySelector('.health-bar-inner').style.width = '100%';
    });
    // 3. Очистить рюкзак
    document.querySelectorAll('.backpack-slot').forEach(slot => {
        while (slot.firstChild) slot.removeChild(slot.firstChild);
    });
    // 4. Сбросить лог боя
    document.querySelectorAll('.battle-log').forEach(log => {
        log.innerHTML = '';
        log.classList.add('hidden');
    });
    // 5. Скрыть все модальные окна
    const modal = document.getElementById('item-select-modal');
    if (modal) modal.classList.add('hidden');
    // 6. Вернуть сундуки (если нужно)
    document.querySelectorAll('.chest').forEach(chest => {
        chest.classList.remove('opened');
        chest.style.display = '';
    });
}; 