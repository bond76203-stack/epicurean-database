import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Search, ScanLine, Compass, BookOpen, UserCircle, Settings2, Settings,
  Flame, Clock, Plus, Minus, Bookmark, ChevronRight, Wand2, Loader2,
  LayoutList, Grid2x2, Square,
  Globe, ArrowLeft, Heart, Share2, ChefHat,
  Camera, Save, X, Edit2, PlusCircle, Users, Link as LinkIcon, FileText, Filter, LogIn,
  Moon, Sun, Tag, FolderPlus, List, Trash2, Scale, KeyRound, LogOut, ChevronUp, GripVertical, Activity
} from 'lucide-react';

import { supabase } from './lib/supabase';
import { parseRecipeWithGemini, generateRecipeIdeasWithGemini, calculateCaloriesWithGemini, analyzeNutritionWithGemini } from './lib/aiParser';
import { getSettings, saveSettings, DEFAULT_INGREDIENTS, DEFAULT_GENRES, DEFAULT_TAGS, DEFAULT_UNITS } from './lib/settingsHelper';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544025162-8316c0b31e13?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1621644781442-97ee79d6ec67?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1614961908831-285b0d015c75?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400&h=400'
];

// モックデータとしてレシピ情報を外に出す
const RECIPES_DATA = [
  {
    id: 1,
    name: '黒毛和牛のロッシーニ風',
    tags: ['フレンチ', '極上'],
    calories: 820,
    time: 45,
    ingredients: ['黒毛和牛フィレ肉 200g', 'フォアグラ 50g', 'トリュフ 10g', 'マデラ酒 大さじ2'],
    instructions: ['1. 牛肉は常温に戻し、塩胡椒をする。', '2. フライパンで強火で両面を焼き、休ませる。', '3. フォアグラをソテーする。', '4. マデラ酒とトリュフでソースを作る。'],
    image: 'https://images.unsplash.com/photo-1544025162-8316c0b31e13?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 2,
    name: '真鯛のカルパッチョ',
    tags: ['前菜', 'さっぱり'],
    calories: 210,
    time: 15,
    ingredients: ['真鯛の刺身 100g', 'オリーブオイル 大さじ1', '柚子胡椒 少々', 'レモン汁 小さじ1'],
    instructions: ['1. 真鯛を薄切りにして皿に並べる。', '2. オリーブオイル、柚子胡椒、レモン汁を混ぜる。', '3. ソースを真鯛にかける。', '4. お好みでハーブを散らす。'],
    image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 3,
    name: 'トリュフ香るカルボナーラ',
    tags: ['パスタ', 'ご褒美'],
    calories: 650,
    time: 25,
    ingredients: ['パスタ 100g', '卵黄 2個', 'パンチェッタ 40g', 'パルミジャーノ 30g', 'トリュフオイル 少々'],
    instructions: ['1. パスタを茹でる。', '2. パンチェッタを弱火でカリカリになるまで炒める。', '3. ボウルに卵黄とチーズを混ぜておく。', '4. 茹で上がったパスタと全ての材料とトリュフオイルを絡める。'],
    image: 'https://images.unsplash.com/photo-1621644781442-97ee79d6ec67?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 4,
    name: '季節野菜のテリーヌ',
    tags: ['野菜', '彩り'],
    calories: 140,
    time: 120,
    ingredients: ['季節の野菜 300g', 'コンソメゼリー 200ml', '塩 少々'],
    instructions: ['1. 野菜を色鮮やかに下茹でする。', '2. テリーヌ型に野菜をきれいに並べる。', '3. 温かいコンソメゼリーを流し込む。', '4. 冷蔵庫で半日冷やし固める。'],
    image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?auto=format&fit=crop&q=80&w=400&h=400'
  }
];

// -------------------------------------------------------------
// 1. 探検する画面（検索画面） - Premium Redesign
// -------------------------------------------------------------
const POPULAR_INGREDIENTS = [
  { name: '鶏もも肉' },
  { name: '鶏むね肉' },
  { name: '豚ロース' },
  { name: '豚バラ' },
  { name: 'じゃがいも' },
  { name: 'にんじん' },
  { name: '玉ねぎ' },
  { name: '長ねぎ' },
  { name: 'たまご' },
  { name: 'えのき' },
  { name: 'しめじ' }
];

const SearchScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const userIngredients = getSettings('ingredients', DEFAULT_INGREDIENTS);

  const ITEM_CATEGORIES = [
    ...(userIngredients.length > 0 ? [{
      category: 'お気に入り',
      sections: [{ label: 'よく使う・カスタム食材', items: userIngredients }]
    }] : []),
    {
      category: '肉類',
      sections: [
        { label: '豚肉', items: ['豚バラ', '肩ロース', '豚ひき肉', '豚切り落とし'] },
        { label: '牛肉', items: ['牛バラ', 'サーロイン', '牛モモ', '牛ひき肉'] },
        { label: '鶏肉', items: ['鶏もも肉', '鶏むね肉', 'ささみ', '手羽先・元', '鶏ひき肉'] },
        { label: '加工肉', items: ['ベーコン', 'ハム', 'ソーセージ', 'ウィンナー', '合い挽き肉'] }
      ]
    },
    {
      category: '野菜類',
      sections: [
        { label: '根菜', items: ['人参', '大根', 'じゃがいも', 'ごぼう', 'れんこん'] },
        { label: '葉茎菜', items: ['キャベツ', '白菜', 'ほうれん草', '小松菜', 'レタス', '長ねぎ'] },
        { label: '果菜', items: ['トマト', 'きゅうり', 'なす', 'ピーマン', 'かぼちゃ'] },
        { label: 'キノコ', items: ['椎茸', 'しめじ', 'えのき', 'エリンギ', '舞茸'] }
      ]
    },
    {
      category: '魚介類',
      sections: [
        { label: '赤身・白身', items: ['鮭', '鯖', '鱈', '鯛', 'マグロ', 'ブリ'] },
        { label: '軟体・甲殻', items: ['イカ', 'タコ', '海老', 'カニ'] },
        { label: '貝類', items: ['あさり', 'しじみ', 'ホタテ', '牡蠣'] }
      ]
    },
    {
      category: 'その他',
      sections: [
        { label: '大豆製品', items: ['豆腐', '納豆', '厚揚げ', '油揚げ', '豆乳'] },
        { label: '卵・乳製品', items: ['卵', '牛乳', 'チーズ', 'バター', 'ヨーグルト'] },
        { label: '乾物・穀物', items: ['米', 'パスタ', 'うどん', '春雨', 'わかめ', '昆布'] }
      ]
    }
  ];

  const [activeCategory, setActiveCategory] = useState(ITEM_CATEGORIES[0].category);

  const toggleIngredient = (name: string) => {
    if (searchQuery.includes(name)) {
      setSearchQuery(prev => prev.replace(new RegExp(`${name}\\s*`), '').trim());
    } else {
      setSearchQuery(prev => prev ? `${prev} ${name}` : name);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // 検索ワードをエンコード
    const encoded = encodeURIComponent(searchQuery.trim());
    
    // アプリ内検索結果へ遷移させる
    navigate(`/recipes?q=${encoded}`);
  };

  const handleAIInspiration = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      const ideas = ['魅惑のトリュフオムレツ', '黄金の海鮮パエリア', '悪魔のガーリックシュリンプ', '天使のふわふわパンケーキ', '真夜中の背徳パスタ', '至高のローストビーフ'];
      const currentQuery = searchQuery.trim();
      let idea = '';
      
      if (currentQuery) {
        // 材料が選ばれている場合は、その材料を使ったアレンジレシピ案にする
        idea = `${currentQuery}を使った極上アレンジ`;
      } else {
        // 何も選ばれていない場合は完全ランダム
        idea = ideas[Math.floor(Math.random() * ideas.length)];
      }
      
      // 自動的に「AIのひらめき」を添えて検索実行
      navigate(`/recipes?q=${encodeURIComponent(idea)}&ai=true`);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-y-auto bg-[#09090b] text-zinc-100 pb-[80px] font-sans leading-snug selection:bg-amber-500/30">
      {/* プレミアムな背景装飾 */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full pt-6">
        {/* ロゴ部分 */}
        <div className="pb-4 flex flex-col justify-center items-center px-6 shrink-0">
          <img 
            src="/logo.png" 
            alt="Epicurean Database Logo" 
            className="w-40 md:w-48 h-auto object-contain drop-shadow-2xl"
            onError={(e) => {
              // ユーザーがまだ public/logo.png を用意していない場合のフォールバック
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <h1 className="hidden text-3xl font-black tracking-tight text-white text-center">
            EPICUREAN<br />
            <span className="text-xl tracking-[0.3em] font-medium text-amber-500">DATABASE</span>
          </h1>
        </div>

        {/* 検索バー */}
        <div className="px-6 mb-4 shrink-0">
          <div className="relative flex items-center bg-zinc-900 shadow-xl border border-white/20 rounded-[2rem] p-0.5 max-w-sm mx-auto group">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-md group-focus-within:bg-emerald-500/20 transition-all opacity-0 group-focus-within:opacity-100"></div>
            <div className="pl-5 pr-2 text-zinc-400 relative z-10">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="何で検索しますか？"
              className="w-full py-4 bg-transparent text-zinc-100 placeholder-zinc-500 font-bold focus:outline-none relative z-10"
            />
          </div>
        </div>

        {/* 人気の食材（シンプル表示） */}
        <div className="px-5 mb-2 flex flex-col items-center justify-center shrink-0">
          <div className="flex flex-wrap gap-2.5 justify-center max-w-[340px] mb-4">
             {POPULAR_INGREDIENTS.map(ing => (
                <button
                  key={ing.name}
                  onClick={() => toggleIngredient(ing.name)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center transition-all shadow-md active:scale-95 ${searchQuery.includes(ing.name) ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-800'}`}
                >
                   {ing.name}
                </button>
             ))}
          </div>
          
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="px-6 py-2.5 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
             {showAllCategories ? <ChevronUp size={16}/> : <Plus size={16}/>} 材料をもっと見る
          </button>
        </div>

        {/* 展開された全体のカテゴリー表 */}
        {showAllCategories && (
          <div className="mb-10 w-full overflow-hidden flex flex-col items-center border-t border-white/5 pt-6 bg-zinc-900/30 shrink-0">
            <div className="w-full overflow-x-auto invisible-scrollbar px-5 pb-4">
              <div className="flex gap-2.5">
                {ITEM_CATEGORIES.map((cat: any) => (
                  <button
                    key={cat.category}
                    onClick={() => setActiveCategory(cat.category)}
                    className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-md active:scale-95 ${activeCategory === cat.category ? 'bg-emerald-600 text-white border border-emerald-500' : 'bg-zinc-800/80 text-zinc-400 border border-white/5 hover:border-emerald-500/30 hover:text-zinc-200'}`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 w-full flex flex-col gap-4 mt-2 mb-4 animate-in fade-in slide-in-from-top-4">
              {ITEM_CATEGORIES.find((c: any) => c.category === activeCategory)?.sections.map((sec: any) => (
                <div key={sec.label} className="bg-zinc-900 pb-2 border-b border-white/5 last:border-0">
                  <h3 className="text-xs font-bold text-emerald-500 mb-3 ml-1 tracking-widest">{sec.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {sec.items.map((ing: string) => {
                      const isSelected = searchQuery.includes(ing);
                      return (
                        <button
                          key={ing}
                          onClick={() => toggleIngredient(ing)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 border ${isSelected
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                              : 'bg-zinc-800/50 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500/30'
                            }`}
                        >
                          {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="px-6 space-y-4 max-w-sm w-full mx-auto mt-auto shrink-0 pb-6">
          <button
            disabled={!searchQuery.trim()}
            onClick={handleSearch}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center text-lg gap-2"
          >
            検索
          </button>

          <button
            onClick={handleAIInspiration}
            disabled={isGenerating}
            className="w-full bg-transparent border border-emerald-500 relative rounded-full p-[2px] group transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-amber-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-[#09090b] rounded-full py-4 flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin text-amber-500" size={20} />
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500">考案中...</span>
                </>
              ) : (
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500 text-lg">AIで生成</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. レシピ一覧画面 - Premium Design
// -------------------------------------------------------------
const RecipeListScreen = () => {
  const [viewMode, setViewMode] = useState<'single' | 'grid' | 'list'>('single');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const isAiGenerated = searchParams.get('ai') === 'true';

  const [dbRecipes, setDbRecipes] = useState<any[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    const fetchDB = async () => {
      const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setDbRecipes(data);
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const { data: favData } = await supabase.from('favorites')
          .select('*').order('created_at', { ascending: false });
        if (favData) {
          setFavoriteRecipes(favData.map(f => ({
            id: f.recipe_id,
            name: f.recipe_name,
            image: f.recipe_image,
            time: f.recipe_time,
            calories: f.recipe_calories,
            isExternal: f.is_external,
            tags: ['お気に入り'],
            link: f.link
          })));
        }
      }
    };
    fetchDB();
  }, []);

  useEffect(() => {
    if (q) {
      const fetchAiIdeas = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) return;
        setIsGeneratingAi(true);
        try {
          const results = await generateRecipeIdeasWithGemini(apiKey, q, isAiGenerated);
          setAiResults(results.map((r: any, i: number) => ({
            id: 901 + i,
            name: r.name,
            tags: isAiGenerated ? ['AI提案', ...(r.tags || [])] : ['外部生成', ...(r.tags || [])],
            calories: r.calories || '-',
            time: r.time || 15,
            isExternal: true,
            link: '', 
            image: FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)],
            // Additional data to pass to detail screen
            ingredients: r.ingredients || [],
            instructions: r.instructions || []
          })));
        } catch (e) {
          console.error("AI Generation Error", e);
        } finally {
          setIsGeneratingAi(false);
        }
      };
      
      // Clear previous results when q changes
      setAiResults([]);
      fetchAiIdeas();
    }
  }, [q, isAiGenerated]);

  // 提案されたすべてのフィルター項目
  const FILTERS = [
    { id: 'all', label: 'すべて', icon: <Filter size={14} /> },
    { id: 'time-10', label: '10分爆速', icon: <Clock size={14} /> },
    { id: 'time-30', label: '30分以内', icon: <Clock size={14} /> },
    { id: 'cal-500', label: '500kcal以下', icon: <Flame size={14} /> },
    { id: 'health-pro', label: '高タンパク', icon: <Flame size={14} /> },
    { id: 'mood-meat', label: 'がっつりお肉', icon: <Flame size={14} /> },
    { id: 'mood-light', label: 'さっぱり', icon: <Flame size={14} /> },
    { id: 'situ-party', label: 'おもてなし', icon: <ChefHat size={14} /> },
    { id: 'cost-cheap', label: '給料日前(節約)', icon: <Flame size={14} /> },
    { id: 'sp-hall', label: '殿堂入り⭐️', icon: <Heart size={14} /> },
    { id: 'sp-ai', label: 'AIインポート', icon: <Wand2 size={14} /> },
  ];

  // ===== DATA FILTERING & MOCK EXTERNAL =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sourceData = (activeFilter === 'sp-hall' || activeSort === 'hall_of_fame')
    ? favoriteRecipes 
    : (dbRecipes.length > 0 ? dbRecipes : RECIPES_DATA);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let internalResults: any[] = [...sourceData];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let externalResults: any[] = [];

  if (q && activeFilter !== 'sp-hall') {
    internalResults = internalResults.filter((r: any) => 
      r.name.includes(q) || (r.ingredients && r.ingredients.some((i: string) => i.includes(q))) || (r.tags && r.tags.some((t: string) => t.includes(q)))
    );
    
    // AIの結果を使用する
    externalResults = aiResults;
  }

  if (activeFilter !== 'all') {
    internalResults = internalResults.filter((r: any) => {
      const tags = r.tags || [];
      if (['和食', '洋食', '中華', 'イタリアン', 'フレンチ', 'エスニック', 'スイーツ', 'その他'].includes(activeFilter)) {
         return tags.includes(activeFilter);
      }
      switch (activeFilter) {
        case 'time-10': return Number(r.time) <= 10;
        case 'time-30': return Number(r.time) <= 30;
        case 'cal-500': return Number(r.calories) <= 500 && r.calories !== '-';
        case 'health-pro': return tags.includes('高タンパク');
        case 'mood-meat': return tags.includes('がっつりお肉');
        case 'mood-light': return tags.includes('さっぱり');
        case 'situ-party': return tags.includes('おもてなし');
        case 'cost-cheap': return tags.includes('給料日前(節約)');
        case 'sp-hall': return true;
        case 'sp-ai': return tags.includes('AIインポート');
        default: return true;
      }
    });
  }

  // ===== DATA SORTING =====
  if (activeSort === 'calories') {
    internalResults.sort((a, b) => {
      const calA = Number(a.calories) || 9999;
      const calB = Number(b.calories) || 9999;
      return calA - calB;
    });
  } else if (activeSort === 'time') {
    internalResults.sort((a, b) => {
      const timeA = Number(a.time) || 9999;
      const timeB = Number(b.time) || 9999;
      return timeA - timeB;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRecipeCard = (recipe: any) => {
    const handleCardClick = () => {
       // Serialize the AI result and pass it in the state of the navigation, if it's an external AI result
       if (recipe.isExternal) {
          navigate(`/recipes/${recipe.id}?q=${encodeURIComponent(q)}&ai=${isAiGenerated}`, { 
             state: { generatedRecipe: recipe } 
          });
       } else {
          navigate(`/recipes/${recipe.id}?q=${encodeURIComponent(q)}`);
       }
    };

    // ============================================
    // モード1: 1列の大型カード (Single)
    // ============================================
    if (viewMode === 'single') {
      return (
        <div
          key={recipe.id}
          onClick={handleCardClick}
          className={`group bg-zinc-900/40 border ${recipe.isExternal ? 'border-amber-500/30' : 'border-white/5'} rounded-3xl overflow-hidden hover:bg-zinc-800/60 transition-all duration-500 flex flex-col cursor-pointer`}
        >
          <div className="relative h-48 overflow-hidden">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <button className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/40 transition-colors">
              <Bookmark size={18} />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex gap-2 mb-2">
                {recipe.tags.map((tag: string) => (
                  <span key={tag} className={`text-[10px] font-bold uppercase ${recipe.isExternal && (tag === '外部' || tag === 'AI提案') ? 'text-rose-200 bg-rose-500/40 border-rose-500/50' : 'text-amber-200 bg-black/40 border-amber-500/20'} backdrop-blur-md border px-2 py-1 rounded-sm`}>{tag}</span>
                ))}
              </div>
              <h3 className="font-bold text-xl text-white leading-tight drop-shadow-lg">{recipe.name}</h3>
            </div>
          </div>
          <div className="px-4 py-4 flex justify-between items-center bg-gradient-to-b from-zinc-900/50 to-zinc-900/90">
            <div className="flex gap-4">
              {recipe.calories !== '-' && <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"><Flame size={14} className="text-amber-500/70" /> {recipe.calories} kcal</span>}
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"><Clock size={14} className="text-zinc-500" /> {recipe.time} min</span>
              {recipe.isExternal && <span className="text-xs font-medium text-rose-400 flex items-center gap-1"><Globe size={14} />アプリ内で見る</span>}
            </div>
            <ChevronRight size={18} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>
      );
    }

    // ============================================
    // モード2: 2列グリッド (Grid)
    // ============================================
    if (viewMode === 'grid') {
      return (
        <div
          key={recipe.id}
          onClick={handleCardClick}
          className={`group bg-zinc-900/40 border ${recipe.isExternal ? 'border-amber-500/30' : 'border-white/5'} rounded-2xl overflow-hidden hover:bg-zinc-800/60 transition-all flex flex-col cursor-pointer`}
        >
          <div className="relative aspect-square overflow-hidden">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            <button className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-colors">
              <Bookmark size={14} />
            </button>
            {recipe.isExternal && (
               <div className="absolute bottom-2 left-2 p-1 px-1.5 bg-rose-500/80 backdrop-blur-md rounded-md text-white flex items-center gap-1">
                 {isAiGenerated ? <Wand2 size={10} /> : <Globe size={10} />}
                 <span className="text-[9px] font-bold">{isAiGenerated ? 'AI' : '外部'}</span>
               </div>
            )}
          </div>
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="font-bold text-sm text-zinc-100 leading-snug line-clamp-2 mb-2">{recipe.name}</h3>
            <div className="mt-auto flex flex-col gap-1.5">
              {recipe.calories !== '-' && <span className="text-[10px] font-medium text-amber-500/80 flex items-center gap-1"><Flame size={10} /> {recipe.calories} kcal</span>}
              <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1"><Clock size={10} /> {recipe.time} min</span>
            </div>
          </div>
        </div>
      );
    }

    // ============================================
    // モード3: リスト表示 (List)
    // ============================================
    return (
      <div
        key={recipe.id}
        onClick={handleCardClick}
        className={`group bg-zinc-900/30 border ${recipe.isExternal ? 'border-amber-500/30' : 'border-white/5'} rounded-2xl flex items-center p-2.5 gap-4 hover:bg-zinc-800/50 transition-all cursor-pointer`}
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
           {recipe.isExternal && (
               <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                 {isAiGenerated ? <Wand2 size={18} className="text-amber-300 drop-shadow-md opacity-90" /> : <Globe size={18} className="text-white drop-shadow-md opacity-80" />}
               </div>
           )}
        </div>
        <div className="flex-grow py-1">
          <div className="flex gap-2 mb-1.5">
            <span className={`text-[9px] font-bold ${recipe.isExternal ? 'text-rose-200 bg-rose-900' : 'text-amber-200/80 bg-zinc-800'} px-1.5 py-0.5 rounded-sm`}>{recipe.tags[0]}</span>
          </div>
          <h3 className="font-bold text-sm text-zinc-100 mb-1 leading-snug truncate">{recipe.name}</h3>
          <div className="flex gap-3">
            {recipe.calories !== '-' && <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Flame size={10} className="text-amber-500/50" />{recipe.calories}cal</span>}
            <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={10} />{recipe.time}m</span>
          </div>
        </div>
        <button className="p-2 text-zinc-600 hover:text-amber-400 mr-1">
          {recipe.isExternal ? <Globe size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 pb-[120px] relative font-sans leading-snug">
      <div className="fixed top-0 w-full max-w-md h-64 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <div className="px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 z-20">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Curation</h1>
            <p className="text-xs text-zinc-500 mt-1">{q ? '検索結果' : '保存されたレシピ'}</p>
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="p-2.5 bg-zinc-800/80 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all active:scale-95 relative"
            title="詳細設定・絞り込み"
          >
            {activeFilter !== 'all' && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-900 border-box"></div>}
            <Settings2 size={20} />
          </button>
        </div>

        {/* レシピ一覧画面内の検索バー */}
        <div className="px-5 pt-3">
          <div className="relative flex items-center bg-zinc-900/60 border border-white/10 rounded-2xl p-1 shadow-inner">
            <div className="pl-4 pr-2 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              defaultValue={q}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/recipes?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }}
              placeholder="レシピ名、材料、タグでさらに検索..."
              className="w-full py-3 bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-sm"
            />
            {q && (
              <button onClick={() => navigate('/recipes')} className="p-2 text-zinc-500 hover:text-white mr-1 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 表示切り替え（ビュートグル） */}
        <div className="px-5 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-400">
            {isAiGenerated ? <span className="text-amber-400 flex items-center gap-1.5"><Wand2 size={14}/>AIからの提案</span> : q ? `「${q}」の検索結果` : 'All Recipes'}
          </h2>
          <div className="flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-2xl">
            <button
              onClick={() => setViewMode('single')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'single' ? 'bg-zinc-700 text-amber-400 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="1列表示"
            >
              <Square size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-700 text-amber-400 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="2列グリッド表示"
            >
              <Grid2x2 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-amber-400 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="リスト表示"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>

        {/* アプリ内レシピ一覧 */}
        <div className="px-5 pt-4 mb-4">
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : viewMode === 'list' ? 'space-y-3' : 'space-y-3'}`}>
            {internalResults.length > 0 ? (
               internalResults.map(renderRecipeCard)
            ) : (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-white/5">
                 <Search size={32} className="mb-3 opacity-20" />
                 <p className="text-sm font-bold">アプリ内に見つかりませんでした</p>
                 <p className="text-xs mt-1">下の外部レシピをご覧ください</p>
               </div>
            )}
          </div>
        </div>

        {/* 外部Web・AIレシピ一覧 */}
        {q && (
          <div className="px-5 pt-6 border-t border-white/5 space-y-5">
            {/* AIインスピレーション部分 */}
            <div>
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 flex items-center gap-2 mb-4">
                <Wand2 size={18} className="text-rose-400" />
                {isAiGenerated ? 'AIが考えた仮想レシピ' : 'AIによるインスピレーション'}
              </h3>
              
              {isGeneratingAi ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-white/5 shadow-inner">
                  <Loader2 size={32} className="mb-3 animate-spin text-rose-500" />
                  <p className="text-sm font-bold text-rose-400">AIがレシピを創造中...</p>
                  <p className="text-[10px] mt-1 text-zinc-500">Geminiが最適な料理を考えています</p>
                </div>
              ) : externalResults.length > 0 ? (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : viewMode === 'list' ? 'space-y-3' : 'space-y-3'}`}>
                  {externalResults.map(renderRecipeCard)}
                </div>
              ) : null}
            </div>

            {/* 外部サイトへのディープリンク部分 */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                <Globe size={18} />
                大手サイトで「{q}」を直接検索
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                以下のサイトで見つけたレシピは、作成画面の「マジックインポート」でURLを貼り付けるとAIが自動入力して取り込めます。
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`https://cookpad.com/search/${encodeURIComponent(q)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-800/80 border border-white/10 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-emerald-400">クックパッド</span>
                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400" />
                </a>
                <a 
                  href={`https://www.kurashiru.com/search?query=${encodeURIComponent(q)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-800/80 border border-white/10 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-emerald-400">クラシル</span>
                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400" />
                </a>
                <a 
                  href={`https://oceans-nadia.com/search?q=${encodeURIComponent(q)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-800/80 border border-white/10 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-emerald-400">Nadia</span>
                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400" />
                </a>
                <a 
                  href={`https://recipe.rakuten.co.jp/search/${encodeURIComponent(q)}/`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-800/80 border border-white/10 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-emerald-400">楽天レシピ</span>
                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400" />
                </a>
                <a 
                  href={`https://delishkitchen.tv/search?q=${encodeURIComponent(q)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="col-span-2 bg-zinc-800/80 border border-white/10 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-emerald-400">デリッシュキッチン</span>
                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* フローティング アクション ボタン (FAB) */}
        <div className="fixed bottom-[100px] w-full max-w-md pointer-events-none z-20 flex justify-end px-6">
          <button
            onClick={() => navigate('/recipes/new')}
            className="w-14 h-14 bg-gradient-to-tr from-amber-600 to-orange-400 text-white rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] flex items-center justify-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)] transition-all duration-300 pointer-events-auto"
          >
            <Plus size={28} />
          </button>
        </div>
      </div>

      {/* 詳細絞り込み・ソートモーダル */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-t border-white/10 w-full max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl relative translate-y-0 animate-in slide-in-from-bottom-full duration-300 pb-28">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Filter size={18} className="text-amber-500" />
                詳細な絞り込み
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* 並び替え */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Sort By / 並び替え</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setActiveSort('newest'); setIsFilterModalOpen(false); }}
                    className={`border-2 rounded-xl py-3 text-sm font-bold transition-all ${activeSort === 'newest' ? 'bg-zinc-800 border-amber-500/50 text-amber-500 shadow-inner' : 'bg-zinc-800/40 border-transparent hover:border-white/10 text-zinc-400'}`}
                  >
                    📄 新しい順
                  </button>
                  <button 
                    onClick={() => { setActiveSort('calories'); setIsFilterModalOpen(false); }}
                    className={`border-2 rounded-xl py-3 text-sm font-bold transition-all ${activeSort === 'calories' ? 'bg-zinc-800 border-amber-500/50 text-amber-500 shadow-inner' : 'bg-zinc-800/40 border-transparent hover:border-white/10 text-zinc-400'}`}
                  >
                    🔥 カロリー低い順
                  </button>
                  <button 
                    onClick={() => { setActiveSort('time'); setIsFilterModalOpen(false); }}
                    className={`border-2 rounded-xl py-3 text-sm font-bold transition-all ${activeSort === 'time' ? 'bg-zinc-800 border-amber-500/50 text-amber-500 shadow-inner' : 'bg-zinc-800/40 border-transparent hover:border-white/10 text-zinc-400'}`}
                  >
                    ⏱ 時間が短い順
                  </button>
                  <button 
                    onClick={() => { setActiveSort('hall_of_fame'); setIsFilterModalOpen(false); }}
                    className={`border-2 rounded-xl py-3 text-sm font-bold transition-all ${activeSort === 'hall_of_fame' ? 'bg-zinc-800 border-amber-500/50 text-amber-500 shadow-inner' : 'bg-zinc-800/40 border-transparent hover:border-white/10 text-zinc-400'}`}
                  >
                    ⭐️ 殿堂入り
                  </button>
                </div>
              </div>

              {/* カテゴリー (ジャンル) */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Category / カテゴリー（ジャンル）</label>
                <div className="flex flex-wrap gap-2.5">
                  {['和食', '洋食', '中華', 'イタリアン', 'フレンチ', 'エスニック', 'スイーツ', 'その他'].map(genre => (
                    <button
                      key={genre}
                      onClick={() => { setActiveFilter(genre); setIsFilterModalOpen(false); }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === genre
                          ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg'
                          : 'bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700'
                        }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* タグ */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Tags / 特殊なタグ</label>
                <div className="flex flex-wrap gap-2.5">
                  {FILTERS.slice(1).map(f => (
                    <button
                      key={`modal-${f.id}`}
                      onClick={() => { setActiveFilter(f.id); setIsFilterModalOpen(false); }}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === f.id
                          ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg'
                          : 'bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700'
                        }`}
                    >
                      <span className={activeFilter === f.id ? 'text-amber-100' : 'text-amber-500/70'}>{f.icon}</span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { setActiveFilter('all'); setActiveSort('newest'); setIsFilterModalOpen(false); }}
                  className="w-full bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm border border-transparent hover:border-rose-500/30"
                >
                  絞り込みをすべてクリア
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 3. レシピ詳細画面 - New Detail Screen
// -------------------------------------------------------------
const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [dbRecipe, setDbRecipe] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(2); // 出来上がり量（人数）
  const [servingsUnit, setServingsUnit] = useState('人分');
  const [originalServings, setOriginalServings] = useState(2);
  const [nutrition, setNutrition] = useState<{protein: string, fat: string, carbs: string, salt: string, suggestions: string} | null>(null);
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id && id.length > 10) { // UUID
        const { data } = await supabase.from('recipes').select('*').eq('id', id).single();
        if (data) setDbRecipe(data);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session && id) {
        const { data: favData } = await supabase.from('favorites')
          .select('id').eq('recipe_id', id).single();
        if (favData) setIsFavorite(true);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('本当にこのレシピを削除しますか？')) {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (!error) {
        alert('レシピを削除しました。');
        navigate('/recipes');
      } else {
        alert('削除に失敗しました: ' + error.message);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.name || 'Recipe DB',
          text: `「${recipe?.name}」のレシピを見てね！`,
          url: window.location.href,
        });
      } catch (e) {
        console.log('Share canceled', e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('レシピのURLをコピーしました！');
    }
  };

  const toggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('お気に入りに登録するにはログインが必要です。');
      return;
    }
    
    if (isFavorite) {
      setIsFavorite(false);
      await supabase.from('favorites').delete().eq('recipe_id', id).eq('user_id', session.user.id);
    } else {
      setIsFavorite(true);
      await supabase.from('favorites').insert([{
        user_id: session.user.id,
        recipe_id: id,
        recipe_name: recipe?.name,
        recipe_image: recipe?.image,
        recipe_time: recipe?.time,
        recipe_calories: String(recipe?.calories),
        is_external: Boolean(recipe?.isExternal),
        link: recipe?.link || null
      }]);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recipe: any = location.state?.generatedRecipe || dbRecipe || RECIPES_DATA.find(r => String(r.id) === id);

  useEffect(() => {
    if (recipe) {
      let amount = 2;
      let unit = '人分';
      if (recipe.tags) {
        const yieldTag = recipe.tags.find((t: string) => t.startsWith('yield:'));
        if (yieldTag) {
          const parts = yieldTag.split(':');
          if (parts.length >= 3) {
            amount = Number(parts[1]) || 2;
            unit = parts[2] || '人分';
          }
        } else {
          // 古いデータのフォールバック
          amount = Math.max(1, (recipe.time || 20) / 10);
        }
      }
      setOriginalServings(amount);
      setServings(amount);
      setServingsUnit(unit);
    }
  }, [recipe]);

  const handleAnalyzeNutrition = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("⚠️ 【APIキーが必要です】\\nAI解析を行うには、.env.local に VITE_GEMINI_API_KEY を設定してください。");
      return;
    }
    setIsAnalyzingNutrition(true);
    try {
      if (!recipe?.ingredients || recipe.ingredients.length === 0) {
        throw new Error("材料が登録されていません。");
      }
      const data = await analyzeNutritionWithGemini(apiKey, recipe.ingredients, servings);
      setNutrition(data);
    } catch (error) {
      const e = error as Error;
      alert(e.message || "栄養素解析に失敗しました");
    } finally {
      setIsAnalyzingNutrition(false);
    }
  };

  if (!recipe) return <div className="p-10 text-center text-white">Recipe not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans leading-snug pb-[100px]">
      {/* ヒーロー画像エリア */}
      <div className="relative h-80 w-full">
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-black/60"></div>

        {/* ナビゲーションバー (バックボタンなど) */}
        <div className="absolute top-0 w-full px-5 pt-12 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:bg-black/60 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3">
            {!recipe.isExternal && (
              <button 
                onClick={handleDelete} 
                className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-rose-500 hover:bg-black/60 transition-colors"
                title="削除"
              >
                <Trash2 size={20} />
              </button>
            )}
            {(!recipe.isExternal || recipe.isExternal === false) ? (
              <button 
                onClick={() => navigate(`/recipes/edit/${recipe.id}`)} 
                className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-amber-400 hover:bg-black/60 transition-colors"
                title="編集"
              >
                <Edit2 size={20} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/recipes/new', { state: { importedRecipe: recipe } })} 
                className="p-2.5 bg-amber-500/90 backdrop-blur-md rounded-full text-white hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                title="マイレシピに保存・編集"
              >
                <Save size={20} />
              </button>
            )}
            <button 
              onClick={toggleFavorite} 
              className={`p-2.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors ${isFavorite ? 'text-rose-500' : 'text-white/90'}`} 
              title="お気に入り"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={handleShare} 
              className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:bg-black/60 transition-colors" 
              title="共有"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* 料理タイトルとバッジ */}
        <div className="absolute bottom-6 left-5 right-5 z-10">
          <div className="flex gap-2 mb-3">
            {recipe.tags?.filter((tag: string) => !tag.startsWith('level:')).map((tag: string) => (
              <span key={tag} className="text-xs font-bold uppercase text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight drop-shadow-2xl">{recipe.name}</h1>
        </div>
      </div>

      {/* 詳細情報エリア */}
      <div className="px-5 pt-6 space-y-5">
        {/* ステータスバー（シンプル化） */}
        <div className="flex items-center gap-6 text-zinc-300 mb-6 px-1">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-amber-500" />
            <span className="font-bold text-lg">{recipe.calories} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="font-bold text-lg">{recipe.time} <span className="text-xs font-normal text-zinc-500">min</span></span>
          </div>
        </div>

        {/* 栄養情報分析 */}
        <div className="bg-zinc-900/40 border border-emerald-500/20 rounded-2xl p-4 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <Activity size={16} /> 栄養バランス分析（{servings}人分）
            </h3>
            {!nutrition && (
              <button
                onClick={handleAnalyzeNutrition}
                disabled={isAnalyzingNutrition}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAnalyzingNutrition ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                AIで解析
              </button>
            )}
          </div>
          
          {nutrition ? (
            <div className="space-y-3 animate-in fade-in zoom-in duration-500">
              <div className="grid grid-cols-4 gap-2 text-center pt-2">
                <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                  <div className="text-[10px] text-zinc-500 mb-1">タンパク質</div>
                  <div className="font-bold text-amber-500">{nutrition.protein}</div>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                  <div className="text-[10px] text-zinc-500 mb-1">脂質</div>
                  <div className="font-bold text-rose-400">{nutrition.fat}</div>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                  <div className="text-[10px] text-zinc-500 mb-1">炭水化物</div>
                  <div className="font-bold text-sky-400">{nutrition.carbs}</div>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-2 border border-white/5">
                  <div className="text-[10px] text-zinc-500 mb-1">食塩相当</div>
                  <div className="font-bold text-zinc-300">{nutrition.salt}</div>
                </div>
              </div>
              {nutrition.suggestions && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex gap-2">
                  <div className="shrink-0 pt-0.5"><Wand2 size={14} className="text-emerald-500" /></div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{nutrition.suggestions}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              ボタンを押すと、このレシピの材料からAIが自動で栄養素を推定して表示します！
            </p>
          )}
        </div>

        {/* 材料リスト */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bookmark size={18} className="text-amber-500" /> 材料
            </h2>
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-2 py-0.5">
              <button 
                onClick={() => setServings(s => Math.max(1, s - 1))}
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white"
              ><Minus size={14}/></button>
              <span className="font-bold text-emerald-400 text-sm w-12 text-center">{servings}{servingsUnit}</span>
              <button 
                onClick={() => setServings(s => s + 1)}
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white"
              ><Plus size={14}/></button>
            </div>
          </div>
          <div className="space-y-0.5">
            {recipe.ingredients.map((ing: string, i: number) => {
              // グループ見出し（■から始まる）の場合
              if (ing.startsWith('■')) {
                const groupName = ing.replace(/^■\s*/, '');
                return (
                  <div key={i} className="mt-2 mb-0.5 first:mt-0 flex items-center gap-2">
                    <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-amber-400 font-bold text-xs tracking-wide">{groupName}</span>
                  </div>
                );
              }

              const parts = ing.split(' ');
              // 数量・単位がスペース区切りになっていれば最後尾を取り出して右寄せにする
              let quantity = parts.length > 1 ? parts.pop() || '' : '';
              const name = parts.join(' ');
              
              // 数量の動的計算（表示人数が元の出来上がり量と異なる場合）
              if (servings !== originalServings && quantity) {
                const regex = /^([\d\.]+)(.*)$/;
                const match = quantity.replace(/[０-９]/g, function (s) {
                    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
                }).match(regex);

                if (match) {
                  const num = parseFloat(match[1]);
                  const unit = match[2];
                  if (!isNaN(num)) {
                    const scaled = (num * servings) / originalServings;
                    quantity = `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}${unit}`;
                  }
                } else if (quantity.includes('/')) {
                   const fracMatch = quantity.match(/^(\d+)\/(\d+)(.*)$/);
                   if (fracMatch) {
                     const num = parseInt(fracMatch[1]);
                     const den = parseInt(fracMatch[2]);
                     const unit = fracMatch[3];
                     const scaled = ((num/den) * servings) / originalServings;
                     quantity = `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}${unit}`;
                   }
                }
              }

              return (
                <div key={i} className="flex justify-between items-center bg-zinc-900/20 py-0.5 px-2.5 rounded-lg border border-white/5">
                  <span className="text-zinc-300 font-medium text-[13px]">{name || ing}</span>
                  {quantity && <span className="text-zinc-400 font-bold ml-auto text-right tracking-wider text-[13px]">{quantity}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 作り方手順 */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Compass size={18} className="text-amber-500" /> 作り方
          </h2>
          <div className="space-y-3">
            {recipe.instructions.map((stepStr: string, i: number) => {
              let stepText = stepStr;
              let stepImg = null;
              try {
                const p = JSON.parse(stepStr);
                stepText = p.text || stepStr;
                stepImg = p.image || null;
              } catch(e) {
                stepText = stepStr;
              }

              // '1. ' などを削除
              const cleanText = stepText.replace(/^\d+\.\s*/, '');

              return (
                <div key={i} className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-grow pt-1 space-y-3">
                    <p className="text-zinc-300 leading-relaxed">{cleanText}</p>
                    {stepImg && (
                      <div className="rounded-xl overflow-hidden border border-white/5 shadow-lg w-full">
                        <img src={stepImg} alt={`Step ${i + 1}`} className="w-full h-auto max-h-[250px] object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. レシピ作成・編集画面 - New Recipe Edit Screen
// -------------------------------------------------------------
const RecipeEditScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // idがあれば「編集」、なければ「新規作成」扱い
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [yieldAmount, setYieldAmount] = useState('2');
  const [yieldUnit, setYieldUnit] = useState('人分');
  const [cookingTime, setCookingTime] = useState('20');
  const [calories, setCalories] = useState('0'); // カロリーのStateを追加
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<{ base64: string, mimeType: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // カテゴリーとタグの選択状態
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [level, setLevel] = useState('Novice');
  
  const GENRES = getSettings('genres', DEFAULT_GENRES);
  const TAGS = getSettings('tags', DEFAULT_TAGS);
  const UNITS = getSettings('units', DEFAULT_UNITS);
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };


  // 材料のデータ構造を変更: 名前、量、単位、グループフラグ
  const [ingredients, setIngredients] = useState<Array<{ name: string, quantity: string, unit: string, isGroupHeader?: boolean }>>([
    { name: '', quantity: '', unit: 'g' }
  ]);
  // 作り方のデータ構造変更: テキストと画像
  const [instructions, setInstructions] = useState<Array<{ text: string, image: string | null }>>([
    { text: '', image: null }
  ]);

  // マウント時に既存レシピデータを取得 (編集モード時、またはAIからインポート時)
  useEffect(() => {
    const passedRecipe = location.state?.importedRecipe;
    if (passedRecipe) {
        setTitle(passedRecipe.name || '');
        if (passedRecipe.image) setRecipeImage(passedRecipe.image);
        setCalories(String(passedRecipe.calories !== '-' ? passedRecipe.calories : 0));
        
        let amount = '2';
        let unit = '人分';
        if (passedRecipe.tags) {
           const yieldTag = passedRecipe.tags.find((t: string) => t.startsWith('yield:'));
           if (yieldTag) {
              const parts = yieldTag.split(':');
              if (parts.length >= 3) {
                 amount = parts[1] || '2';
                 unit = parts[2] || '人分';
              }
           } else {
              amount = String(Math.max(1, (passedRecipe.time || 20) / 10));
           }
        }
        setYieldAmount(amount);
        setYieldUnit(unit);
        setCookingTime(String(passedRecipe.time || 20));
        
        if (passedRecipe.tags) {
           const lvl = passedRecipe.tags.find((t: string) => t.startsWith('level:'));
           if (lvl) setLevel(lvl.replace('level:', ''));
           setSelectedTags(passedRecipe.tags.filter((t: string) => !t.startsWith('level:') && t !== 'AI提案' && t !== '外部生成'));
        }
        
        if (passedRecipe.ingredients && passedRecipe.ingredients.length > 0) {
           setIngredients(passedRecipe.ingredients.map((ing: string) => {
             if (ing.startsWith('■')) {
               return { name: ing.replace(/^■\s*/, ''), quantity: '', unit: '', isGroupHeader: true };
             }
             
             // Extract quantity and unit
             const parts = ing.split(' ');
             let q = '';
             let u = '';
             let n = ing;
             if (parts.length > 1) {
                const last = parts.pop() || '';
                n = parts.join(' ');
                const match = last.match(/^([\d\.\/]+)(.*)$/);
                if (match) {
                   q = match[1];
                   u = match[2] || '';
                } else {
                   q = last;
                }
             }
             return { name: n, quantity: q, unit: u || '個' }; // Fallback unit
           }));
        }
        
        if (passedRecipe.instructions && passedRecipe.instructions.length > 0) {
           setInstructions(passedRecipe.instructions.map((inst: string) => {
             try {
               const p = JSON.parse(inst);
               return { text: p.text || inst, image: p.image || null };
             } catch(e) {
               return { text: inst.replace(/^\d+\.\s*/, ''), image: null };
             }
           }));
        }
        return; // Skip normal DB fetch if we loaded from state
    }

    if (isEditing && id) {
       if (id.length > 10) {
          supabase.from('recipes').select('*').eq('id', id).single().then(({ data }) => {
             if (data) {
                setTitle(data.name);
                if (data.image) setRecipeImage(data.image);
                setCalories(String(data.calories || 0));
                
                let amount = '2';
                let unit = '人分';
                if (data.tags) {
                   const yieldTag = data.tags.find((t: string) => t.startsWith('yield:'));
                   if (yieldTag) {
                      const parts = yieldTag.split(':');
                      if (parts.length >= 3) {
                         amount = parts[1] || '2';
                         unit = parts[2] || '人分';
                      }
                   } else {
                      amount = String(Math.max(1, (data.time || 20) / 10));
                   }
                }
                setYieldAmount(amount);
                setYieldUnit(unit);
                setCookingTime(String(data.time || 20));
                
                if (data.tags) {
                   const lvl = data.tags.find((t: string) => t.startsWith('level:'));
                   if (lvl) setLevel(lvl.replace('level:', ''));
                   setSelectedTags(data.tags.filter((t: string) => !t.startsWith('level:') && !t.startsWith('yield:')));
                }
                if (data.ingredients) {
                   setIngredients(data.ingredients.map((ing: string) => {
                     if (ing.startsWith('■')) {
                       return { name: ing.replace(/^■\s*/, ''), quantity: '', unit: '', isGroupHeader: true };
                     }
                     return { name: ing, quantity: '', unit: '' };
                   }));
                }
                if (data.instructions) {
                   setInstructions(data.instructions.map((inst: string) => {
                     try {
                       const p = JSON.parse(inst);
                       return { text: p.text || inst, image: p.image || null };
                     } catch(e) {
                       return { text: inst, image: null };
                     }
                   }));
                }
             }
          });
       } else {
          // モックデータの編集
          const mock = RECIPES_DATA.find(r => String(r.id) === id);
          if (mock) {
             setTitle(mock.name);
             if (mock.image) setRecipeImage(mock.image);
             setCalories(String(mock.calories));
             let amount = '2';
             let unit = '人分';
             if (mock.tags) {
                const yieldTag = mock.tags.find((t: string) => t.startsWith('yield:'));
                if (yieldTag) {
                   const parts = yieldTag.split(':');
                   if (parts.length >= 3) {
                      amount = parts[1] || '2';
                      unit = parts[2] || '人分';
                   }
                } else {
                   amount = String(Math.max(1, (mock.time || 20) / 10));
                }
             }
             setYieldAmount(amount);
             setYieldUnit(unit);
             setCookingTime(String(mock.time || 20));

             const lvl = mock.tags.find((t: string) => t.startsWith('level:'));
             if (lvl) setLevel(lvl.replace('level:', ''));
             setSelectedTags(mock.tags.filter((t: string) => !t.startsWith('level:') && !t.startsWith('yield:')));
             setIngredients(mock.ingredients.map((ing: string) => {
                if (ing.startsWith('■')) {
                  return { name: ing.replace(/^■\s*/, ''), quantity: '', unit: '', isGroupHeader: true };
                }
                return { name: ing, quantity: '', unit: '' };
             }));
             setInstructions(mock.instructions.map((inst: string) => {
               try {
                 const p = JSON.parse(inst);
                 return { text: p.text || inst, image: p.image || null };
               } catch(e) {
                 return { text: inst, image: null };
               }
             }));
          }
       }
    }
  }, [id, isEditing]);

  const handleAddInstruction = () => {
    setInstructions([...instructions, { text: '', image: null }]);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);
  };

  const handleAddIngredientGroup = () => {
    setIngredients([...ingredients, { name: '【A】', quantity: '', unit: '', isGroupHeader: true }]);
  };

  const handleIngredientChange = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };


  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('target' in e && e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    if (draggedItemIndex !== null && dragOverItemIndex !== null && draggedItemIndex !== dragOverItemIndex) {
      setIngredients(prev => {
        const newArr = [...prev];
        const item = newArr[draggedItemIndex];
        newArr.splice(draggedItemIndex, 1);
        newArr.splice(dragOverItemIndex, 0, item);
        return newArr;
      });
    }
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // スクロールを防止
    // e.preventDefault(); // Note: cannot call preventDefault on passive touch move in React 19 easily, best handled via CSS touch-action: none
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const itemDiv = targetElement?.closest('[data-index]');
    if (itemDiv) {
      const dropIndex = Number(itemDiv.getAttribute('data-index'));
      setDragOverItemIndex(dropIndex);
    }
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleInstructionTextChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index].text = value;
    setInstructions(newInstructions);
  };

  const handleInstructionImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let { width, height } = img;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          if (resizedBase64.length > 600000) {
            alert('写真のデータ量が大きすぎます（保存制限オーバー）。別の写真をお試しください。');
            URL.revokeObjectURL(objectUrl);
            e.target.value = '';
            return;
          }
          const newInstructions = [...instructions];
          newInstructions[index].image = resizedBase64;
          setInstructions(newInstructions);
        }
        URL.revokeObjectURL(objectUrl);
        e.target.value = '';
      };
      
      img.onerror = () => {
        alert('画像の読み込みに失敗しました。別の画像をお試しください。');
        URL.revokeObjectURL(objectUrl);
        e.target.value = '';
      };
      
      img.src = objectUrl;
    }
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length === 1) return;
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);

  const handleAutoCalculateCalories = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("⚠️ 【APIキーが必要です】\n実際のAI解析を行うには、.env.local に VITE_GEMINI_API_KEY を設定してください。");
      return;
    }
    if (ingredients.filter(i => !i.isGroupHeader && i.name).length === 0) {
      alert("材料を入力してからAI計算をお試しください");
      return;
    }
    
    setIsCalculatingCalories(true);
    try {
      const totalKcal = await calculateCaloriesWithGemini(apiKey, ingredients);
      // 出来上がり人数で割って「1人分」にする
      const persons = Number(yieldAmount) || 1;
      const finalKcal = Math.round(totalKcal / persons);
      
      setCalories(String(finalKcal > 0 ? finalKcal : 0));
    } catch (error) {
      const e = error as Error;
      console.error(e);
      alert(e.message || "カロリー計算に失敗しました");
    } finally {
      setIsCalculatingCalories(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('料理名を入力してください！');
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('レシピを保存するにはログイン（サインイン）が必要です。設定画面からログインしてください！');
      return;
    }

    try {
      const cleanTags = selectedTags.filter(t => !t.startsWith('level:') && !t.startsWith('yield:'));
      const recipeToSave = {
        user_id: session.user.id,
        name: title,
        calories: Number(calories) || 0,
        time: Number(cookingTime) || 20,
        tags: [...cleanTags, `level:${level}`, `yield:${yieldAmount}:${yieldUnit}`],
        ingredients: ingredients.map(ing => 
          ing.isGroupHeader ? `■ ${ing.name}` : `${ing.name} ${ing.quantity}${ing.unit}`.trim()
        ),
        instructions: instructions.map(inst => JSON.stringify({text: inst.text, image: inst.image})),
        image: recipeImage || 'https://images.unsplash.com/photo-1544025162-8316c0b31e13?auto=format&fit=crop&q=80&w=400&h=400'
      };

      if (isEditing && id && id.length > 10) {
        const { data, error } = await supabase.from('recipes').update(recipeToSave).eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('変更が保存されませんでした。他のユーザーが作成したレシピは編集できない可能性があります。');
        }
        alert('レシピを更新しました！');
      } else {
        const { error } = await supabase.from('recipes').insert([recipeToSave]);
        if (error) throw error;
        alert('クラウドにレシピを保存しました！');
      }
      
      navigate('/recipes');
    } catch (error) {
      const e = error as Error;
      console.error(e);
      alert('保存に失敗しました: ' + e.message);
    }
  };

  const handleMagicImport = async () => {
    if ((!importText.trim() && !importFile) || isImporting) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("⚠️ 【APIキーが必要です】\n実際のAI解析を行うには、.env.local に VITE_GEMINI_API_KEY を設定してください。\nGoogle AI Studio から無料で取得できます。");
      return;
    }

    setIsImporting(true);
    try {
      const parsedData = await parseRecipeWithGemini(apiKey, importText, importFile || undefined);
      
      if (parsedData.title) setTitle(parsedData.title);
      if (parsedData.ingredients && Array.isArray(parsedData.ingredients)) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         setIngredients(parsedData.ingredients.map((ing: any) => ({
            name: ing.name || '不明な材料',
            quantity: String(ing.quantity || ''),
            unit: ing.unit || ''
         })));
      }
      if (parsedData.instructions && Array.isArray(parsedData.instructions)) {
         setInstructions(parsedData.instructions.map((inst: string) => ({
            text: String(inst),
            image: null
         })));
      }
      setIsImportModalOpen(false);
      setImportText('');
      setImportFile(null);
    } catch (error) {
      const e = error as Error;
      console.error(e);
      alert(e.message || "AI解析に失敗しました...");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans leading-snug pb-[100px] relative">
      {/* ヘッダー */}
      <div className="px-5 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold">
            {isEditing ? 'レシピを編集' : '新しいレシピを作る'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-lg active:scale-95 text-sm flex items-center gap-1.5"
        >
          <Save size={16} /> 保存
        </button>
      </div>

      {/* マジックインポートボタン (AIインポート) */}
      <div className="px-5 mt-4">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full relative overflow-hidden rounded-2xl p-[1px] group active:scale-[0.98] transition-all"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity"></span>
          <div className="relative bg-zinc-900/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2">
            <Wand2 className="text-amber-400" size={18} />
            <span className="font-bold text-sm text-zinc-100">サイトのURLやメモからAI自動入力</span>
          </div>
        </button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* 写真アップロード */}
        <div>
          <label className="cursor-pointer w-full aspect-[4/3] bg-zinc-900/60 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800/60 hover:border-amber-500/30 transition-all text-zinc-500 hover:text-amber-400 group overflow-hidden relative">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (!file) return;
                 if (!file.type.startsWith('image/')) {
                   alert('画像ファイルを選択してください');
                   return;
                 }
                 const img = new Image();
                 const objectUrl = URL.createObjectURL(file);
                 
                 img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 500; // データベース保存用に圧縮
                    let { width, height } = img;
                    if (width > height && width > MAX_SIZE) {
                      height *= MAX_SIZE / width; width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                      width *= MAX_SIZE / height; height = MAX_SIZE;
                    }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(img, 0, 0, width, height);
                      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                      if (resizedBase64.length > 600000) {
                        alert('メイン写真のデータ量が大きすぎます（保存制限オーバー）。別の写真をお試しください。');
                        URL.revokeObjectURL(objectUrl);
                        e.target.value = '';
                        return;
                      }
                      setRecipeImage(resizedBase64);
                    }
                    URL.revokeObjectURL(objectUrl);
                    e.target.value = '';
                 };
                 
                 img.onerror = () => {
                   alert('画像の読み込みに失敗しました。別の画像をお試しください。');
                   URL.revokeObjectURL(objectUrl);
                   e.target.value = '';
                 };
                 
                 img.src = objectUrl;
              }}
            />
            {recipeImage ? (
               <img src={recipeImage} alt="Recipe" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
               <>
                 <div className="p-4 bg-zinc-800/80 rounded-full group-hover:bg-amber-500/10 group-hover:scale-110 transition-all duration-300">
                   <Camera size={32} />
                 </div>
                 <span className="text-sm font-medium">料理の写真をアップロード</span>
               </>
            )}
          </label>
        </div>

        {/* 基本情報（タイトル、時間など） */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recipe Name / 料理名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="とろける黒毛和牛のシチュー..."
              className="w-full bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 truncate">Yield / 出来上がり</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/80" />
                  <input
                    type="number"
                    value={yieldAmount}
                    onChange={e => setYieldAmount(e.target.value)}
                    placeholder="2"
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-xl pl-11 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500/50 shadow-inner"
                  />
                </div>
                <select
                  value={yieldUnit}
                  onChange={e => setYieldUnit(e.target.value)}
                  className="bg-zinc-800 border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500/50 shadow-inner min-w-[70px]"
                >
                  <option value="人分">人分</option>
                  {UNITS.map((u: string) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="truncate">Calories / 1人分</span>
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
                  <Flame size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${Number(calories) > 0 ? 'text-amber-500' : 'text-amber-500/50'}`} />
                  <input
                    type="number"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 shadow-inner"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalculateCalories}
                  disabled={isCalculatingCalories}
                  className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-500 border border-amber-500/30 rounded-xl px-2 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0 text-xs font-bold"
                  title="AIでカロリー自動計算"
                >
                  {isCalculatingCalories ? <Loader2 size={16} className="animate-spin" /> : <><Wand2 size={14} className="mr-1" /> AI</>}
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 truncate">Time (m)</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  value={cookingTime}
                  onChange={e => setCookingTime(e.target.value)}
                  placeholder="15"
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* カテゴリーとタグの選択 */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Level選択 */}
          <div className="col-span-2 sm:col-span-1">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Level / 難易度</label>
             <div className="relative">
               <select
                 value={level}
                 onChange={e => setLevel(e.target.value)}
                 className="w-full bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/30 shadow-inner appearance-none relative z-10"
               >
                 <option value="Novice">Novice / 初心者</option>
                 <option value="Chef">Chef / 中級者</option>
                 <option value="Master">Master / 上級者</option>
                 <option value="God">God / 神</option>
               </select>
               <ChevronRight size={16} className="text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 z-0" />
             </div>
          </div>
          {/* カテゴリー選択ボタン */}
          <div className="col-span-2 sm:col-span-1">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Category / ジャンル</label>
             <button 
               onClick={() => setIsCategoryModalOpen(true)} 
               className="w-full bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-2.5 text-left flex justify-between items-center text-sm shadow-inner transition-colors hover:border-amber-500/30"
             >
                <span className={selectedCategory ? "text-white font-bold" : "text-zinc-600"}>{selectedCategory || "未選択"}</span>
                <ChevronRight size={16} className="text-zinc-500" />
             </button>
          </div>
          {/* タグ選択ボタン */}
          <div className="col-span-2">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Tags ({selectedTags.length})</label>
             <button 
               onClick={() => setIsTagModalOpen(true)} 
               className="w-full bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-2.5 text-left flex justify-between items-center text-sm shadow-inner transition-colors hover:border-amber-500/30"
             >
                <span className={selectedTags.length > 0 ? "text-white font-bold truncate pr-2" : "text-zinc-600"}>{selectedTags.length ? selectedTags.join(', ') : "未選択"}</span>
                <ChevronRight size={16} className="text-zinc-500 shrink-0" />
             </button>
          </div>
        </div>

        {/* 材料リストの編集 */}
        <div>
          <label className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            <span>Ingredients / 材料</span>
            <span className="text-amber-500 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-sm">必須</span>
          </label>
          <div className="space-y-1.5">
            {ingredients.map((ing, i) => (
              <div 
                key={`ing-${i}`} 
                data-index={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragEnter={(e) => handleDragEnter(e, i)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, i)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                className={`flex items-center gap-1.5 transition-all outline-none ${dragOverItemIndex === i ? 'border-t-2 border-t-amber-500 pt-2 opacity-50' : ''} ${ing.isGroupHeader ? 'mt-3 border-b border-amber-500/20 pb-1.5' : ''}`}
              >
                <div className="flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 p-1.5 rounded-md touch-none">
                  <GripVertical size={16} />
                </div>
                <button type="button" onClick={() => handleRemoveIngredient(i)} className="text-zinc-600 hover:text-rose-500 transition-colors p-1 shrink-0"><X size={16} /></button>
                
                {ing.isGroupHeader ? (
                  <div className="flex-grow flex items-center relative">
                    <div className="w-1.5 h-3.5 bg-amber-500 rounded-full mr-2"></div>
                    <input
                      type="text"
                      value={ing.name}
                      onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                      placeholder="例: 【A】 合わせ調味料"
                      className="flex-grow min-w-0 bg-transparent border-none text-amber-500 font-bold focus:outline-none placeholder-amber-500/30 text-sm py-1"
                    />
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={ing.name}
                      onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                      placeholder="例: 牛肉"
                      className="flex-grow min-w-0 bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={e => handleIngredientChange(i, 'quantity', e.target.value)}
                      placeholder="200"
                      className="w-16 bg-zinc-900/50 border border-white/10 rounded-lg px-1.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 text-center"
                    />
                    <select
                      value={ing.unit}
                      onChange={e => handleIngredientChange(i, 'unit', e.target.value)}
                      className="bg-zinc-800 border border-white/10 rounded-lg px-1.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500 w-[60px] shrink-0"
                    >
                      {UNITS.map((u: string) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </>
                )}
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleAddIngredient}
                className="flex items-center gap-1.5 text-amber-500/80 hover:text-amber-400 text-sm font-bold transition-colors"
              >
                <PlusCircle size={14} /> 材料を追加
              </button>
              <button
                onClick={handleAddIngredientGroup}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm font-bold transition-colors"
              >
                <List size={14} /> 見出し(グループ)を追加
              </button>
            </div>
          </div>
        </div>

        {/* 作り方の編集 */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
            Instructions / 作り方
          </label>
          <div className="space-y-3">
            {instructions.map((step, i) => (
              <div key={`step-${i}`} className="flex gap-3 items-start bg-zinc-900/20 p-3 rounded-2xl border border-white/5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs mt-1">
                  {i + 1}
                </div>
                <div className="flex-grow space-y-2">
                  <textarea
                    rows={2}
                    value={step.text}
                    onChange={e => handleInstructionTextChange(i, e.target.value)}
                    placeholder="強火で表面をこんがりと焼きます..."
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 resize-none shadow-inner"
                  />
                  {/* 作り方の写真追加枠 */}
                  {/* 作り方の写真プレビューまたは追加枠 */}
                  <label className="w-full min-h-[4rem] bg-zinc-900/60 border border-dashed border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 hover:bg-zinc-800/60 hover:border-amber-500/30 transition-all text-zinc-500 hover:text-amber-400 cursor-pointer">
                    {step.image ? (
                      <div className="relative w-full">
                        <img src={step.image} alt="Step" className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full flex items-center gap-1"><Camera size={14}/> 画像を変更</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 w-full gap-2">
                        <Camera size={18} />
                        <span className="text-xs font-medium">工程の写真を添付</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => handleInstructionImageChange(i, e)}
                    />
                  </label>
                </div>
                <button onClick={() => handleRemoveInstruction(i)} className="text-zinc-600 hover:text-rose-500 transition-colors mt-2 p-1"><X size={18} /></button>
              </div>
            ))}
            <button
              onClick={handleAddInstruction}
              className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 text-sm font-bold transition-colors"
            >
              <PlusCircle size={16} /> 手順を追加する
            </button>
          </div>
        </div>
      </div>

      {/* AIインポート用モーダル */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <LinkIcon size={18} className="text-amber-500" />
              Smart Import
            </h3>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              レシピのインターネットURL、手書きのメモ、または**料理本の写真やPDFファイル**からAIが全項目を自動で入力します。
            </p>

            <div className="mb-3">
              <label className="w-full bg-zinc-800/80 border border-dashed border-white/20 hover:border-amber-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded-xl py-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                <div className="flex gap-2 mb-1">
                  <ScanLine size={18} />
                  <FileText size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider">画像やPDF（電子ファイル）から読み込む</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const isPdf = file.name.toLowerCase().endsWith('.pdf');
                    setImportText(`${isPdf ? '📄 PDFファイル' : '📷 画像ファイル'}をセットしました。\n下の解析ボタンを押してAIによる読み取りを開始してください。`);
                    
                    if (isPdf) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        setImportFile({ base64: base64Data, mimeType: file.type || 'application/pdf' });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      // 画像の場合はCanvasでリサイズ（API制限・通信エラー防止のため縮小）
                      const img = new Image();
                      const objectUrl = URL.createObjectURL(file);
                      img.onload = () => {
                        URL.revokeObjectURL(objectUrl);
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 1200;
                        let { width, height } = img;
                        if (width > height && width > MAX_SIZE) {
                          height *= MAX_SIZE / width;
                          width = MAX_SIZE;
                        } else if (height > MAX_SIZE) {
                          width *= MAX_SIZE / height;
                          height = MAX_SIZE;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        // 軽量なJPEGに変換
                        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                        setImportFile({ base64: resizedBase64, mimeType: 'image/jpeg' });
                      };
                      img.src = objectUrl;
                    }
                  }}
                />
              </label>
            </div>

            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="または、ここに文字を直接ペースト！&#13;&#10;例：&#13;&#10;絶品チャーハン&#13;&#10;ご飯 200g"
              className="w-full h-32 bg-zinc-800/50 border border-white/5 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 resize-none shadow-inner mb-4 custom-scrollbar"
            />
            <button
              onClick={handleMagicImport}
              disabled={(!importText.trim() && !importFile) || isImporting}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isImporting ? 'AIが解析中...' : 'この記述・URL・ファイルで解析する'}
            </button>
          </div>
        </div>
      )}
      
      {/* カテゴリー選択モーダル */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-t border-white/10 w-full max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl relative translate-y-0 animate-in slide-in-from-bottom-full duration-300 pb-28">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Category / ジャンル</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {GENRES.map((genre: string) => (
                <button 
                  key={`modal-cat-${genre}`}
                  onClick={() => {
                    setSelectedCategory(genre);
                    setIsCategoryModalOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedCategory === genre 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-900/40' 
                      : 'bg-zinc-800 border border-white/5 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* タグ選択モーダル */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-t border-white/10 w-full max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl relative translate-y-0 animate-in slide-in-from-bottom-full duration-300 pb-28">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>Tags / 特殊なタグ</span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 font-medium tracking-wide">
                  {selectedTags.length}個選択中
                </span>
              </h3>
              <button 
                onClick={() => setIsTagModalOpen(false)} 
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mb-4">
              {TAGS.map((tag: string) => (
                <button 
                  key={`modal-tag-${tag}`}
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedTags.includes(tag) 
                      ? 'bg-zinc-700 text-amber-300 border border-amber-500/50 shadow-inner' 
                      : 'bg-zinc-800 border border-white/5 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {selectedTags.includes(tag) && <span>✓</span>}
                  {tag}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsTagModalOpen(false)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all text-sm"
            >
              決定する
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// -------------------------------------------------------------
// X. ログイン画面 - Login Screen
// -------------------------------------------------------------
const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/profile');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('登録が完了しました！');
        navigate('/profile');
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans leading-snug pb-[120px] px-8 relative">
        <button onClick={() => navigate(-1)} className="absolute top-16 left-6 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-800/50 backdrop-blur-md transition-colors">
          <ArrowLeft size={20} />
        </button>

        <div className="pt-32 pb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4">
             <KeyRound size={40} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-rose-400">
            {isLogin ? 'おかえりなさい' : 'アカウント作成'}
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">
            {isLogin ? 'アカウントにログインしてレシピを管理' : '新しいシェフとして参加しましょう'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">メールアドレス</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@example.com"
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors placeholder-zinc-600"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">パスワード</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6文字以上のパスワード"
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors placeholder-zinc-600"
            />
          </div>

          {errorMsg && <p className="text-rose-500 text-sm font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{errorMsg}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all text-lg flex justify-center mt-8 items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> 処理中...</> : (isLogin ? 'ログイン' : '登録する')}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
          className="mt-8 text-sm text-zinc-400 font-medium hover:text-amber-400 transition-colors w-full text-center p-3 rounded-xl hover:bg-zinc-900"
        >
          {isLogin ? 'アカウントをお持ちでない場合はこちらから登録' : '既にアカウントをお持ちの場合はこちらからログイン'}
        </button>
      </div>
  );
};

// -------------------------------------------------------------
// 4. プロフィールメニュー画面 - Profile Menu Screen
// -------------------------------------------------------------
const ProfileMenuScreen = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans leading-snug pb-[120px] relative px-5">
      {/* Header Profile Info */}
      <div className="pt-20 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-amber-500/50 shadow-lg shadow-amber-900/20 overflow-hidden">
             {session?.user?.user_metadata?.avatar_url ? (
               <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={32} className="text-amber-500" />
             )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
              {session?.user?.user_metadata?.full_name || (session ? session.user.email.split('@')[0] : 'Guest')}
            </h1>
            <p className="text-xs text-zinc-500 font-medium tracking-wide mt-1">
              {session ? session.user.email : '未ログイン / アカウント未設定'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-5 space-y-3">
        {/* SignIn or SignOut */}
        {!session ? (
          <button 
             className="w-full flex items-center justify-between bg-zinc-900/60 border border-white/5 p-4 py-5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-inner cursor-pointer"
             onClick={() => navigate('/login')}
          >
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-sm"><LogIn size={20} /></div>
               <span className="font-bold text-sm tracking-wide text-zinc-200">サインイン / ログイン</span>
             </div>
             <ChevronRight size={18} className="text-zinc-500" />
          </button>
        ) : (
          <button 
             className="w-full flex items-center justify-between bg-zinc-900/60 border border-white/5 p-4 py-5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-inner cursor-pointer"
             onClick={handleLogout}
          >
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 shadow-sm"><LogOut size={20} /></div>
               <span className="font-bold text-sm tracking-wide text-zinc-200">ログアウト</span>
             </div>
             <ChevronRight size={18} className="text-zinc-500" />
          </button>
        )}

        {/* Edit Profile / プロフィール編集 */}
        <button 
           className="w-full flex items-center justify-between bg-zinc-900/60 border border-white/5 p-4 py-5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-inner cursor-pointer"
           onClick={() => navigate('/profile/edit')}
        >
           <div className="flex items-center gap-4">
             <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shadow-sm"><UserCircle size={20} /></div>
             <span className="font-bold text-sm tracking-wide text-zinc-200">プロフィール編集</span>
           </div>
           <ChevronRight size={18} className="text-zinc-500" />
        </button>

        {/* Settings / 設定 */}
        <button 
           className="w-full flex items-center justify-between bg-zinc-900/60 border border-white/5 p-4 py-5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-inner cursor-pointer"
           onClick={() => navigate('/settings')}
        >
           <div className="flex items-center gap-4">
             <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 shadow-sm"><Settings size={20} /></div>
             <span className="font-bold text-sm tracking-wide text-zinc-200">設定</span>
           </div>
           <ChevronRight size={18} className="text-zinc-500" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. プロフィール編集画面 - Profile Edit Screen
// -------------------------------------------------------------
const ProfileEditScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || '');
        setDisplayName(session.user.user_metadata?.full_name || '');
        setAvatarBase64(session.user.user_metadata?.avatar_url || null);
      } else {
        alert('ログインが必要です。');
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarBase64(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: any = {
        data: { full_name: displayName, avatar_url: avatarBase64 }
      };
      if (password.trim() !== '') {
        updates.password = password;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        alert('エラーが発生しました: ' + error.message);
      } else {
        alert('プロフィールを更新しました。');
        navigate('/profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans leading-snug pb-[120px] relative">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-20 flex flex-col">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
            プロフィール編集
          </h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1 pl-11">表示名やアカウント情報を変更できます。</p>
      </div>

      <div className="px-5 pt-5 space-y-7">
        <div className="flex flex-col items-center mb-4">
           <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center shadow-lg">
             {avatarBase64 ? (
               <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={40} className="text-zinc-500" />
             )}
           </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">
            表示名 <span className="text-zinc-500 font-normal text-xs ml-1">（例：●● ●●）</span>
          </label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="●● ●●"
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500/50 shadow-inner transition-colors placeholder-zinc-600"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">
            メールアドレス <span className="text-zinc-500 font-normal text-xs ml-1">（読み取り専用）</span>
          </label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-400 font-medium cursor-not-allowed shadow-inner transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">パスワード</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="変更する場合のみ入力"
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-4 pr-16 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500/50 shadow-inner transition-colors placeholder-zinc-600"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500/80 hover:text-amber-400 transition-colors"
            >
              {showPassword ? "隠す" : "表示"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">アイコン画像</label>
          <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl p-1.5 shadow-inner">
            <label className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold px-4 py-3 rounded-lg cursor-pointer transition-colors shadow-sm">
              ファイルを選択
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
            <span className="text-xs text-zinc-500 font-medium truncate pr-2">
              {selectedFile ? selectedFile.name : "ファイル未選択"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-10 flex gap-4">
        <button onClick={() => navigate(-1)} className="flex-1 bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 text-zinc-300 font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm">
          キャンセル
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_8px_30px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
          保存
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. 設定画面 - Settings Screen
// -------------------------------------------------------------
const SettingsScreen = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [ingredients, setIngredients] = useState(() => getSettings('ingredients', DEFAULT_INGREDIENTS));
  const [genres, setGenres] = useState(() => getSettings('genres', DEFAULT_GENRES));
  const [tags, setTags] = useState(() => getSettings('tags', DEFAULT_TAGS));
  const [units, setUnits] = useState(() => getSettings('units', DEFAULT_UNITS));

  // モックエディター用のステート
  const [editingItem, setEditingItem] = useState<{ id: string; title: string; items: string[] } | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const handleEdit = (id: string, title: string, defaultItems: string[]) => {
    setEditingItem({ id, title, items: defaultItems.slice() });
  };

  const handleAddItem = () => {
    if (newItemText.trim() && editingItem) {
      setEditingItem({ ...editingItem, items: [...editingItem.items, newItemText.trim()] });
      setNewItemText('');
    }
  };

  const handleDeleteItem = (idx: number) => {
    if (editingItem) {
      const newItems = editingItem.items.filter((_, i) => i !== idx);
      setEditingItem({ ...editingItem, items: newItems });
    }
  };

  const handleSaveItems = () => {
    if (!editingItem) return;
    saveSettings(editingItem.id, editingItem.items);
    if (editingItem.id === 'ingredients') setIngredients(editingItem.items);
    if (editingItem.id === 'genres') setGenres(editingItem.items);
    if (editingItem.id === 'tags') setTags(editingItem.items);
    if (editingItem.id === 'units') setUnits(editingItem.items);
    
    alert(`${editingItem.title}の設定をデバイスに保存しました！`);
    setEditingItem(null);
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans leading-snug pb-[120px] relative px-5 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header Info */}
      <div className={`pt-12 pb-6 border-b sticky top-0 z-20 backdrop-blur-xl ${theme === 'dark' ? 'border-white/5 bg-[#09090b]/80' : 'border-black/5 bg-white/90'}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">
              設定
            </h1>
          </div>
        </div>
      </div>

      <div className="pt-5 space-y-5">
        
        {/* Theme Settings */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>画面表示</h2>
          <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
            <button onClick={() => setTheme('dark')} className={`w-full flex items-center justify-between p-4 py-4 border-b transition-all active:bg-black/5 ${theme === 'dark' ? 'border-white/5 bg-amber-500/10' : 'border-black/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}><Moon size={20} /></div>
                <span className={`font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>ダークモード</span>
              </div>
              {theme === 'dark' && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
            </button>
            <button onClick={() => setTheme('light')} className={`w-full flex items-center justify-between p-4 py-4 transition-all active:bg-black/5 ${theme === 'light' ? 'bg-amber-500/10' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}><Sun size={20} /></div>
                <span className={`font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>ライトモード</span>
              </div>
              {theme === 'light' && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
            </button>
          </div>
          {theme === 'light' && <p className="text-xs text-rose-500 mt-2 font-bold px-1 animate-pulse">※システム全体はダークモード専用設計のため、他画面のライト対応は今後のアップデートとなります。</p>}
        </div>

        {/* Customized Data */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>データ管理</h2>
          <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
            <button onClick={() => handleEdit('ingredients', '食材の追加・削除', ingredients)} className={`w-full flex items-center justify-between p-4 py-4 border-b transition-all ${theme === 'dark' ? 'border-white/5 hover:bg-zinc-800 active:bg-zinc-800/80' : 'border-black/5 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600'}`}><List size={20} /></div>
                <div className="text-left w-full overflow-hidden">
                  <span className={`block font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}>よく使う食材</span>
                  <span className={`block text-[10px] mt-1 pr-4 line-clamp-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{ingredients.join('、') || '未登録'}</span>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => handleEdit('genres', 'カテゴリの追加・削除', genres)} className={`w-full flex items-center justify-between p-4 py-4 border-b transition-all ${theme === 'dark' ? 'border-white/5 hover:bg-zinc-800 active:bg-zinc-800/80' : 'border-black/5 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-600'}`}><FolderPlus size={20} /></div>
                <div className="text-left w-full overflow-hidden">
                  <span className={`block font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}>カテゴリの管理</span>
                  <span className={`block text-[10px] mt-1 pr-4 line-clamp-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{genres.join('、') || '未登録'}</span>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => handleEdit('tags', 'タグの追加・削除', tags)} className={`w-full flex items-center justify-between p-4 py-4 border-b transition-all ${theme === 'dark' ? 'border-white/5 hover:bg-zinc-800 active:bg-zinc-800/80' : 'border-black/5 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-purple-500/10 text-purple-500' : 'bg-purple-100 text-purple-600'}`}><Tag size={20} /></div>
                <div className="text-left w-full overflow-hidden">
                  <span className={`block font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}>タグの管理</span>
                  <span className={`block text-[10px] mt-1 pr-4 line-clamp-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{tags.join('、') || '未登録'}</span>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => handleEdit('units', '単位の追加・削除', units)} className={`w-full flex items-center justify-between p-4 py-4 transition-all ${theme === 'dark' ? 'hover:bg-zinc-800 active:bg-zinc-800/80' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-100 text-orange-600'}`}><Scale size={20} /></div>
                <div className="text-left w-full overflow-hidden">
                  <span className={`block font-bold text-sm tracking-wide ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}>単位の管理</span>
                  <span className={`block text-[10px] mt-1 pr-4 line-clamp-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{units.join('、') || '未登録'}</span>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>

        <div className="pt-6">
           <button 
             onClick={() => {
               if (window.confirm('追加・削除した項目をすべて初期の「全項目一覧」にリセットしますか？')) {
                 localStorage.removeItem('app_settings_ingredients');
                 localStorage.removeItem('app_settings_genres');
                 localStorage.removeItem('app_settings_tags');
                 localStorage.removeItem('app_settings_units');
                 window.location.reload();
               }
             }}
             className="w-full py-4 text-rose-500 font-bold border border-rose-500/20 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
           >
             デフォルトの全項目一覧を復元する
           </button>
           <p className="text-xs text-zinc-500 text-center mt-3">※誤って項目を消してしまった場合や、最初から全項目を表示したい場合はこちらを押してください。</p>
        </div>

      </div>

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mt-16 bg-zinc-900 border-t border-white/10 w-full flex-1 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-[50px] duration-300">
            <div className="px-5 pt-6 pb-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-white">{editingItem.title}</h2>
              <button onClick={() => setEditingItem(null)} className="p-2 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Input for adding new item */}
            <div className="px-5 py-4 border-b border-white/5 shrink-0 bg-zinc-900/50">
               <div className="flex gap-2">
                 <input 
                   type="text"
                   value={newItemText}
                   onChange={(e) => setNewItemText(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       if (e.nativeEvent.isComposing) return;
                       e.preventDefault();
                       handleAddItem();
                     }
                   }}
                   placeholder="新しい項目を入力..."
                   className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500/50 shadow-inner placeholder-zinc-500"
                 />
                 <button onClick={handleAddItem} disabled={!newItemText.trim()} className="px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center">
                   <Plus size={20} />
                 </button>
               </div>
            </div>

            {/* List of items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 invisible-scrollbar pb-[100px]">
              {editingItem.items.length === 0 && <p className="text-center text-zinc-500 py-10 text-sm">項目がありません</p>}
              {editingItem.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-zinc-800/40 p-4 rounded-xl border border-white/5 group">
                   <span className="font-medium text-zinc-200">{item}</span>
                   <button onClick={() => handleDeleteItem(idx)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                     <Trash2 size={18} />
                   </button>
                 </div>
              ))}
            </div>

            <div className="p-5 border-t border-white/5 bg-zinc-900 shrink-0 pb-10">
              <button onClick={handleSaveItems} className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all text-lg">
                変更を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// ボトムナビゲーション＆ルーティング
// -------------------------------------------------------------
const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-6 w-full max-w-md px-6 z-50">
      <nav className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-2 py-1.5 relative">
          <Link to="/" className={`relative z-10 flex flex-col items-center justify-center w-1/3 py-2 transition-colors duration-300 ${isActive('/') ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Compass size={22} className={`mb-1 transition-transform duration-300 ${isActive('/') ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-bold tracking-wider uppercase">Explore</span>
          </Link>
          <Link to="/recipes" className={`relative z-10 flex flex-col items-center justify-center w-1/3 py-2 transition-colors duration-300 ${isActive('/recipes') ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <BookOpen size={22} className={`mb-1 transition-transform duration-300 ${isActive('/recipes') ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-bold tracking-wider uppercase">Recipes</span>
          </Link>
          <Link to="/profile" className={`relative z-10 flex flex-col items-center justify-center w-1/3 py-2 transition-colors duration-300 ${isActive('/profile') ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <UserCircle size={22} className={`mb-1 transition-transform duration-300 ${isActive('/profile') ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* スマホ画面サイズに合わせたコンテナ */}
      <div className="w-full max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden bg-[#09090b]">
        <Routes>
          <Route path="/" element={<SearchScreen />} />
          <Route path="/recipes" element={<RecipeListScreen />} />
          <Route path="/recipes/:id" element={<RecipeDetailScreen />} />
          <Route path="/recipes/new" element={<RecipeEditScreen />} />
          <Route path="/recipes/edit/:id" element={<RecipeEditScreen />} />
          <Route path="/profile" element={<ProfileMenuScreen />} />
          <Route path="/profile/edit" element={<ProfileEditScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
