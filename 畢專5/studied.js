document.getElementById('requiredCourseBtn').addEventListener('click', () => {
  window.location.href = withParams('studied-required.html');
});

document.getElementById('electiveCourseBtn').addEventListener('click', () => {
  window.location.href = withParams('studied-elective.html');
});

document.getElementById('generalCourseBtn').addEventListener('click', () => {
  window.location.href = withParams('studied-general.html');
});
