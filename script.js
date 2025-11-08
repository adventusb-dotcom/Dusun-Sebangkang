// === Menu burger untuk HP ===
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });
}

// === Scroll Reveal Animation ===
const reveals = document.querySelectorAll('.reveal');
function revealOnScroll() {
  const windowHeight = window.innerHeight;
  reveals.forEach((el) => {
    const revealTop = el.getBoundingClientRect().top;
    const revealBottom = el.getBoundingClientRect().bottom;
    if (revealTop < windowHeight - 100 && revealBottom > 0) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// === Dropdown toggle ===
document.querySelectorAll('.dropbtn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdownContent = btn.nextElementSibling;
    document.querySelectorAll('.dropdown-content').forEach(dc => {
      if (dc !== dropdownContent) dc.classList.remove('show');
    });
    dropdownContent.classList.toggle('show');
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-content').forEach(dc => dc.classList.remove('show'));
  }
});

// === KOMENTAR SISTEM DENGAN REPLY, AVATAR WARNA, EDIT, HAPUS ===
document.addEventListener("DOMContentLoaded", () => {
  const nama = document.getElementById("nama");
  const pesan = document.getElementById("pesan");
  const kirimBtn = document.getElementById("kirimKomentar");
  const daftarKomentar = document.getElementById("daftarKomentar");
  if (!daftarKomentar) return;

  let komentarList = JSON.parse(localStorage.getItem("komentarList") || "[]");
  const userId = localStorage.getItem("userId") || crypto.randomUUID();
  localStorage.setItem("userId", userId);

  function saveKomentar() {
    localStorage.setItem("komentarList", JSON.stringify(komentarList));
  }

  // === Notifikasi halus ===
  function showNotif(teks, warna = "#4CAF50") {
    const notif = document.createElement("div");
    notif.className = "notif-popup";
    notif.style.background = warna;
    notif.textContent = teks;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add("show"), 100);
    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 400);
    }, 2500);
  }

  // === Fungsi Avatar Warna Berdasarkan Huruf A–Z ===
  function buatAvatar(nama) {
    const huruf = nama ? nama.charAt(0).toUpperCase() : "?";
    const warnaHuruf = {
      A:"#FF6B6B",B:"#FF8E53",C:"#FFD93D",D:"#6BCB77",E:"#4D96FF",
      F:"#845EC2",G:"#D65DB1",H:"#FF9671",I:"#FFC75F",J:"#F9F871",
      K:"#00C9A7",L:"#845EC2",M:"#FF8066",N:"#00B8A9",O:"#F76C6C",
      P:"#F9ED69",Q:"#C34A36",R:"#3E8E7E",S:"#6A0572",T:"#F5A962",
      U:"#00909E",V:"#E40017",W:"#3AB0FF",X:"#FC5404",Y:"#A23B72",Z:"#2EC1AC"
    };
    const warna = warnaHuruf[huruf] || "#6AB04C";
    return `<div class="komentar-avatar" style="background:${warna}">${huruf}</div>`;
  }

  // === Render Komentar & Balasan (Rekursif) ===
  function renderKomentar(list, parentEl, level = 0) {
    parentEl.innerHTML = "";
    list.forEach((data) => {
      if (!data || !data.nama) return;

      const div = document.createElement("div");
      div.classList.add("komentar-item");
      div.style.marginLeft = `${level * 30}px`;

      div.innerHTML = `
        ${buatAvatar(data.nama)}
        <div class="komentar-body">
          <strong>${data.nama}</strong>
          <p>${data.pesan}</p>
          <small>${data.waktu}</small>
          <div class="komentar-actions">
            <button class="replyBtn">💬 Balas</button>
            ${data.userId === userId ? `
              <button class="editBtn">✏️ Edit</button>
              <button class="hapusBtn">🗑️ Hapus</button>` : ""}
          </div>
          <div class="balasan"></div>
        </div>
      `;
      parentEl.appendChild(div);
      const replyContainer = div.querySelector(".balasan");

      // === BALAS KOMENTAR (dengan popup nama) ===
      const replyBtn = div.querySelector(".replyBtn");
      replyBtn.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        overlay.innerHTML = `
          <div class="popup-box">
            <h3>Balas Komentar dari <b>${data.nama}</b></h3>
            <input id="replyNama" type="text" placeholder="Masukkan nama Anda (opsional)" 
                   style="width:100%;padding:8px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;font-family:'Poppins',sans-serif;">
            <textarea id="replyText" placeholder="Tulis balasan..." 
                      style="width:100%;height:100px;border-radius:6px;border:1px solid #ccc;padding:10px;"></textarea>
            <div class="popup-buttons">
              <button id="sendReply">Kirim</button>
              <button id="cancelReply">Batal</button>
            </div>
          </div>`;
        document.body.appendChild(overlay);

        overlay.querySelector("#sendReply").addEventListener("click", () => {
          const replyNama = overlay.querySelector("#replyNama").value.trim();
          const text = overlay.querySelector("#replyText").value.trim();
          if (text) {
            const balasan = {
              id: crypto.randomUUID(),
              userId,
              nama: replyNama || nama.value.trim() || "Anonim",
              pesan: text,
              waktu: new Date().toLocaleString("id-ID"),
              replies: []
            };
            data.replies = data.replies || [];
            data.replies.push(balasan);
            saveKomentar();
            tampilkanKomentar();
            showNotif("Balasan dikirim!");
            overlay.remove();
          }
        });
        overlay.querySelector("#cancelReply").addEventListener("click", () => overlay.remove());
      });

      // === EDIT KOMENTAR ===
      const editBtn = div.querySelector(".editBtn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.className = "popup-overlay";
          overlay.innerHTML = `
            <div class="popup-box">
              <h3>Edit Komentar</h3>
              <textarea id="editText">${data.pesan}</textarea>
              <div class="popup-buttons">
                <button id="saveEdit">Simpan</button>
                <button id="cancelEdit">Batal</button>
              </div>
            </div>`;
          document.body.appendChild(overlay);

          overlay.querySelector("#saveEdit").addEventListener("click", () => {
            const newText = overlay.querySelector("#editText").value.trim();
            if (newText) {
              data.pesan = newText;
              saveKomentar();
              tampilkanKomentar();
              showNotif("Komentar berhasil diedit!");
              overlay.remove();
            }
          });
          overlay.querySelector("#cancelEdit").addEventListener("click", () => overlay.remove());
        });
      }

      // === HAPUS KOMENTAR ===
      const hapusBtn = div.querySelector(".hapusBtn");
      if (hapusBtn) {
        hapusBtn.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.className = "popup-overlay";
          overlay.innerHTML = `
            <div class="popup-box">
              <h3>Hapus komentar ini?</h3>
              <div class="popup-buttons">
                <button id="confirmDelete">Hapus</button>
                <button id="cancelDelete">Batal</button>
              </div>
            </div>`;
          document.body.appendChild(overlay);

          overlay.querySelector("#confirmDelete").addEventListener("click", () => {
            list.splice(list.indexOf(data), 1);
            saveKomentar();
            tampilkanKomentar();
            showNotif("Komentar dihapus!", "#e74c3c");
            overlay.remove();
          });
          overlay.querySelector("#cancelDelete").addEventListener("click", () => overlay.remove());
        });
      }

      // === Render balasan anak ===
      if (data.replies && data.replies.length) {
        renderKomentar(data.replies, replyContainer, level + 1);
      }

      setTimeout(() => div.classList.add("show"), 100);
    });
  }

  function tampilkanKomentar() {
    renderKomentar(komentarList, daftarKomentar);
  }

  // === Kirim komentar baru ===
  kirimBtn.addEventListener("click", () => {
    const namaVal = nama.value.trim();
    const pesanVal = pesan.value.trim();
    if (!namaVal || !pesanVal) {
      showNotif("Isi semua kolom!", "#e67e22");
      return;
    }

    const komentarBaru = {
      id: crypto.randomUUID(),
      userId,
      nama: namaVal,
      pesan: pesanVal,
      waktu: new Date().toLocaleString("id-ID"),
      replies: []
    };

    komentarList.push(komentarBaru);
    saveKomentar();
    tampilkanKomentar();
    nama.value = "";
    pesan.value = "";
    showNotif("Komentar berhasil dikirim!");
  });

  tampilkanKomentar();
});
