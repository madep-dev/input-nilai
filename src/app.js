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

<table class="w-full text-sm">

<thead class="hidden md:table-header-group bg-gray-100 text-gray-700">
<tr>
<th class="px-3 py-2 text-center border">NIS</th>
<th class="px-3 py-2 text-left border">Nama</th>
<th class="px-3 py-2 text-center border">Nilai</th>
</tr>
</thead>

<tbody class="space-y-5 md:space-y-0">
`;

    siswaAktif.forEach((s) => {
        html += `
<tr class="block md:table-row border border-gray-200 md:border-transparent md:border-0 rounded-lg md:rounded-none p-3 md:p-0 bg-gray-50 md:hover:bg-gray-100 md:bg-transparent shadow md:shadow-none transition duration-200 ease-out">

<td class="flex justify-between md:table-cell border-0 md:border px-2 py-1 md:p-2">
<span class="text-gray-600 md:hidden">NIS</span>
<span class="text-center text-gray-800 md:text-gray-700 font-medium w-auto md:w-full">${s[0]}</span>
</td>

<td class="flex justify-between md:table-cell border-0 md:border px-2 py-1 md:p-2">
<span class="text-gray-600 md:hidden">Nama</span>
<span class="font-medium text-gray-800 md:text-gray-700">${s[1]}</span>
</td>

<td class="flex justify-between md:table-cell border-0 md:border px-2 py-1 md:p-2">
<span class="text-gray-500 md:hidden">Nilai</span>

<input
type="text"
id="n_${s[0]}"
inputmode="numeric"
class="w-24 md:w-full border border-gray-300 rounded-md px-2 py-1">
</td>

</tr>
`;
    });

    html += `
</tbody>
</table>

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
