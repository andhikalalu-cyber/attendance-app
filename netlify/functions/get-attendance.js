const { useSupabase, getSupabase, dbAll } = require('./lib/db');

exports.handler = async function (event, context) {
  try {
    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      const result = await supabase.from('attendance').select('*');
      if (result.error) throw result.error;
      data = result.data;
    } else {
      data = await dbAll('SELECT * FROM attendance');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
