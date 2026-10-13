// Config penyimpanan (Cloudflare Worker) - SITUS kjago7822
// Satu Worker dipakai semua akun; data tiap akun dipisah lewat nama "account".
// system:'legacy' = index.html versi satu halaman (kunci wb_logged_member / wb_admin_cred).
window.WB_STORE = {
  worker: 'https://steep-resonance-6a71.kjago7822.workers.dev',
  account: 'kjago7822',
  system: 'legacy'
};
