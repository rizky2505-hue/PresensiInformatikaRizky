/**
 * ABSENSI DIGITAL SISWA INFORMATIKA - LOGIC
 * Menggunakan Fetch API untuk komunikasi dengan Google Apps Script
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwyZRoGB_RqZ9aLxLGJm4Qn13ixRW8lnN7gYdTy7aLfje6_IT6W9ehrGlcFctrUicOu7w/exec"; // Ganti dengan URL Web App Anda

// Fungsi untuk Load View
function loadView(view) {
    const content = document.getElementById('content-area');
    document.getElementById('menuModal').querySelector('.btn-close')?.click(); // Tutup modal
    
    // Skeleton loader sebelum memuat konten
    content.innerHTML = `<div class="skeleton-card my-3"></div><div class="skeleton-card my-3"></div>`;
    
    // Simulasi loading content berdasarkan menu
    setTimeout(() => {
        if(view === 'input') {
            renderInputView(content);
        } else {
            content.innerHTML = `<div class="text-center mt-5"><i class="fas fa-tools fa-3x text-muted"></i><p>Fitur ${view} sedang dikembangkan.</p></div>`;
        }
    }, 500);
}

// Fungsi Fetch Data ke Backend
async function sendData(action, data) {
    const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action, data })
    });
    return await response.json();
}

// Render Input Presensi
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

// Ambil Siswa dari Backend
async function fetchSiswa(idKelas) {
    if(!idKelas) return;
    const siswaList = document.getElementById('siswaList');
    siswaList.innerHTML = `<p class="text-center">Loading siswa...</p>`;
    
    // Di sini Anda akan melakukan fetch ke GAS untuk mendapatkan data siswa
    // Contoh: const data = await sendData('getStudents', {idKelas});
    
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

// Simpan Absensi
function saveAbsensi() {
    Swal.fire({
        title: 'Konfirmasi',
        text: "Simpan data absensi sekarang?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4DA3FF',
        confirmButtonText: 'Ya, Simpan!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Berhasil!', 'Data absensi telah tersimpan.', 'success');
        }
    });
}