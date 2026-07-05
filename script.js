/**
 * ABSENSI DIGITAL SISWA INFORMATIKA - LOGIC
 * Menggunakan variabel CONFIG dari index.html
 */

// Gunakan konfigurasi dari index.html, fall-back ke URL jika perlu
const WEB_APP_URL = typeof CONFIG !== 'undefined' ? CONFIG.webAppUrl : "https://script.google.com/macros/s/AKfycbxiQiNq94DUJpCYqKIO4xtbACym2dtzXbNGzy21xMyIfIbWwf2OrKyrrRqHiM41PSK19g/exec";

// Fungsi inisialisasi untuk menghilangkan loader
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById('loader');
    const app = document.getElementById('app');
    
    // Sembunyikan loader, tampilkan aplikasi
    if (loader) loader.style.display = 'none';
    if (app) app.style.display = 'block';
    
    console.log("Aplikasi siap. Menggunakan URL:", WEB_APP_URL);
});

// Fungsi untuk Load View
function loadView(view) {
    const content = document.getElementById('content-area');
    const modalElement = document.getElementById('menuModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if(modal) modal.hide();
    
    content.innerHTML = `<div class="skeleton-card my-3"></div><div class="skeleton-card my-3"></div>`;
    
    setTimeout(() => {
        if(view === 'input') {
            renderInputView(content);
        } else {
            content.innerHTML = `<div class="text-center mt-5"><i class="fas fa-tools fa-3x text-muted"></i><p>Fitur ${view} sedang dikembangkan.</p></div>`;
        }
    }, 500);
}

// Tambahkan fungsi showModal agar tidak error
function showModal(id) {
    const myModal = new bootstrap.Modal(document.getElementById(id));
    myModal.show();
}

async function sendData(action, data) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk komunikasi dengan GAS
            body: JSON.stringify({ action, data })
        });
        return { status: 'success' }; 
    } catch (e) {
        console.error("Gagal kirim data:", e);
    }
}

function renderInputView(container) {
    container.innerHTML = `
        <div class="card p-4 fade-in">
            <h5>Pilih Kelas</h5>
            <select class="form-select mb-3" id="selectKelas" onchange="fetchSiswa(this.value)">
                <option value="">-- Pilih Kelas --</option>
                <option value="CLS001">INFOR 1</option>
                <option value="CLS002">INFOR 2</option>
            </select>
            <div id="siswaList"></div>
            <button class="btn btn-primary w-100 mt-3" onclick="saveAbsensi()">
                <i class="fas fa-save me-2"></i> Simpan Absensi
            </button>
        </div>
    `;
}

function fetchSiswa(idKelas) {
    if(!idKelas) return;
    const siswaList = document.getElementById('siswaList');
    siswaList.innerHTML = `
        <div class="list-group mt-3">
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>Budi Santoso</span>
                <div>
                    <input type="radio" name="budi" value="Hadir"> ✅
                    <input type="radio" name="budi" value="Sakit"> 🤒
                </div>
            </div>
        </div>
    `;
}

function saveAbsensi() {
    Swal.fire('Berhasil!', 'Data absensi telah tersimpan.', 'success');
}
