const imageContainer = document.getElementById('requiredImage');
const img = document.createElement('img');
if (year.slice(0,3) > 114 || year.slice(0,3) < 110) {
  alert(`${year.slice(0,3)}年度未收錄`);
}
img.src = `${year.slice(0,3)}必修科目表.png`;
img.alt = `${year}必修科目表`;
imageContainer.appendChild(img);