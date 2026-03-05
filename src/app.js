const API =
    "https://script.google.com/macros/s/AKfycbyyHzNxZPcluM4JL-awS2Gxv4ML8fnYDLCzgq3l7EXqCRCJe7Nu2Jw2pwNOBGnwA67z/exec";

let semuaSiswa = [];
let siswaAktif = [];

async function init() {
    Swal.fire({
        title: "Memuat data",
        text: "Mohon tunggu...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const [kelas, mapel, siswa] = await Promise.all([
            fetch(API + "?action=kelas").then((r) => r.json()),
            fetch(API + "?action=mapel").then((r) => r.json()),
            fetch(API + "?action=siswa").then((r) => r.json()),
        ]);

        semuaSiswa = siswa.slice(1);

        const kelasSelect = document.getElementById("kelas");
        kelas.slice(1).forEach((k) => {
            kelasSelect.innerHTML += `<option value="${k[1]}">${k[1]}</option>`;
        });

        const mapelSelect = document.getElementById("mapel");
        mapel.slice(1).forEach((m) => {
            mapelSelect.innerHTML += `<option value="${m[0]}">${m[1]}</option>`;
        });

        Swal.close();
    } catch (err) {
        Swal.fire("Error", "Gagal memuat data", "error");
    }
}

async function loadSiswa() {
    const kelas = document.getElementById("kelas").value;

    siswaAktif = semuaSiswa.filter((s) => s[2] == kelas);

    let html = `
<div class="overflow-x-auto mt-4 animate-fade">
<table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
<thead class="bg-gray-100 text-gray-700">
<tr>
<th class="border p-2">NIS</th>
<th class="border p-2 text-left">Nama</th>
<th class="border p-2">Nilai</th>
</tr>
</thead>
<tbody>
`;

    siswaAktif.forEach((s) => {
        html += `
<tr class="hover:bg-gray-50">
<td class="border p-2 text-center">${s[0]}</td>
<td class="border p-2">${s[1]}</td>
<td class="border p-2">
<input type="text"
id="n_${s[0]}"
class="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400">
</td>
</tr>
`;
    });

    html += `
</tbody>
</table>

<button id="btnSimpan"
class="mt-8 px-5 py-2 bg-green-600 hover:bg-green-700 hover:shadow hover:-translate-y-0.5 text-white font-medium rounded-lg transition duration-300 text-sm">
Simpan Nilai
</button>
</div>
`;

    document.getElementById("tabel").innerHTML = html;
    document.getElementById("jumlah").innerText = siswaAktif.length;

    document.getElementById("btnSimpan").addEventListener("click", simpan);
}

async function simpan() {
    const kelas = document.getElementById("kelas").value;
    const mapel = document.getElementById("mapel").value;

    let payload = [];

    siswaAktif.forEach((s) => {
        const nilai = document.getElementById("n_" + s[0]).value;

        if (nilai) {
            payload.push({
                kelas: kelas,
                nis: s[0],
                nama: s[1],
                mapel: mapel,
                nilai: nilai,
            });
        }
    });

    if (payload.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Belum ada nilai",
            text: "Silakan isi minimal satu nilai.",
        });
        return;
    }

    Swal.fire({
        title: "Menyimpan nilai...",
        text: "Mohon tunggu",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const res = await fetch(API, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        await res.json();

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Nilai berhasil disimpan",
        });

        document.getElementById("tabel").innerHTML = "";
        document.getElementById("jumlah").innerText = "0";
    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Terjadi kesalahan",
            text: "Gagal menyimpan data",
        });
    }
}

document.getElementById("btnLoad").addEventListener("click", loadSiswa);

init();
