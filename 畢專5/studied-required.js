// 一次性動作區 =============================================================================================================

const storageKey = `required_${studentId}`;
const typeSelect = document.getElementById('typeSelect');
const categorySelect = document.getElementById('categorySelect');
let courses = [];

document.getElementById('studentIdDisplay').textContent = studentId;		// 顯示學號
loadCSV();									// 讀取資料

// 監測區 ================================================================================================================

typeSelect.addEventListener('change', function() {				// 更改必修/選修/通識時觸發
  const value = this.value;
  if (value === '必修') 
    window.location.href = withParams('studied-required.html');
  if (value === '選修') 
    window.location.href = withParams('studied-elective.html');
  if (value === '通識') 
    window.location.href = withParams('studied-general.html');
});

categorySelect.addEventListener('change', renderTable);				// 更改子項目時觸發

window.addEventListener('DOMContentLoaded', () => {				// 載入視窗時觸發：根據tab參數跳轉子項目選單
  const urlParams = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab) {
    typeSelect.value = '必修';
    categorySelect.value = tab;
  } 
  renderTable();
});

// 函數定義 ===============================================================================================================

async function loadCSV() {	// 讀取CSV資料
  const res = await fetch('database.csv');
  const text = await res.text();
  const lines = text.split('\n').slice(2);
  courses = lines.map(line => {
    const [CNO,SNO,CTITLE,CID,CREDIT] = line.split(',');
    if (!SNO) return null;
    let category = '';
    if (SNO === 'RD') category = '系必修';
    else if (SNO.startsWith('RG')) {
      if (group === '行銷與數位經營組' && SNO === 'RG-M') category = '組必修';
      if (group === '服務創新與創業組' && SNO === 'RG-S') category = '組必修';
    }
    else if (SNO === 'RS') category = '基礎課程';
    if (!category) return null;
    return { name: CTITLE, credits: Number(CREDIT), type: '必修', category };
  }).filter(Boolean);
  renderTable();
}

function saveSelection() {	// 本地記錄資料
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const currentCategory = categorySelect.value;
  const filtered = saved.filter(item => item.category !== currentCategory);
  const selected = [];
  document.querySelectorAll('#courseTableBody input[type="checkbox"]:checked').forEach(cb => {
    selected.push({ name: cb.dataset.name, credits: Number(cb.dataset.credits), category: cb.dataset.category });
  });
  const newData = [...filtered, ...selected];
  localStorage.setItem(storageKey, JSON.stringify(newData));
}

function renderTable() {	// 渲染表格
  const tbody = document.getElementById('courseTableBody');
  tbody.innerHTML = '';
  const type = typeSelect.value;
  const category = categorySelect.value;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  courses.filter(c => c.type === type && c.category === category).forEach(c => {
    const isChecked = saved.some(item => item.name === c.name && item.category === c.category);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox"
                 data-name="${c.name}"
                 data-credits="${c.credits}"
                 data-category="${c.category}"
                 ${isChecked ? 'checked' : ''}></td>
      <td>${c.name}</td>
      <td>${c.credits}</td>
    `;
    tbody.appendChild(row);
  });
  tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveSelection);
  });
}