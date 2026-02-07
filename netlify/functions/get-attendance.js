const { useSupabase, getSupabase, dbAll } = require('./lib/db');

exports.handler = async function (event, context) {
  try {
    console.log('GET handler: useSupabase =', useSupabase(), 'hasURL =', !!process.env.SUPABASE_URL);
    
    let data;
    if (useSupabase()) {
      const supabase = getSupabase();
      console.log('Using Supabase client');
      const result = await supabase.from('attendance').select('*');
      if (result.error) throw result.error;
      data = result.data;
    } else {
      console.log('Using SQLite (local fallback)');
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
    console.error('GET handler error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
