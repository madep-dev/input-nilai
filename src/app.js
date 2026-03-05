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

<table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">

<thead class="hidden md:table-header-group bg-gray-100 text-gray-700">
<tr>
<th class="px-4 py-3 text-center border-b">NIS</th>
<th class="px-4 py-3 text-left border-b">Nama</th>
<th class="px-4 py-3 text-center border-b">Nilai</th>
</tr>
</thead>

<tbody class="divide-y md:divide-y-0 space-y-5 md:space-y-0">
`;

    siswaAktif.forEach((s) => {
        html += `
<tr class="block md:table-row bg-gray-50 md:bg-transparent md:hover:bg-gray-50 rounded-lg md:rounded-none p-4 md:p-0 transition">

<td class="flex md:table-cell flex-col md:flex-row md:items-center md:border-b px-2 py-2 md:px-4 md:py-3">

<span class="text-xs text-gray-500 md:hidden">
NIS
</span>

<span class="font-medium text-gray-800 md:text-center w-full">
${s[0]}
</span>

</td>

<td class="flex flex-col md:table-cell md:border-b px-2 py-2 md:px-4 md:py-3">

<span class="text-xs text-gray-500 md:hidden">
Nama
</span>

<span class="wrap-break-word">
${s[1]}
</span>

</td>

<td class="flex flex-col md:table-cell md:border-b px-2 py-2 md:px-4 md:py-3">

<span class="text-xs text-gray-500 md:hidden">
Nilai
</span>

<input
type="text"
id="n_${s[0]}"
class="w-full border border-gray-300 rounded-md px-2 py-1"
/>

</td>
</tr>
`;
    });

    html += `
</tbody>
</table>

<button
id="btnSimpan"
class="mt-6 w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 hover:shadow-md text-white font-medium rounded-lg transition duration-300 text-sm">
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
