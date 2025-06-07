document.addEventListener('DOMContentLoaded', () => {
  const layouts = document.querySelectorAll('.layout');

  layouts.forEach(layout => {
    layout.addEventListener('click', () => {
      const layoutNumber = layout.getAttribute('data-layout');
      // Ganti path jika file tidak bernama 'kotakX.html'
      window.location.href = `kotak${layoutNumber}.html`;
    });
  });
});
