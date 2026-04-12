export const DEFAULT_INGREDIENTS = [
  '豚バラ', '肩ロース', '豚ひき肉', '豚切り落とし',
  '牛バラ', 'サーロイン', '牛モモ', '牛ひき肉',
  '鶏もも肉', '鶏むね肉', 'ささみ', '手羽先・元', '鶏ひき肉',
  'ベーコン', 'ハム', 'ソーセージ', 'ウィンナー', '合い挽き肉',
  '人参', '大根', 'じゃがいも', 'ごぼう', 'れんこん',
  'キャベツ', '白菜', 'ほうれん草', '小松菜', 'レタス', '長ねぎ',
  'トマト', 'きゅうり', 'なす', 'ピーマン', 'かぼちゃ',
  '椎茸', 'しめじ', 'えのき', 'エリンギ', '舞茸',
  '鮭', '鯖', '鱈', '鯛', 'マグロ', 'ブリ',
  'イカ', 'タコ', '海老', 'カニ',
  'あさり', 'しじみ', 'ホタテ', '牡蠣',
  '豆腐', '納豆', '厚揚げ', '油揚げ', '豆乳',
  '卵', '牛乳', 'チーズ', 'バター', 'ヨーグルト',
  '米', 'パスタ', 'うどん', '春雨', 'わかめ', '昆布'
];
export const DEFAULT_GENRES = ['和食', '洋食', '中華', 'イタリアン', 'フレンチ', 'エスニック', 'スイーツ', 'その他'];
export const DEFAULT_TAGS = ['10分爆速', '高タンパク', 'おもてなし', '節約', '殿堂入り⭐️', '30分以内', '500kcal以下', 'がっつりお肉', 'さっぱり', '給料日前(節約)', '野菜たっぷり'];
export const DEFAULT_UNITS = ['g', 'ml', 'cc', '個', '枚', '本', '大さじ', '小さじ', '少々', '適量'];

export const getSettings = (key: string, defaultValues: string[]) => {
  try {
    const saved = localStorage.getItem(`app_settings_${key}`);
    return saved ? JSON.parse(saved) : defaultValues;
  } catch {
    return defaultValues;
  }
};

export const saveSettings = (key: string, values: string[]) => {
  localStorage.setItem(`app_settings_${key}`, JSON.stringify(values));
};
