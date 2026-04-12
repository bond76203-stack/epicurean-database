
const run = async () => {
    const url = 'https://nboutnwrbtpfcootoktz.supabase.co/rest/v1/recipes?select=id,name,image,instructions&order=created_at.desc&limit=15';
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }});
    const data = await res.json();
    console.log(`Found ${data.length} recipes.`);
    data.forEach((row, i) => {
        console.log(`\n--- Recipe ${i+1}: ${row.name} ---`);
        console.log(`Image length: ${row.image ? row.image.length : 0}`);
        if(row.image && row.image.length < 200) console.log(`Image: ${row.image}`);
        else if (row.image) console.log(`Image starts with: ${row.image.substring(0, 40)}...`);
        
        if (row.instructions) {
            console.log(`Instructions count: ${row.instructions.length}`);
            row.instructions.forEach((inst, j) => {
                try {
                    const p = JSON.parse(inst);
                    console.log(`  Inst ${j} text: ${p.text ? p.text.substring(0,20) : ''}... | image length: ${p.image ? p.image.length : 0}`);
                } catch(e) {
                    console.log(`  Inst ${j} raw string (parse failed)`);
                }
            });
        }
    });
};
run();
