import { PLANT_DATA } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    let userPlants = JSON.parse(localStorage.getItem('userPlants')) || [];
    let db = null;

    // 1. UIのイベント登録（DBを待たずに即座に実行）
    const setupEvents = () => {
        document.getElementById('add-plant-form').onsubmit = (e) => {
            e.preventDefault();
            userPlants.push({ id: crypto.randomUUID(), speciesId: document.getElementById('species-select').value, name: document.getElementById('plant-name').value, entryDate: new Date().toISOString().split('T')[0], waterLog: [{ date: document.getElementById('last-watered').value, type: 'WaterOnly' }] });
            localStorage.setItem('userPlants', JSON.stringify(userPlants));
            location.reload();
        };

        document.getElementById('export-data-button').onclick = () => {
            const blob = new Blob([JSON.stringify(userPlants)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'plants.json'; a.click();
        };

        document.getElementById('import-data-button').onclick = () => document.getElementById('import-file-input').click();
        document.getElementById('import-file-input').onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (re) => {
                localStorage.setItem('userPlants', re.target.result);
                location.reload();
            };
            reader.readAsText(e.target.files[0]);
        };
    };

    // 2. DB初期化
    const initDB = () => new Promise(resolve => {
        const req = indexedDB.open('HouseplantDB', 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore('images');
        req.onsuccess = (e) => { db = e.target.result; resolve(); };
    });

    // 3. アプリ起動
    setupEvents();
    initDB().then(() => {
        const sel = document.getElementById('species-select');
        PLANT_DATA.forEach(p => sel.add(new Option(p.species, p.id)));
    });
});
