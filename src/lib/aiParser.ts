export async function parseRecipeWithGemini(apiKey: string, textOrUrl: string, fileData?: { base64: string, mimeType: string }) {
    let contentToParse = textOrUrl;
    
    // URLの場合はプロキシを経由してHTMLのテキストを取得する
    const isUrl = textOrUrl.trim().match(/^https?:\/\/[^\s]+/);
    if (isUrl && !fileData) {
       let html = "";
       const targetUrl = isUrl[0];
       
       try {
         // Proxy 1: AllOrigins
         const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
         if (!res.ok) throw new Error('Proxy 1 failed');
         const data = await res.json();
         html = data.contents || "";
         if (!html || html.includes('Cloudflare') || html.includes('captcha')) throw new Error('Blocked by target site');
       } catch (e1) {
         try {
           // Proxy 2: corsproxy.io (Fallback)
           const res2 = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
           if (!res2.ok) throw new Error('Proxy 2 failed');
           html = await res2.text();
           if (!html || html.includes('Cloudflare') || html.includes('captcha')) throw new Error('Blocked by target site');
         } catch (e2) {
            console.error('URL Fetch Error on all proxies');
            throw new Error('【セキュリティブロック】\n該当のレシピサイト（クックパッド等）はセキュリティが固く、AIが外部から読み取ることができませんでした。\n\n💡 解決策：\nブラウザでレシピのページを開き、文字をコピーして直接この枠に貼り付けるか、画面をスクショして写真をアップロードしてください！');
         }
       }
       
       // スクリプトやスタイルを取り除き、純粋なテキストに近づける（粗い処理）
       html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
       html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
       
       // HTMLタグを削除して純粋なテキスト化＆文字数を制限（長すぎるとエラーになるため）
       contentToParse = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').slice(0, 15000); 
    }

    const prompt = `
以下の情報（テキストまたは提供された画像・PDFドキュメント）から、料理レシピの情報を正確に抽出し、指定のJSON形式で返答してください。
画像やPDFが提供されている場合は、それらの視覚情報（写真に写っている文字など）からレシピを読み取ってください。
挨拶や説明は一切含めず、純粋なJSONのみを出力してください。情報が足りない場合は推測せずに空文字にしてください。

【必須出力JSONフォーマット】
{
  "title": "料理名（文字列）",
  "ingredients": [
    { "name": "材料名（例:豚肉）", "quantity": "分量の数値（例:200）", "unit": "単位（例:g、大さじ、個）" }
  ],
  "instructions": [
    "手順のステップ1の文章（冒頭の数字は不要）", 
    "手順のステップ2の文章"
  ]
}

【対象テキスト】
${contentToParse ? contentToParse : "(テキストなし。添付の画像またはPDFファイルを参照してください)"}
`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [{ text: prompt }];

    if (fileData) {
       parts.push({
         inlineData: {
           data: fileData.base64,
           mimeType: fileData.mimeType
         }
       });
    }

    const payload = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('API Error Response:', errJson);
        const errMsg = errJson?.error?.message || res.statusText || '不明なエラー';
        throw new Error(`AI通信エラー (${res.status}): ${errMsg}\nAPIキーが間違っているか、設定に問題があります。`);
    }

    const jsonData = await res.json();
    let resultText = jsonData.candidates[0].content.parts[0].text;
    
    // 万が一Markdownブロックが付いていた場合に剥がす
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(resultText);
    } catch(e) {
        console.error("JSON解析エラー", e, resultText);
        throw new Error('AIが回答したデータ形式が不正でした。もう一度お試しください。');
    }
}

export async function generateRecipeIdeasWithGemini(apiKey: string, query: string, isAiInspiration: boolean) {
    const prompt = `
ユーザーが検索キーワード「${query}」を入力しました。
${isAiInspiration 
  ? 'このキーワードから、AIの力で全く新しい、未体験でユニークなレシピのアイデアを5つ提案してください。' 
  : 'このキーワードに関連する、実用的で実際に作ってみたくなる美味しいレシピのアイデアを5つ提案してください。'}

【必須出力JSONフォーマット】
以下の形式のJSON配列のみを出力してください（挨拶やマークダウン修飾は一切不要です）。
[
  {
    "name": "魅力的な料理名",
    "tags": ["タグ1", "タグ2"],
    "calories": 450,
    "time": 20,
    "ingredients": ["材料1 100g", "材料2 小さじ1"],
    "instructions": ["手順1の文章", "手順2の文章"]
  }
]
`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`AI Request Error: ${errJson?.error?.message || res.statusText}`);
    }

    const jsonData = await res.json();
    let resultText = jsonData.candidates[0].content.parts[0].text;
    
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(resultText);
    } catch(e) {
        console.error("JSON parse error:", e, resultText);
        throw new Error('AIが回答したデータ形式が不正でした。');
    }
}

export async function calculateCaloriesWithGemini(apiKey: string, ingredients: {name: string, quantity: string, unit: string}[]) {
    const ingredientList = ingredients
      .filter(i => !i.isGroupHeader && i.name)
      .map(i => `${i.name} ${i.quantity}${i.unit}`)
      .join('\n');

    const prompt = `
以下の材料リストから、全体での合計カロリー（kcal）を推定し、数値のみ（例: 450）を返してください。
文章での返答は一切不要です。数値が推測できない場合は 0 を返してください。

【材料リスト】
${ingredientList || "材料なし"}
`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error('カロリー計算に失敗しました');
    }

    const jsonData = await res.json();
    const resultText = jsonData.candidates[0].content.parts[0].text;
    
    // 数値だけを抽出
    const match = resultText.match(/\d+/);
    if (match) {
        return parseInt(match[0], 10);
    }
    return 0;
}

export async function analyzeNutritionWithGemini(apiKey: string, ingredients: string[], servings: number) {
    const prompt = `
以下の材料リストから、${servings}人分で作った場合の【1人分あたり】の詳細な栄養素を推定し、JSON形式で返答してください。
文章での返答は一切含めず、純粋なJSONのみを出力してください。

【必須出力JSONフォーマット】
{
  "protein": "◯◯g",
  "fat": "◯◯g",
  "carbs": "◯◯g",
  "salt": "◯◯g",
  "suggestions": "（栄養バランスに関するAIからの短いアドバイス。1文程度）"
}

【材料リスト(${servings}人分)】
${ingredients.join('\n') || "材料なし"}
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error('栄養素解析に失敗しました');
    }

    const jsonData = await res.json();
    let resultText = jsonData.candidates[0].content.parts[0].text;
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(resultText);
    } catch(e) {
        throw new Error('AIが回答したデータ形式が不正でした。');
    }
}
