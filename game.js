import { startBattle } from './battle.js';
import { resetGame } from './start/gameReset.js';
import { playMainMusic, playBattleMusic, stopAllMusic } from './music/music.js';

document.addEventListener('DOMContentLoaded', () => {
    const locations = document.querySelectorAll('.location');
    const exitDoors = document.querySelectorAll('.exit-door');
    window.currentLocation = 0;
    const backpackIcon = document.getElementById('backpack-icon');
    const backpackModal = document.getElementById('backpack-modal');

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

    if (backpackIcon && backpackModal) {
        backpackIcon.addEventListener('click', () => {
            backpackModal.classList.toggle('hidden');
        });
    }

    // ESC закрывает рюкзак
    document.addEventListener('keydown', (e) => {
        if (backpackModal && e.key === 'Escape') {
            backpackModal.classList.add('hidden');
        }
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