import { PLANT_DATA } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    let userPlants = JSON.parse(localStorage.getItem('userPlants')) || [];
    let db = null;

    // ユーティリティ: 推奨ケア情報の取得
    const getAdvice = (speciesId) => {
        const species = PLANT_DATA.find(p => String(p.id) === String(speciesId));
        if (!species) return "データなし";
        const mnt = species.management.SPRING; // 基本情報の表示
        return `☀️光:${mnt.light} 💧水:${mnt.water} 💨葉水:${mnt.mist || '-'}`;
    };

    // 1. UIのイベント登録（DBを待たずに即時実行）
    const setupEvents = () => {
        document.getElementById('add-plant-form').onsubmit = (e) => {
            e.preventDefault();
            userPlants.push({ 
                id: crypto.randomUUID(), 
                speciesId: document.getElementById('species-select').value, 
                name: document.getElementById('plant-name').value, 
                entryDate: new Date().toISOString().split('T')[0], 
                waterLog: [{ date: document.getElementById('last-watered').value, type: 'WaterOnly' }] 
            });
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
        req.onerror = () => resolve();
    });

    // 3. レンダリング
    const renderList = () => {
        const list = document.getElementById('plant-card-list');
        if (!list) return;
        list.innerHTML = userPlants.map(p => `
            <div class="plant-card">
                <h3>${p.name}</h3>
                <p>${getAdvice(p.speciesId)}</p>
            </div>
        `).join('');
    };

    // アプリ起動
    setupEvents();
    initDB().then(() => {
        const sel = document.getElementById('species-select');
        if(sel) PLANT_DATA.forEach(p => sel.add(new Option(p.species, p.id)));
        renderList();
    });
});
