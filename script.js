/**
 * FRONTEND LOGIC - ABSENSI DIGITAL
 * PENTING: Ganti API_URL dengan URL Web App Google Apps Script Anda setelah deploy!
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyI5dnWuX-8wds3PKv5R6qVyJTBT-XmQVJvVjzQL0HYs81tgLRteC7pF89foJaD_Utm/exec"; 

// Global State / Cache
const state = {
    classes: [],
    students: [],
    currentDate: '',
    attendanceTemp: {} // { id_siswa: 'Hadir' }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi Datepicker
    flatpickr("#input-tanggal", {
        defaultDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            state.currentDate = dateStr;
            resetStatus(); // Reset status jika ganti hari
        }
    });
    state.currentDate = document.getElementById('input-tanggal').value;

    // Routing Navigation
    document.querySelectorAll('.list-group-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.list-group-item').forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const view = e.currentTarget.getAttribute('data-view');
            showView(view);
            if(view === 'input-presensi') loadInputPresensiData();
        });
    });

    // Load initial data
    showLoading(true);
    await fetchClasses();
    showLoading(false);
    showView('dashboard');
});

// --- API FETCH WRAPPERS ---
async function apiGet(action, params = "") {
    try {
        const response = await fetch(`${API_URL}?action=${action}${params}`);
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal mengambil data dari server', 'error');
        return [];
    }
}

async function apiPost(action, data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action, data }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } // text/plain menghindari block CORS strict GAS
        });
        return await response.json();
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// --- LOGIC UI & STATE ---
function showView(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('d-none'));
    const view = document.getElementById(`view-${viewId}`);
    if(view) view.classList.remove('d-none');
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('d-none', !show);
}

async function fetchClasses() {
    const classes = await apiGet('getClasses');
    state.classes = classes;
    
    const select = document.getElementById('select-kelas');
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    classes.forEach(c => {
        select.innerHTML += `<option value="${c.id_kelas}">${c.nama_kelas}</option>`;
    });

    select.addEventListener('change', async (e) => {
        if(e.target.value) {
            await fetchStudents(e.target.value);
        } else {
            document.getElementById('container-siswa').innerHTML = '';
        }
    });
}

async function fetchStudents(idKelas) {
    showLoading(true);
    state.students = await apiGet('getStudents', `&id_kelas=${idKelas}`);
    renderStudents();
    showLoading(false);
}

function renderStudents() {
    const container = document.getElementById('container-siswa');
    if(state.students.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted my-5">Belum ada data siswa di kelas ini.</div>`;
        return;
    }

    container.innerHTML = state.students.map(s => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card student-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-secondary rounded-circle text-white d-flex justify-content-center align-items-center me-3" style="width:50px; height:50px; font-size:24px;">
                            <i class="bi bi-person"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold">${s.nama}</h6>
                            <small class="text-muted">NIS: ${s.nis}</small>
                        </div>
                    </div>
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-success status-btn btn-hadir w-100" onclick="setStatus('${s.id_siswa}', 'Hadir', this)">✅</button>
                        <button class="btn btn-sm btn-outline-primary status-btn btn-sakit w-100" onclick="setStatus('${s.id_siswa}', 'Sakit', this)">🤒</button>
                        <button class="btn btn-sm btn-outline-warning status-btn btn-izin w-100" onclick="setStatus('${s.id_siswa}', 'Izin', this)">🟡</button>
                        <button class="btn btn-sm btn-outline-danger status-btn btn-alpha w-100" onclick="setStatus('${s.id_siswa}', 'Alpha', this)">🔴</button>
                        <button class="btn btn-sm btn-outline-orange status-btn btn-terlambat w-100" style="border-color:#f97316; color:#f97316;" onclick="setStatus('${s.id_siswa}', 'Terlambat', this)">🟠</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Reset temp state when rendering new class
    state.attendanceTemp = {};
}

function setStatus(idSiswa, status, btnElement) {
    state.attendanceTemp[idSiswa] = status;
    const btnGroup = btnElement.parentElement;
    btnGroup.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
}

function setSemuaHadir() {
    state.students.forEach(s => {
        state.attendanceTemp[s.id_siswa] = 'Hadir';
    });
    document.querySelectorAll('.btn-hadir').forEach(b => b.classList.add('active'));
    document.querySelectorAll('.status-btn:not(.btn-hadir)').forEach(b => b.classList.remove('active'));
}

function resetStatus() {
    state.attendanceTemp = {};
    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
}

async function simpanAbsensi() {
    const idKelas = document.getElementById('select-kelas').value;
    const pertemuan = document.getElementById('input-pertemuan').value;
    const tanggal = document.getElementById('input-tanggal').value;

    if(!idKelas) return Swal.fire('Peringatan', 'Pilih kelas terlebih dahulu!', 'warning');
    
    const unrecorded = state.students.filter(s => !state.attendanceTemp[s.id_siswa]);
    if(unrecorded.length > 0) {
        return Swal.fire('Peringatan', `Ada ${unrecorded.length} siswa belum dipresensi!`, 'warning');
    }

    const payload = state.students.map(s => ({
        id_kelas: idKelas,
        id_siswa: s.id_siswa,
        tanggal: tanggal,
        pertemuan: pertemuan,
        status: state.attendanceTemp[s.id_siswa]
    }));

    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    
    const res = await apiPost('saveAttendance', payload);
    
    if(res.status === 'success') {
        Swal.fire('Berhasil!', 'Absensi berhasil disimpan.', 'success');
        resetStatus();
    } else {
        Swal.fire('Gagal!', res.message, 'error');
    }
}

async function loadInputPresensiData() {
    if(state.classes.length === 0) await fetchClasses();
}
