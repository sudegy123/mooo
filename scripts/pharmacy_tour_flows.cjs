// Recorded flows of the live pharmacy demo for the system tour (one clip per chapter). Pacing follows the narration
// (briefs/pharmacy-tour/narration.json): the key screen of each chapter appears about when its "show" sentence starts.
// Record: node scripts/record_demo.cjs scripts/pharmacy_tour_flows.cjs out/pharmacy-tour/rec [ids]
const addSilently = async (a, ids) => { for (const id of ids) await a.p.evaluate((id) => document.querySelector(`[data-id="${id}"]`).click(), id); await a.sleep(300); };

module.exports = { chapters: [
  { id: 'intro',   // login → today board → all sections
    async setup(a) { await a.sleep(300); },
    async run(a) {
      await a.sleep(700); await a.focus('.login-card', 'login');
      await a.tap('#enter', 'enter', { hold: 900 });
      await a.focus('#view', 'home');
      await a.sleep(900);
      await a.tap('#tabbar [data-act="more"]', 'more', { hold: 500 });
      await a.focus('.tiles', 'all sections');
      await a.sleep(2600);
    } },
  { id: 'alt',     // Augmentin missing → alternatives with the same active ingredient → add → Brufen → interaction warning
    async setup(a) { await a.login(); await a.go('pos'); await addSilently(a, ['warf5']); },
    async run(a) {
      await a.sleep(500);
      await a.type('#pos-q', 'Augmentin', 130);
      await a.sleep(500);
      await a.tap('[data-id="aug1g"]', 'missing', { hold: 300 });
      await a.focus('#pos-alt .alt-box', 'alternatives');
      await a.sleep(2300);
      await a.tap('#pos-alt [data-id]', 'take alternative', { hold: 900 });
      await a.clear('#pos-q'); await a.type('#pos-q', 'Brufen', 110);
      await a.sleep(300);
      await a.tap('#pos-items [data-id="bru400"]', 'add brufen', { hold: 500 });
      await a.tap('#cart-bar', 'open invoice', { hold: 700 });
      await a.show('#cart .note.bad');
      await a.focus('#cart .note.bad', 'interaction');
      await a.sleep(3200);
    } },
  { id: 'bankak',  // pay by Bankak with a notice already used → the sale is refused
    async setup(a) { await a.login(); await a.go('pos'); await addSilently(a, ['aug1g', 'amoc1g']); await a.p.evaluate(() => document.querySelector('#cart-bar').click()); await a.sleep(700); },
    async run(a) {
      await a.sleep(500);
      await a.tap('[data-method="bankak"]', 'bankak', { hold: 600 });
      await a.show('#p-notice');
      await a.type('#p-notice', '72016706111', 75);
      await a.sleep(500);
      await a.focus('#p-notice', 'notice');
      await a.tap('#done', 'complete sale', { hold: 300 });
      await a.focus('.toast', 'refused');
      await a.sleep(3300);
    } },
  { id: 'staff',   // control log: drawer opened without a sale, discount above permission, deleted after printing → permissions
    async setup(a) { await a.login(); await a.go('admin'); },
    async run(a) {
      await a.sleep(600);
      const drawer = await a.mark2('#view .li, #view li, #view .row, #view div', '^\\s*فتح درج');
      await a.show(drawer); await a.focus(drawer, 'drawer opened');
      await a.sleep(1500);
      await a.scrollBy(-2000, 1000);
      await a.focus('#view', 'flags');
      await a.sleep(1400);
      await a.tap('[data-tab="roles"]', 'permissions', { hold: 400 });
      await a.focus('#view table, #view .perm, #view', 'permissions table');
      await a.sleep(2600);
    } },
  { id: 'expiry',  // expired batch blocked from sale → expiring soon → insulin fridge log
    async setup(a) { await a.login(); await a.go('stock?tab=expiry'); },
    async run(a) {
      await a.sleep(500);
      await a.scrollBy(330, 900);
      await a.focus('#view', 'expired blocked');
      await a.sleep(1500);
      await a.scrollBy(380, 900);
      await a.sleep(600);
      await a.scrollBy(-710, 700);
      await a.tap('[data-tab="cold"]', 'fridge', { hold: 600 });
      await a.scrollBy(330, 900);
      await a.focus('#view', 'fridge log');
      await a.sleep(2200);
    } },
  { id: 'reorder', // order list per supplier from the daily draw → More → suppliers: payment schedule
    async setup(a) { await a.login(); await a.go('stock?tab=reorder'); },
    async run(a) {
      await a.sleep(500);
      await a.scrollBy(300, 900);
      await a.focus('#view', 'reorder list');
      await a.sleep(1300);
      await a.scrollBy(330, 900);
      await a.sleep(300);
      await a.tap('#tabbar [data-act="more"]', 'more', { hold: 500 });
      await a.tap('.tiles a[href="#/supply"]', 'suppliers', { hold: 900 });
      await a.scrollBy(380, 1000);
      await a.focus('#view', 'payment schedule');
      await a.sleep(2000);
    } },
  { id: 'power',   // offline: selling continues, saved on the device → back online: synced
    async setup(a) { await a.login(); await a.go('pos'); },
    async run(a) {
      await a.sleep(500);
      await a.tap('#sync-m .sync', 'go offline', { hold: 300 });
      await a.focus('.toast', 'offline toast');
      await a.sleep(1500);
      await a.tap('[data-id="panex"]', 'sell', { hold: 300 });
      await a.tap('#cart-bar', 'invoice', { hold: 500 });
      await a.tap('#done', 'complete', { hold: 1100 });
      await a.focus('#sync-m', 'pending');
      await a.tap('#sync-m .sync', 'back online', { hold: 300 });
      await a.focus('.toast', 'synced');
      await a.sleep(2400);
    } },
  { id: 'rx',      // a prescription photo arrives → prepared items → ready, message to the customer
    async setup(a) { await a.login(); await a.go('rx'); },
    async run(a) {
      await a.sleep(500);
      await a.tap('[data-rx="r1"]', 'photo', { hold: 300 });
      await a.focus('.modal img, .drawer img, .sheet img', 'prescription photo');
      await a.sleep(1000);
      await a.tap('[data-close], .x', 'close', { hold: 250 });
      await a.tap('[data-rx="r3"]', 'prepared', { hold: 300 });
      await a.show('[data-ready]');
      await a.focus('[data-ready]', 'items ready');
      await a.sleep(350);
      await a.tap('[data-ready]', 'ready', { hold: 300 });
      await a.focus('.toast', 'customer told');
      await a.sleep(2600);
    } },
  { id: 'chronic', // chronic patients: who is late or due → remind (message prepared)
    async setup(a) { await a.login(); await a.go('chronic'); },
    async run(a) {
      await a.sleep(500);
      await a.show('[data-remind="p3"]');
      await a.focus('[data-remind="p3"]', 'patient due');
      await a.sleep(1300);
      await a.tap('[data-remind="p3"]', 'remind', { hold: 300 });
      await a.focus('.toast', 'reminder');
      await a.sleep(3000);
    } },
  { id: 'loyalty', // loyalty: registered by phone, points, discount at the cashier
    async setup(a) { await a.login(); await a.go('customers'); },
    async run(a) {
      await a.sleep(1300);
      await a.focus('#view', 'loyalty stats');
      await a.scrollBy(560, 1100);
      await a.focus('#view', 'points rules');
      await a.sleep(1500);
      await a.scrollBy(260, 900);
      await a.sleep(2200);
    } },
  { id: 'owner',   // today board: sales, drawer, Bankak → day summary on WhatsApp
    async setup(a) { await a.login(); await a.go('home'); },
    async run(a) {
      await a.sleep(400);
      await a.focus('#view', 'kpis');
      await a.glide(330, 1700);
      await a.sleep(300);
      await a.glide(-330, 1100);
      const sum = await a.mark2('#view button', 'ملخص');
      await a.tap(sum, 'day summary', { hold: 300 });
      await a.focus('.toast', 'summary');
      await a.sleep(1200);
      await a.scrollBy(520, 1100);
      await a.sleep(1800);
    } },
  { id: 'cta',     // the demo opens with your pharmacy's name
    async setup(a) { await a.sleep(300); },
    async run(a) {
      await a.sleep(500);
      await a.type('#ph', 'صيدليتك', 130, { clear: true });
      await a.sleep(500);
      await a.tap('#enter', 'enter', { hold: 900 });
      await a.focus('.m-top', 'pharmacy name');
      await a.sleep(2600);
    } }
] };
