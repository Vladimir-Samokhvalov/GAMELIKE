import { itemData } from './itemData.js';

export function useSword(target) {
    // Меч наносит 2 урона
    target.health = Math.max(0, target.health - itemData.sword.damage);
}

export function useShield(player, damage) {
    // Щит уменьшает урон на 1
    return Math.max(0, damage - itemData.shield.block);
}

export function usePotion(player, backpack) {
    // Зелье: если здоровье 2 или меньше, полностью лечит и удаляется из рюкзака
    if (player.health <= itemData.potion.triggerHealth) {
        player.health = player.maxHealth;
        // Удаляем зелье из рюкзака
        const idx = backpack.findIndex(item => item === 'potion');
        if (idx !== -1) backpack.splice(idx, 1);
        return true;
    }
    return false;
} 