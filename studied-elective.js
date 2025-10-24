// 一次性動作區 =============================================================================================================

const storageKey = `required_${studentId}`;
const typeSelect = document.getElementById('typeSelect');
const categorySelect = document.getElementById('categorySelect');
let courses = [];

const sdKey = `sd_courses_${studentId}`;
const internalKey = `elective_internal_${studentId}`;
const externalKey = `elective_external_${studentId}`;

const internalList = document.getElementById('internalCourseList');
const externalList = document.getElementById('externalCourseList');

document.getElementById('studentIdDisplay').textContent = studentId;		// 顯示學號
loadCSV();									// 讀取資料
loadCourses(internalKey, internalList);
loadCourses(externalKey, externalList);

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

categorySelect.addEventListener('change', updateCategoryDisplay);		// 更改子項目時觸發

window.addEventListener('DOMContentLoaded', () => {				// 載入視窗時觸發：根據tab參數跳轉子項目選單
  const tab = params.get('tab');
  if (tab) {
    typeSelect.value = '選修';
    categorySelect.value = tab;
  } 
  updateCategoryDisplay();
});

document.getElementById('addInternalBtn').onclick = () => {			// 輸入系內選修時觸發
  const internalName = document.getElementById('internalCourseName');	
  const internalCredits = document.getElementById('internalCourseCredits');
  const n = internalName.value.trim(), c = internalCredits.value.trim();
  if (!n || !c) return alert('請輸入完整資訊');

  const li = document.createElement('li');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'course-name';
  nameSpan.textContent = n;

  const creditsSpan = document.createElement('span');
  creditsSpan.className = 'course-credits';
  creditsSpan.textContent = `${c}學分`;

  const del = document.createElement('button');
  del.textContent = '刪除';
  del.onclick = () => { 
    li.remove(); saveCourses(internalKey, internalList); 
  };

  li.appendChild(nameSpan);
  li.appendChild(creditsSpan);
  li.appendChild(del);

  internalList.appendChild(li);
  internalName.value = ''; internalCredits.value = '';
  saveCourses(internalKey, internalList);
};

document.getElementById('addExternalBtn').onclick = () => {			// 輸入系外選修時觸發
  const externalName = document.getElementById('externalCourseName');
  const externalCredits = document.getElementById('externalCourseCredits');
  const n = externalName.value.trim(), c = externalCredits.value.trim();
  if (!n || !c) return alert('請輸入完整資訊');

  const li = document.createElement('li');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'course-name';
  nameSpan.textContent = n;

  const creditsSpan = document.createElement('span');
  creditsSpan.className = 'course-credits';
  creditsSpan.textContent = `${c}學分`;

  const del = document.createElement('button');
  del.textContent = '刪除';
  del.onclick = () => { 
    li.remove(); saveCourses(externalKey, externalList); 
  };

  li.appendChild(nameSpan);
  li.appendChild(creditsSpan);
  li.appendChild(del);

  externalList.appendChild(li);
  externalName.value = ''; externalCredits.value = '';
  saveCourses(externalKey, externalList);
};

// 函數定義 ===============================================================================================================

function updateCategoryDisplay() {	// 切換子項目
  const internalSection = document.getElementById('internalSection');
  const externalSection = document.getElementById('externalSection');
  if (categorySelect.value === '系內選修') {
    internalSection.style.display = 'flex';
    externalSection.style.display = 'none';
  } else {
    internalSection.style.display = 'none';
    externalSection.style.display = 'flex';
  }
}

async function loadCSV() {		// 讀取CSV資料
  const res = await fetch('database.csv');
  const text = await res.text();
  const lines = text.split('\n').slice(2);
  courses = lines.map(line => {
    const [CNO, SNO, CTITLE, CID, CREDIT] = line.split(',');
    if (SNO === 'SD') 
      return { name: CTITLE, credits: Number(CREDIT) };
    return null;
  }).filter(Boolean);
  renderTable(courses);
}
	
function loadCourses(key, listEl) {	// 讀取本地手動輸入資料
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.forEach(c => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'course-name';
    nameSpan.textContent = c.name;

    const creditsSpan = document.createElement('span');
    creditsSpan.className = 'course-credits';
    creditsSpan.textContent = `${c.credits}學分`;

    const del = document.createElement('button');
    del.textContent = '刪除';
    del.onclick = () => { 
      li.remove(); saveCourses(key, listEl); 
    };

    li.appendChild(nameSpan);
    li.appendChild(creditsSpan);
    li.appendChild(del);

    listEl.appendChild(li); 
  });
}

function saveSelection() {		// 本地記錄表格資料
  const data = [];
  document.querySelectorAll('#courseTableBody input:checked').forEach(cb => {
    data.push({ name: cb.dataset.name, credits: Number(cb.dataset.credits) });
  });
  localStorage.setItem(sdKey, JSON.stringify(data));
}

function saveCourses(key, listEl) {	// 本地記錄手動輸入資料
  const data = [];
  listEl.querySelectorAll('li').forEach(li => {
    const name = li.childNodes[0].textContent.trim();
    const creditsText = li.childNodes[1].textContent.trim();
    const match = creditsText.match(/(\d+)學分/);
    if (match) 
      data.push({ name, credits: Number(match[1]) });
  });
  localStorage.setItem(key, JSON.stringify(data));
}

function renderTable() {		// 渲染表格
  const tbody = document.getElementById('courseTableBody');
  tbody.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem(sdKey) || '[]');
  courses.forEach(c => {
    const checked = saved.some(s => s.name === c.name);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" data-name="${c.name}" data-credits="${c.credits}" ${checked ? 'checked' : ''}></td>
                    <td>${c.name}</td><td>${c.credits}</td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', saveSelection));
}