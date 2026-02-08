const { useSupabase, getSupabase, dbRun } = require('../lib/db');

module.exports = async function (req, res) {
  try {
    const payload = req.body;
    const { name, timestamp } = payload;
    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      const result = await supabase.from('attendance').insert([payload]).select().single();
      if (result.error) throw result.error;
      data = result.data;
    } else {
      const resDb = await dbRun('INSERT INTO attendance (name, timestamp) VALUES (?, ?)', [name, timestamp || new Date().toISOString()]);
      data = { id: resDb.id, name, timestamp: timestamp || new Date().toISOString() };
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};