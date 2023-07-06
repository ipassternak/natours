export const hideAlert = () => {  
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const displayAlert = (type, msg, timeout = 5000) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, timeout);
};
