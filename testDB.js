const run = async () => {
    const url = 'https://nboutnwrbtpfcootoktz.supabase.co/rest/v1/recipes?select=id,name,image,instructions,created_at&order=created_at.desc&limit=3';
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }});
    const data = await res.json();
    data.forEach((row, i) => {
        console.log(`\n--- [${i+1}] ${row.name} (${row.created_at}) ---`);
        console.log(`ID: ${row.id}`);
        console.log(`Image length: ${row.image ? row.image.length : 0}`);
        console.log(`Instructions count: ${row.instructions ? row.instructions.length : 0}`);
        if(row.instructions && row.instructions.length > 0) {
            try { const p = JSON.parse(row.instructions[0]); console.log('Inst 0 Has Image?', p.image ? 'YES' : 'NO'); }
            catch(e) { console.log('Inst 0 parse fail (mock?)'); }
        }
    });
};
run();
