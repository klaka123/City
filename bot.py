import asyncio
import json
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

# --- Настройки ---
BOT_TOKEN = "ТОКЕН_ТВОЕГО_БОТА"  # Вставь свой токен от BotFather
WEBAPP_URL = "https://ТВОЙ_АДРЕС_НА_GITHUB/index.html"  # Ссылка на твой сайт с игрой

logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Простое хранилище данных игроков (в реальности нужна База Данных)
# Ключ: user_id, значение: словарь с данными
user_data = {}

# --- Команда /start ---
@dp.message(Command("start"))
async def cmd_start(message: Message):
    user_id = str(message.from_user.id)
    if user_id not in user_data:
        user_data[user_id] = {"balance": 100, "buildings": []}
    
    await message.answer(
        f"Привет, {message.from_user.first_name}! 👋\n"
        "Это игра про строительство городка. Нажми кнопку ниже, чтобы начать.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🏘️ Открыть игру", web_app=WebAppInfo(url=WEBAPP_URL))]
            ]
        )
    )

# --- Команда для просмотра статистики (опционально) ---
@dp.message(Command("stats"))
async def cmd_stats(message: Message):
    user_id = str(message.from_user.id)
    data = user_data.get(user_id, {"balance": 0, "buildings": []})
    await message.answer(
        f"📊 Твоя статистика:\n"
        f"💰 Баланс: {data['balance']}\n"
        f"🏠 Построек: {len(data['buildings'])}"
    )

# --- Обработка данных из WebApp ---
@dp.message()
async def handle_webapp_data(message: Message):
    """
    Эта функция ловит данные, которые прислала игра (tg.sendData).
    Данные приходят в message.web_app_data
    """
    if message.web_app_data:
        user_id = str(message.from_user.id)
        data = json.loads(message.web_app_data.data)
        
        # Инициализация пользователя, если его нет
        if user_id not in user_data:
            user_data[user_id] = {"balance": 100, "buildings": []}
        
        # Обработка действий из игры
        action = data.get('action')
        
        if action == 'build':
            # Игрок построил здание
            building_type = data.get('type')
            new_balance = data.get('balance')
            buildings_count = data.get('buildingsCount')
            
            # Обновляем данные пользователя
            user_data[user_id]['balance'] = new_balance
            # В реальности нужно синхронизировать список зданий,
            # но для простоты мы просто положим туда заглушку
            user_data[user_id]['buildings'] = [{"type": "house"} for _ in range(buildings_count)]
            
            await message.answer(f"✅ Постройка сохранена! Теперь у тебя {buildings_count} зданий.")
            
        elif action == 'tax':
            # Игрок собрал налог
            tax_amount = data.get('tax')
            new_balance = data.get('balance')
            user_data[user_id]['balance'] = new_balance
            
            await message.answer(f"💰 Налог собран! +{tax_amount} монет.")
        
        # Отправляем подтверждение (опционально)
        await message.answer("✅ Прогресс сохранен!")
    else:
        await message.answer("Пожалуйста, используй кнопку 'Открыть игру'.")

# --- Запуск бота ---
async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
