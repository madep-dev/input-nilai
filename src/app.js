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
<div class="mt-4 animate-fade">

<div class="overflow-x-auto rounded-lg border border-gray-200">
<table class="min-w-[500px] w-full text-sm">

<thead class="bg-gray-100 text-gray-700 sticky top-0">
<tr>
<th class="px-3 py-2 text-center whitespace-nowrap">NIS</th>
<th class="px-3 py-2 text-left whitespace-nowrap">Nama</th>
<th class="px-3 py-2 text-center whitespace-nowrap">Nilai</th>
</tr>
</thead>

<tbody class="divide-y">
`;

    siswaAktif.forEach((s) => {
        html += `
<tr class="hover:bg-gray-50 transition">
<td class="px-3 py-2 text-center whitespace-nowrap">${s[0]}</td>

<td class="px-3 py-2 whitespace-nowrap">
<div class="max-w-[220px]">
${s[1]}
</div>
</td>

<td class="px-3 py-2 w-[120px]">
<input 
type="text"
id="n_${s[0]}"
inputmode="text"
class="w-full border border-gray-300 rounded-lg p-2 text-sm transition">
</td>
</tr>
`;
    });

    html += `
</tbody>
</table>
</div>

<button
id="btnSimpan"
class="mt-6 w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 hover:shadow text-white font-medium rounded-lg transition duration-300 text-sm">
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
