import { itemData } from '../items/itemData.js';

// Глобальный объект игрока
if (!window.player) {
    window.player = { health: 10, maxHealth: 10 };
}

function addItemToBackpack(type) {
    console.log('Adding item to backpack:', type);
    const slots = document.querySelectorAll('.backpack-slot');
    for (let slot of slots) {
        if (!slot.hasChildNodes()) {
            const item = document.createElement('div');
            item.classList.add('backpack-item', type);
            // Используем изображение
            const img = document.createElement('img');
            img.draggable = false;
            if (type === 'sword') {
                img.src = 'images/sword.png';
                img.alt = 'Меч';
                img.style.width = '32px';
                img.style.height = '32px';
            } else if (type === 'shield') {
                img.src = 'images/shield.png';
                img.alt = 'Щит';
                img.style.width = '32px';
                img.style.height = '32px';
            } else if (type === 'potion') {
                img.src = 'images/bottle.png';
                img.alt = 'Зелье';
                img.style.width = '32px';
                img.style.height = '32px';
            }
            img.classList.add('item-img');
            item.appendChild(img);
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            slot.appendChild(item);
            console.log('Item added to slot');
            break;
        }
    }
}

let currentChest = null;

export function setupChests() {
    console.log('Setting up chests...');
    const chests = document.querySelectorAll('.chest');
    const modal = document.getElementById('item-select-modal');
    const options = document.querySelectorAll('.item-option');

    if (!modal || !options.length) {
        console.log('Modal or options not found, will retry...');
        setTimeout(setupChests, 100);
        return;
    }

    // Обновим иконки в модальном окне выбора предмета
    options.forEach(option => {
        const type = option.getAttribute('data-item');
        let imgSrc = '';
        if (type === 'sword') imgSrc = 'images/sword.png';
        if (type === 'shield') imgSrc = 'images/shield.png';
        if (type === 'potion') imgSrc = 'images/bottle.png';
        let icon = option.querySelector('img');
        if (!icon) {
            icon = document.createElement('img');
            option.prepend(icon);
        }
        icon.src = imgSrc;
        icon.alt = type;
        icon.className = 'item-img';
        icon.style.width = '40px';
        icon.style.height = '40px';
        icon.style.marginBottom = '4px';
        // Скрываем старую div-иконку
        const oldIcon = option.querySelector('.item-icon');
        if (oldIcon) oldIcon.style.display = 'none';
    });

    // Удаляем старые обработчики
    chests.forEach(chest => {
        chest.removeEventListener('click', handleChestClick);
    });
    options.forEach(option => {
        option.removeEventListener('click', handleOptionClick);
    });
    modal.removeEventListener('click', handleModalClick);

    chests.forEach(chest => {
        chest.addEventListener('click', function() {
            if (chest.classList.contains('opened')) return;
            modal.classList.remove('hidden');
            currentChest = chest;
        });
    });
    options.forEach(option => {
        option.addEventListener('click', function() {
            if (!currentChest) return;
            const type = this.getAttribute('data-item');
            addItemToBackpack(type);
            modal.classList.add('hidden');
            currentChest.classList.add('opened');
            currentChest = null;
        });
    });
    modal.addEventListener('click', handleModalClick);
    console.log('Chests setup completed');
}

function handleChestClick() {
    console.log('Chest clicked');
    if (this.classList.contains('opened')) {
        console.log('Chest already opened');
        return;
    }
    const modal = document.getElementById('item-select-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Current chest set:', this);
    }
}

function handleOptionClick() {
    console.log('Option clicked');
    const type = this.getAttribute('data-item');
    console.log('Selected item type:', type);
    addItemToBackpack(type);
    const modal = document.getElementById('item-select-modal');
    if (modal) modal.classList.add('hidden');
    this.classList.add('opened');
    console.log('Chest marked as opened');
}

function handleModalClick(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
}

function setupBackpackTooltips() {
    const tooltip = document.getElementById('backpack-tooltip');
    if (!tooltip) return;

    // Для рюкзака
    document.addEventListener('mouseover', function(e) {
        let item = e.target.closest('.backpack-item');
        if (!item && e.target.classList.contains('item-img')) {
            item = e.target.parentElement;
        }
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

        // Для предметов в сундуке
        let option = e.target.closest('.item-option');
        if (option) {
            let type = option.getAttribute('data-item');
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
        const related = e.relatedTarget;
        const leftItem = e.target.closest('.backpack-item');
        const toItem = related && related.closest ? related.closest('.backpack-item') : null;
        // Для рюкзака
        if (leftItem && leftItem !== toItem) {
            tooltip.classList.add('hidden');
        }
        // Для сундука
        const leftOption = e.target.closest('.item-option');
        const toOption = related && related.closest ? related.closest('.item-option') : null;
        if (leftOption && leftOption !== toOption) {
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
    const playerBars = document.querySelectorAll('.player-healthbar');
    if (!playerBars.length) return;
    playerBars.forEach(bar => {
        const healthText = bar.querySelector('.health-text');
        const healthBar = bar.querySelector('.health-bar-inner');
        if (healthText && healthBar) {
            healthText.textContent = `${player.health} / ${player.maxHealth}`;
            healthBar.style.width = `${(player.health/player.maxHealth)*100}%`;
        }
    });
    if (enemy) {
        const enemyBars = document.querySelectorAll('.enemy-healthbar');
        enemyBars.forEach(bar => {
            const healthText = bar.querySelector('.health-text');
            const healthBar = bar.querySelector('.health-bar-inner');
            if (healthText && healthBar) {
                healthText.textContent = `${enemy.health} / ${enemy.maxHealth}`;
                healthBar.style.width = `${(enemy.health/enemy.maxHealth)*100}%`;
            }
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
    const activeLocation = document.querySelector('.location.active');
    if (!activeLocation) return;

    const btn = activeLocation.querySelector('.battle-start-btn');
    const enemyBar = activeLocation.querySelector('.enemy-healthbar');
    
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
    // Используем глобального игрока
    const player = window.player;
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

// Сброс здоровья при рестарте игры
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
    window.player = { health: 10, maxHealth: 10 };
};

// Гарантируем, что сундуки работают после загрузки модуля
setupChests(); 