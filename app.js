// app.js
import { PLANT_DATA } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    // データ管理用ローカルストレージ
    let userPlants = JSON.parse(localStorage.getItem('userPlants')) || [];
    let db = null;

    // --- 1. UIイベント登録（DBを待たずに即時実行） ---
    // これにより、DB接続に時間がかかってもボタンが反応しないことはなくなります
    const setupEvents = () => {
        const form = document.getElementById('add-plant-form');
        if (form) {
            form.onsubmit = (e) => {
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
        }

        const exportBtn = document.getElementById('export-data-button');
        if (exportBtn) {
            exportBtn.onclick = () => {
                const blob = new Blob([JSON.stringify(userPlants)], { type: 'application/json' });
                const a = document.createElement('a'); 
                a.href = URL.createObjectURL(blob); 
                a.download = 'plants.json'; 
                a.click();
            };
        }

        const importBtn = document.getElementById('import-data-button');
        const importInput = document.getElementById('import-file-input');
        if (importBtn && importInput) {
            importBtn.onclick = () => importInput.click();
            importInput.onchange = (e) => {
                if (!e.target.files[0]) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                    localStorage.setItem('userPlants', re.target.result);
                    location.reload();
                };
                reader.readAsText(e.target.files[0]);
            };
        }
    };

    // --- 2. データベース初期化 ---
    // 失敗してもアプリを停止させない設計
    const initDB = () => new Promise(resolve => {
        try {
            const req = indexedDB.open('HouseplantDB', 1);
            req.onupgradeneeded = (e) => e.target.result.createObjectStore('images');
            req.onsuccess = (e) => { db = e.target.result; resolve(); };
            req.onerror = () => { console.warn("DB利用不可"); resolve(); };
        } catch (err) {
            console.warn("DB未対応環境");
            resolve();
        }
    });

    // --- 3. アプリ起動 ---
    setupEvents(); // UIは即座に反応するようにする
    
    initDB().then(() => {
        // 植物種リストの表示
        const sel = document.getElementById('species-select');
        if (sel) {
            PLANT_DATA.forEach(p => sel.add(new Option(p.species, p.id)));
        }
        
        // ここでリスト表示などの処理を行う
        console.log("アプリ準備完了");
    });
});
