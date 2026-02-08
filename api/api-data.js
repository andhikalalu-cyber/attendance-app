const { useSupabase, getSupabase } = require('../lib/db');

module.exports = async function (req, res) {
  try {
    if (!useSupabase()) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }
    const supabase = getSupabase();
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_data')
        .select('*')
        .order('id', { ascending: true })
        .limit(1);
      if (error) throw error;
      const appData = data && data.length > 0 
        ? data[0].data 
        : {
            classes: [],
            currentClassIndex: 0
          };
      return res.status(200).json(appData);
    }
    if (req.method === 'POST') {
      const payload = req.body;
      const { data: existing, error: getError } = await supabase
        .from('app_data')
        .select('id')
        .limit(1);
      if (getError && getError.code !== 'PGRST116') throw getError;
      let result;
      if (existing && existing.length > 0) {
        result = await supabase
          .from('app_data')
          .update({ data: payload, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
      } else {
        result = await supabase
          .from('app_data')
          .insert([{ data: payload, updated_at: new Date().toISOString() }])
          .select();
      }
      if (result.error) throw result.error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};