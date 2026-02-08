const { useSupabase, getSupabase, dbRun, dbGet } = require('../lib/db');

module.exports = async function (req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id in query string' });
    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      const result = await supabase.from('attendance').delete().eq('id', id).select().single();
      if (result.error) throw result.error;
      data = result.data;
    } else {
      data = await dbGet('SELECT * FROM attendance WHERE id = ?', [id]);
      await dbRun('DELETE FROM attendance WHERE id = ?', [id]);
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};