// script.js (module) - Komentar realtime ke Firebase (root: "komentar")
// Panggil di HTML: <script type="module" src="script.js"></script>

// ------------------- Firebase imports -------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// ------------------- Firebase config -------------------
const firebaseConfig = {
  apiKey: "AIzaSyD6RAnjcCki0ti3CymbHFVtXudIFsFayP0",
  authDomain: "dusun-sebangkang.firebaseapp.com",
  databaseURL: "https://dusun-sebangkang-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dusun-sebangkang",
  storageBucket: "dusun-sebangkang.firebasestorage.app",
  messagingSenderId: "740252061591",
  appId: "1:740252061591:web:73abbbf1270b9ef0867ed2",
  measurementId: "G-BTGZ13YV7N"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootRef = ref(db, "komentar");

// ------------------- Utility Functions -------------------
function escapeHTML(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
  return `<div class="komentar-avatar" style="background:${warna}">${escapeHTML(huruf)}</div>`;
}

// ============================================================================
// ========================  MAIN DOM READY CODE  =============================
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {

  // ===== MENU BURGER (Mobile Navigation) =====
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  // ===== DROPDOWN MENU =====
  document.querySelectorAll(".dropbtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdownContent = btn.nextElementSibling;
      document.querySelectorAll(".dropdown-content").forEach((dc) => {
        if (dc !== dropdownContent) dc.classList.remove("show");
      });
      dropdownContent.classList.toggle("show");
    });
  });

  // Tutup dropdown kalau klik di luar area
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown") && !e.target.classList.contains("dropbtn")) {
      document.querySelectorAll(".dropdown-content").forEach(dc => dc.classList.remove("show"));
    }
  });

  // ===== SCROLL REVEAL ANIMATION =====
  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;
    reveals.forEach((el) => {
      const revealTop = el.getBoundingClientRect().top;
      const revealBottom = el.getBoundingClientRect().bottom;
      if (revealTop < windowHeight - 100 && revealBottom > 0) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);

  // ======================== KOMENTAR FIREBASE ========================
  const namaEl = document.getElementById("nama");
  const pesanEl = document.getElementById("pesan");
  const kirimBtn = document.getElementById("kirimKomentar");
  const daftarKomentar = document.getElementById("daftarKomentar");
  if (!daftarKomentar) return; // Jika tidak ada area komentar, keluar

  const userIdKey = "userId";
  const userId = localStorage.getItem(userIdKey) || crypto.randomUUID();
  localStorage.setItem(userIdKey, userId);

  async function tambahKomentarDB(nama, pesan) {
    const newRef = push(rootRef);
    const data = { id: newRef.key, userId, nama, pesan, waktu: Date.now() };
    await set(newRef, data);
  }

  async function tambahBalasanDB(parentId, nama, pesan) {
    if (!parentId) return;
    const repliesRef = ref(db, `komentar/${parentId}/replies`);
    const newRef = push(repliesRef);
    const data = { id: newRef.key, userId, nama, pesan, waktu: Date.now() };
    await set(newRef, data);
  }

  async function editKomentarDB(id, pesanBaru, parentId = null) {
    const path = parentId
      ? `komentar/${parentId}/replies/${id}`
      : `komentar/${id}`;
    return update(ref(db, path), { pesan: pesanBaru });
  }

  async function hapusKomentarDB(id, parentId = null) {
    const path = parentId
      ? `komentar/${parentId}/replies/${id}`
      : `komentar/${id}`;
    return remove(ref(db, path));
  }

  function renderAll(snapshotVal) {
    daftarKomentar.innerHTML = "";
    if (!snapshotVal) {
      daftarKomentar.innerHTML = "<p>Belum ada komentar.</p>";
      return;
    }
    const roots = Object.entries(snapshotVal)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a,b) => (a.waktu || 0) - (b.waktu || 0));
    roots.forEach(node => daftarKomentar.appendChild(renderNode(node, 0)));
  }

  function renderNode(node, level = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "komentar-item";
    wrapper.style.marginLeft = `${level * 30}px`;
    const waktuStr = node.waktu ? new Date(node.waktu).toLocaleString("id-ID") : "";
    wrapper.innerHTML = `
      ${buatAvatar(node.nama)}
      <div class="komentar-body">
        <strong>${escapeHTML(node.nama)}</strong>
        <p>${escapeHTML(node.pesan)}</p>
        <small>${escapeHTML(waktuStr)}</small>
        <div class="komentar-actions">
          <button class="replyBtn">💬 Balas</button>
          ${node.userId === userId ? `
            <button class="editBtn">✏️ Edit</button>
            <button class="hapusBtn">🗑️ Hapus</button>` : ""}
        </div>
        <div class="balasan"></div>
      </div>
    `;

    wrapper.querySelector(".replyBtn").addEventListener("click", () => showReplyPopup(node.key, node.nama));
    if (node.userId === userId) {
      wrapper.querySelector(".editBtn").addEventListener("click", () => showEditPopup(node.key, null, node.pesan));
      wrapper.querySelector(".hapusBtn").addEventListener("click", () => showDeleteConfirm(node.key, null));
    }

    if (node.replies) {
      const repliesArr = Object.entries(node.replies)
        .map(([k,v]) => ({ key:k, ...v }))
        .sort((a,b) => (a.waktu||0) - (b.waktu||0));
      const balasanContainer = wrapper.querySelector(".balasan");
      repliesArr.forEach(reply => balasanContainer.appendChild(renderReplyNode(reply, 1, node.key)));
    }

    setTimeout(() => wrapper.classList.add("show"), 80);
    return wrapper;
  }

  function renderReplyNode(reply, level = 1, parentId) {
    const wrapper = document.createElement("div");
    wrapper.className = "reply-item";
    wrapper.style.marginLeft = `${level * 30}px`;
    const waktuStr = reply.waktu ? new Date(reply.waktu).toLocaleString("id-ID") : "";
    wrapper.innerHTML = `
      ${buatAvatar(reply.nama)}
      <div style="flex:1">
        <strong>${escapeHTML(reply.nama)}</strong>
        <p>${escapeHTML(reply.pesan)}</p>
        <small>${escapeHTML(waktuStr)}</small>
        <div class="komentar-actions">
          ${reply.userId === userId ? `
            <button class="editReplyBtn">✏️ Edit</button>
            <button class="hapusReplyBtn">🗑️ Hapus</button>` : ""}
        </div>
      </div>
    `;
    if (reply.userId === userId) {
      wrapper.querySelector(".editReplyBtn").addEventListener("click", () => showEditPopup(reply.key, parentId, reply.pesan));
      wrapper.querySelector(".hapusReplyBtn").addEventListener("click", () => showDeleteConfirm(reply.key, parentId));
    }
    setTimeout(() => wrapper.classList.add("show"), 80);
    return wrapper;
  }

  // =================== POPUP ===================
  function showReplyPopup(parentId, parentNama) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
      <div class="popup-box">
        <h3>Balas Komentar dari <b>${escapeHTML(parentNama)}</b></h3>
        <input id="replyNama" type="text" placeholder="Nama Anda (opsional)">
        <textarea id="replyText" placeholder="Tulis balasan..."></textarea>
        <div class="popup-buttons">
          <button id="sendReply">Kirim</button>
          <button id="cancelReply">Batal</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#sendReply").addEventListener("click", async () => {
      const replyNama = overlay.querySelector("#replyNama").value.trim();
      const text = overlay.querySelector("#replyText").value.trim();
      if (!text) return showNotif("Isi balasan dulu!", "#e67e22");
      const finalNama = replyNama || (namaEl && namaEl.value.trim()) || "Anonim";
      try { await tambahBalasanDB(parentId, finalNama, text); showNotif("Balasan dikirim!"); overlay.remove(); }
      catch { showNotif("Gagal kirim balasan", "#e74c3c"); }
    });
    overlay.querySelector("#cancelReply").addEventListener("click", () => overlay.remove());
  }

  function showEditPopup(itemId, parentId, oldPesan) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
      <div class="popup-box">
        <h3>Edit Komentar</h3>
        <textarea id="editText">${escapeHTML(oldPesan)}</textarea>
        <div class="popup-buttons">
          <button id="saveEdit">Simpan</button>
          <button id="cancelEdit">Batal</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#saveEdit").addEventListener("click", async () => {
      const newText = overlay.querySelector("#editText").value.trim();
      if (!newText) return showNotif("Isi komentar baru!", "#e67e22");
      try { await editKomentarDB(itemId, newText, parentId); showNotif("Komentar diedit!"); overlay.remove(); }
      catch { showNotif("Gagal edit komentar", "#e74c3c"); }
    });
    overlay.querySelector("#cancelEdit").addEventListener("click", () => overlay.remove());
  }

  function showDeleteConfirm(itemId, parentId) {
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
    overlay.querySelector("#confirmDelete").addEventListener("click", async () => {
      try { await hapusKomentarDB(itemId, parentId); showNotif("Komentar dihapus!", "#e74c3c"); overlay.remove(); }
      catch { showNotif("Gagal hapus komentar", "#e74c3c"); }
    });
    overlay.querySelector("#cancelDelete").addEventListener("click", () => overlay.remove());
  }

  // =================== REALTIME FIREBASE LISTENER ===================
  onValue(rootRef, (snapshot) => renderAll(snapshot.val()), (err) => console.error(err));

  // =================== KIRIM KOMENTAR BARU ===================
  kirimBtn?.addEventListener("click", async () => {
    const namaVal = namaEl.value.trim();
    const pesanVal = pesanEl.value.trim();
    if (!namaVal || !pesanVal) return showNotif("Isi semua kolom!", "#e67e22");
    try {
      await tambahKomentarDB(namaVal, pesanVal);
      namaEl.value = ""; pesanEl.value = "";
      showNotif("Komentar dikirim!");
    } catch { showNotif("Gagal kirim komentar", "#e74c3c"); }
  });

}); // END DOMContentLoaded
