const { useSupabase, getSupabase, dbAll } = require('./lib/db');

exports.handler = async function (event, context) {
  try {
    // Tambahkan log dan error handling agar user tahu jika env vars belum di-set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum di-set di environment Netlify. Cek dashboard Netlify > Site settings > Environment Variables.' })
      };
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
      body: JSON.stringify({ error: 'Error function: ' + err.message + '. Pastikan env vars sudah di-set dan table attendance sudah ada di Supabase.' })
    };
  }
};
