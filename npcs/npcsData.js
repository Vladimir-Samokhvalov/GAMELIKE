export const npcsData = [
  {
    id: 'healer',
    name: 'Целитель',
    image: 'images/npc_healer.png',
    dialog: {
      text: 'Хочешь ли ты быть здоровым?',
      options: [
        {
          text: 'Да',
          action: 'givePotion'
        },
        {
          text: 'Нет',
          action: 'bye'
        }
      ]
    }
  }
]; 