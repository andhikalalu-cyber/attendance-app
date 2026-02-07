const { useSupabase, getSupabase } = require('./lib/db');

exports.handler = async function (event, context) {
  try {
    if (!useSupabase()) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Supabase not configured' })
      };
    }

    const supabase = getSupabase();
    const method = event.httpMethod;

    if (method === 'GET') {
      // GET: retrieve attendance data
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

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(appData)
      };
    }

    if (method === 'POST') {
      // POST: save attendance data
      const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

      // Check if record exists
      const { data: existing, error: getError } = await supabase
        .from('app_data')
        .select('id')
        .limit(1);

      if (getError && getError.code !== 'PGRST116') throw getError;

      let result;
      if (existing && existing.length > 0) {
        // Update
        result = await supabase
          .from('app_data')
          .update({ data: payload, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
      } else {
        // Insert
        result = await supabase
          .from('app_data')
          .insert([{ data: payload, updated_at: new Date().toISOString() }])
          .select();
      }

      if (result.error) throw result.error;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: true })
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
