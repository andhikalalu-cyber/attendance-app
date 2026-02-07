const { useSupabase, getSupabase, dbRun, dbGet } = require('./lib/db');

exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const id = params.id;
    if (!id) return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Missing id in query string' }) };

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

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};
