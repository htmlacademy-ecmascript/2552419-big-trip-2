import './style.css';

console.log('Приложение "Большое путешествие" запущено!');

// Основной код приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <h1>Большое путешествие</h1>
            <p>Приложение готово к разработке!</p>
        `;
    }
});