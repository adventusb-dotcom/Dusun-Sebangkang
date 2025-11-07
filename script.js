// === Menu burger untuk HP ===
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});

// === Scroll Reveal Animation ===
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach((el, index) => {
    const revealTop = el.getBoundingClientRect().top;
    const revealBottom = el.getBoundingClientRect().bottom;

    if (revealTop < windowHeight - 100 && revealBottom > 0) {
      el.classList.add('active');
      el.classList.add(`delay-${(index % 2) + 1}`);
    } else {
      el.classList.remove('active');
      el.classList.remove(`delay-${(index % 4) + 1}`);
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


// === Dropdown toggle (klik untuk buka/tutup di semua layar) ===
document.querySelectorAll('.dropbtn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdownContent = btn.nextElementSibling;

    // Tutup dropdown lain biar gak numpuk
    document.querySelectorAll('.dropdown-content').forEach(dc => {
      if (dc !== dropdownContent) dc.classList.remove('show');
    });

    dropdownContent.classList.toggle('show');
  });
});

// Tutup dropdown kalau klik di luar
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-content').forEach(dc => dc.classList.remove('show'));
  }
});
