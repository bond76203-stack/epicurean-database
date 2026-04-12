
const run = async () => {
    const url = 'https://nboutnwrbtpfcootoktz.supabase.co/rest/v1/recipes?select=id,name,image,instructions&order=created_at.desc&limit=1';
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!key) {
        console.error("NO KEY");
        process.exit(1);
    }

    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });
        
        const data = await res.json();
        
        if (data.length > 0) {
            const row = data[0];
            console.log("ID:", row.id);
            console.log("Name:", row.name);
            console.log("Image length:", row.image ? row.image.length : 0);
            console.log("Instructions length:", row.instructions ? row.instructions.length : 0);
            if (row.instructions && row.instructions.length > 0) {
                let inst = row.instructions[0];
                console.log("Inst 0 first 100:", inst.length > 100 ? inst.slice(0, 100) + '...' : inst);
                try {
                    const p = JSON.parse(row.instructions[0]);
                    console.log("Inst 0 text:", p.text);
                    console.log("Inst 0 image length:", p.image ? p.image.length : 0);
                } catch(e) {
                    console.log("Parse failed", e.message);
                }
            }
        } else {
            console.log("No recipes found");
        }
    } catch(err) {
        console.error("Error:", err);
    }
};

run();
