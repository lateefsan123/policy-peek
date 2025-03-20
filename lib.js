function _$(e) {
  return document.querySelector(e);
}
function _$$(e) {
  return document.querySelectorAll(e);
}

function get(key) {
  return localStorage.getItem(key) || "";
}
function set(key, value) {
  localStorage.setItem(key, value);
}
