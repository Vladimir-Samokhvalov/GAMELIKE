export function resetGame() {
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
} 