const { useSupabase, getSupabase, dbRun } = require('./lib/db');

exports.handler = async function (event) {
  try {
    if (!event.body) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Missing body' }) };
    }
    const payload = JSON.parse(event.body);
    const { name, timestamp } = payload;

    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      const result = await supabase.from('attendance').insert([payload]).select().single();
      if (result.error) throw result.error;
      data = result.data;
    } else {
      const res = await dbRun('INSERT INTO attendance (name, timestamp) VALUES (?, ?)', [name, timestamp || new Date().toISOString()]);
      data = { id: res.id, name, timestamp: timestamp || new Date().toISOString() };
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};
