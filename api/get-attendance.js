const { useSupabase, getSupabase, dbAll } = require('../lib/db');

module.exports = async function(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum di-set di environment Vercel.' });
    }
    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      const result = await supabase.from('attendance').select('*');
      if (result.error) throw result.error;
      data = result.data;
    } else {
      data = await dbAll('SELECT * FROM attendance');
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error function: ' + err.message + '. Pastikan env vars sudah di-set dan table attendance sudah ada di Supabase.' });
  }
};