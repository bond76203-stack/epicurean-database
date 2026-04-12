const recipeToSave = {
  instructions: [
    { text: "Step 1", image: "data:image/jpeg;base64,AABBC" }
  ]
};

const savedToDbArray = recipeToSave.instructions.map(inst => JSON.stringify({text: inst.text, image: inst.image}));

console.log("Array to send to DB:", savedToDbArray);

// How loader reads it back:
const loadedInstructions = savedToDbArray.map((instStr) => {
    try {
        const p = JSON.parse(instStr);
        return { text: p.text || instStr, image: p.image || null };
    } catch(e) {
        return { text: instStr, image: null };
    }
});

console.log("Loaded back:", loadedInstructions);

// Detail Screen logic
const renderStrings = savedToDbArray.map(stepStr => {
    let stepText = stepStr;
    let stepImg = null;
    try {
        const p = JSON.parse(stepStr);
        stepText = p.text || stepStr;
        stepImg = p.image || null;
    } catch(e) {
        stepText = stepStr;
    }
    return { stepText, stepImg };
});

console.log("Render logic:", renderStrings);

