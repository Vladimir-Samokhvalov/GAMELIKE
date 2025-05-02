import { startBattle } from './battle.js';
import { resetGame } from './start/gameReset.js';
import { playMainMusic, playBattleMusic, stopAllMusic } from './music/music.js';
import { setupChests } from './backpack/backpack.js';
import { locationsData } from './locations/locationsData.js';
import { monstersData } from './monsters/monstersData.js';
import { npcsData } from './npcs/npcsData.js';

function addItemToBackpack(type) {
    const slots = document.querySelectorAll('.backpack-slot');
    for (let slot of slots) {
        if (!slot.hasChildNodes()) {
            const item = document.createElement('div');
            item.classList.add('backpack-item', type);
            const img = document.createElement('img');
            img.draggable = false;
            if (type === 'sword') {
                img.src = 'images/sword.png';
                img.alt = 'Меч';
            } else if (type === 'shield') {
                img.src = 'images/shield.png';
                img.alt = 'Щит';
            } else if (type === 'potion') {
                img.src = 'images/bottle.png';
                img.alt = 'Зелье';
            }
            img.classList.add('item-img');
            item.appendChild(img);
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            slot.appendChild(item);
            break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Динамическая генерация локаций
    const locationContainer = document.getElementById('location-container');
    locationContainer.innerHTML = '';
    locationsData.forEach((loc, i) => {
        const locDiv = document.createElement('div');
        locDiv.className = 'location' + (i === 0 ? ' active' : '');
        locDiv.id = `location-${loc.id}`;
        locDiv.style.backgroundImage = `url('${loc.background}')`;
        // Полоска здоровья игрока
        const playerHealth = document.createElement('div');
        playerHealth.className = 'player-healthbar';
        playerHealth.innerHTML = '<span class="health-text">10 / 10</span><div class="health-bar"><div class="health-bar-inner" style="width:100%"></div></div>';
        locDiv.appendChild(playerHealth);
        // Персонаж
        const player = document.createElement('div');
        player.className = 'player';
        locDiv.appendChild(player);
        // Враг
        if (loc.hasEnemy && loc.monster) {
            const monster = monstersData.find(m => m.id === loc.monster);
            if (monster) {
                const enemyHealth = document.createElement('div');
                enemyHealth.className = 'enemy-healthbar';
                enemyHealth.innerHTML = `<span class=\"health-text\">${monster.health} / ${monster.maxHealth}</span><div class=\"health-bar\"><div class=\"health-bar-inner\" style=\"width:100%\"></div></div>`;
                locDiv.appendChild(enemyHealth);
                const enemy = document.createElement('div');
                enemy.className = 'enemy';
                enemy.style.backgroundImage = `url('${monster.image}')`;
                enemy.title = monster.name;
                locDiv.appendChild(enemy);
            }
        }
        // NPC
        if (loc.npc) {
            const npcData = npcsData.find(n => n.id === loc.npc);
            if (npcData) {
                const npc = document.createElement('div');
                npc.className = 'npc';
                npc.style.backgroundImage = `url('${npcData.image}')`;
                npc.title = npcData.name;
                npc.style.backgroundSize = 'contain';
                npc.style.backgroundRepeat = 'no-repeat';
                npc.style.cursor = 'pointer';
                npc.addEventListener('click', () => showNpcDialog(npcData, npc));
                locDiv.appendChild(npc);
            }
        }
        // Дверь выхода
        const exit = document.createElement('div');
        exit.className = 'exit-door';
        locDiv.appendChild(exit);
        // Сундук
        if (loc.hasChest) {
            const chest = document.createElement('div');
            chest.className = 'chest';
            locDiv.appendChild(chest);
        }
        // Лог боя
        const battleLog = document.createElement('div');
        battleLog.className = 'battle-log hidden';
        battleLog.id = 'battle-log';
        locDiv.appendChild(battleLog);
        locationContainer.appendChild(locDiv);
    });

    // После генерации локаций навесить обработчики на сундуки
    setupChests();

    const locations = document.querySelectorAll('.location');
    const exitDoors = document.querySelectorAll('.exit-door');
    window.currentLocation = 0;

    // Обработчики клика по дверям
    exitDoors.forEach((door, index) => {
        door.addEventListener('click', () => {
            // Проверяем, есть ли живой враг на текущей локации
            const activeLocation = locations[window.currentLocation];
            const enemyBar = activeLocation.querySelector('.enemy-healthbar .health-bar-inner');
            if (enemyBar && parseFloat(enemyBar.style.width) > 0) {
                // Враг жив, переход запрещён
                return;
            }
            if (index === window.currentLocation) {
                // Переходим к следующей локации
                window.currentLocation = (window.currentLocation + 1) % locations.length;
                // Обновляем активную локацию
                locations.forEach((location, i) => {
                    if (i === window.currentLocation) {
                        location.classList.add('active');
                    } else {
                        location.classList.remove('active');
                    }
                });
                // Показываем кнопку боя, если нужно
                if (typeof showBattleButtonIfEnemy === 'function') {
                    showBattleButtonIfEnemy();
                }
                // Автоматически запускаем бой, если есть враг
                setTimeout(() => {
                    const enemyBar = document.querySelector('.location.active .enemy-healthbar');
                    if (enemyBar) {
                        playBattleMusic();
                        if (startBattle) startBattle();
                    } else {
                        playMainMusic();
                    }
                }, 300);
            }
        });
    });

    // Предотвращаем стандартное поведение при клике на двери
    exitDoors.forEach(door => {
        door.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
    });

    // Назначаем обработчик на кнопку "Начать игру" после вставки стартового экрана
    const observeStartScreen = () => {
        const startBtn = document.getElementById('start-game-btn');
        const startScreen = document.getElementById('start-screen');
        if (startBtn && startScreen) {
            startBtn.addEventListener('click', () => {
                startScreen.style.display = 'none';
                playMainMusic();
                resetGame();
            });
        } else {
            // Если кнопка еще не появилась, пробуем снова через 100мс
            setTimeout(observeStartScreen, 100);
        }
    };
    observeStartScreen();
});

function showNpcDialog(npcData, npcElem) {
    // Удаляем старый диалог, если есть
    let oldDialog = document.getElementById('npc-dialog');
    if (oldDialog) oldDialog.remove();
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.id = 'npc-dialog';
    dialog.style.position = 'fixed';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = '#222';
    dialog.style.border = '3px solid #ffe066';
    dialog.style.borderRadius = '16px';
    dialog.style.padding = '32px 24px';
    dialog.style.zIndex = 5001;
    dialog.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    dialog.style.alignItems = 'center';
    dialog.style.minWidth = '320px';
    dialog.style.maxWidth = '90vw';
    dialog.style.color = '#ffe066';
    dialog.style.fontFamily = 'monospace';
    dialog.innerHTML = `<div style='font-size:1.3rem;margin-bottom:18px;'>${npcData.dialog.text}</div>`;
    // Кнопки вариантов ответа
    npcData.dialog.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.style.fontSize = '1.1rem';
        btn.style.margin = '8px 0';
        btn.style.padding = '10px 28px';
        btn.style.borderRadius = '8px';
        btn.style.border = '2px solid #b36b00';
        btn.style.background = '#ffe066';
        btn.style.color = '#222';
        btn.style.cursor = 'pointer';
        btn.style.fontFamily = 'monospace';
        btn.onmouseenter = () => btn.style.background = '#ffd700';
        btn.onmouseleave = () => btn.style.background = '#ffe066';
        btn.onclick = () => {
            if (opt.action === 'givePotion') {
                addItemToBackpack('potion');
                dialog.remove();
                npcElem.remove();
            } else if (opt.action === 'bye') {
                dialog.remove();
                npcElem.remove();
            }
        };
        dialog.appendChild(btn);
    });
    document.body.appendChild(dialog);
} 