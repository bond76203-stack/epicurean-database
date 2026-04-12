
const run = async () => {
    const url = 'https://nboutnwrbtpfcootoktz.supabase.co/rest/v1/recipes?select=id,name,image,instructions&order=created_at.desc&limit=5';
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await res.json();
        console.log(`Found ${data.length} recipes.`);
        data.forEach((row, i) => {
            console.log(`--- Recipe ${i+1}: ${row.name} ---`);
            console.log("Image length:", row.image ? row.image.length : 0);
            if (row.image && row.image.length > 200) {
               console.log("Image starts with:", row.image.substring(0, 50));
            } else if (row.image) {
               console.log("Image:", row.image);
            }
            if (row.instructions && row.instructions.length > 0) {
                let inst = row.instructions[0];
                try {
                    const p = JSON.parse(inst);
                    console.log("Inst 0 image length:", p.image ? p.image.length : 0);
                } catch(e) {
                    console.log("Inst 0 parse failed");
                }
            }
        });
    } catch(err) {
        console.error("Error:", err);
    }
};

run();
