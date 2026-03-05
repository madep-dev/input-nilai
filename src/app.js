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
<div class="mt-4">

<div class="overflow-x-auto md:overflow-visible rounded-xl border border-gray-200">

<table class="w-full text-sm">

<thead class="hidden md:table-header-group bg-gray-100 text-gray-700">
<tr>
<th class="px-3 py-2 border text-center">NIS</th>
<th class="px-3 py-2 border text-left">Nama</th>
<th class="px-3 py-2 border text-center">Nilai</th>
</tr>
</thead>

<tbody class="space-y-3 md:space-y-0">
`;

    siswaAktif.forEach((s) => {
        html += `
<tr class="block md:table-row bg-white md:bg-transparent border md:border-0 rounded-lg md:rounded-none p-3 md:p-0 shadow-sm md:shadow-none">

<td class="grid grid-cols-[90px_1fr]  md:block py-1 md:p-2 border-0 md:border">

<span class="font-medium text-gray-500 md:hidden">NIS</span>
<span class="wrap-break-word">${s[0]}</span>

</td>

<td class="grid grid-cols-[90px_1fr]  md:block py-1 md:p-2 border-0 md:border">

<span class="font-medium text-gray-500 md:hidden">Nama</span>
<span class="wrap-break-word leading-snug">
${s[1]}
</span>

</td>

<td class="grid grid-cols-[90px_1fr] items-center  md:block py-1 md:p-2 border-0 md:border">

<span class="font-medium text-gray-500 md:hidden">Nilai</span>

<input
type="text"
id="n_${s[0]}"
inputmode="numeric"
class="w-28 md:w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400">

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
class="mt-6 w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 hover:shadow text-white font-medium rounded-lg transition text-sm">
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
