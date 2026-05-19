// ============================================================
//  games.js — 遊戲資料來源（數據驅動）
//  新增 / 修改 / 刪除遊戲只需要編輯這個檔案
// ============================================================

const gameData = {

    // ──────────── 已發售遊戲 ────────────

    '龍魂傳說': {
        bg:            'linear-gradient(135deg, #1a237e, #4a148c, #880e4f)',
        tags:          ['RPG', '奇幻', '開放世界', '單人'],
        category:      'rpg',
        desc:          '踏入龍魂大陸，在廣袤的奇幻世界中鍛造屬於你的傳說。精心設計的劇情分支系統，超過200小時的遊戲內容，以及震撼人心的龍戰系統，讓你體驗前所未有的角色扮演冒險。',
        dev:           'Phoenix Studios',
        pub:           'Galaxy Entertainment',
        date:          '2025.11.20',
        platform:      'Windows / PlayStation 5',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }],
        originalPrice: 1690,
        currentPrice:  1014,
        discount:      40,
        badge:         { type: 'sale', text: '-40%' },
        images:        [
            'images/dragonSoul/dragonsoul01.jpg',
            'images/dragonSoul/dragonsoul02.jpg',
            'images/dragonSoul/dragonsoul03.jpg',
            'images/dragonSoul/dragonsoul04.jpg',
            'images/dragonSoul/dragonsoul05.jpg',
            'images/dragonSoul/dragonsoul06.jpg',
        ],
    },

    '烈焰戰線': {
        bg:            'linear-gradient(135deg, #b71c1c, #e65100, #ff6f00)',
        tags:          ['FPS', '多人', '競技', '戰術'],
        category:      'action',
        desc:          '在烈焰燃燒的戰場上，組建你的精英小隊。5v5戰術射擊，獨特的角色技能系統，加上精心設計的競技地圖，打造最純粹的射擊對抗體驗。每個賽季帶來全新內容更新。',
        dev:           'Iron Wolf Games',
        pub:           'Iron Wolf Games',
        date:          '2025.08.15',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: 890,
        currentPrice:  890,
        discount:      0,
        images:        [
            'images/flameFront/flamefront01.png',
            'images/flameFront/flamefront02.png',
            'images/flameFront/flamefront03.png',
            'images/flameFront/flamefront04.png',
            'images/flameFront/flamefront05.png',
            'images/flameFront/flamefront06.png',
        ]
    },

    '翡翠迷境': {
        bg:            'linear-gradient(135deg, #004d40, #00695c, #26a69a)',
        tags:          ['冒險', '解謎', '探索', '獨立'],
        category:      'adventure',
        desc:          '在神秘的翡翠森林深處，隱藏著古老文明的秘密。透過精巧的環境解謎和沉浸式的探索體驗，逐步揭開被遺忘的歷史真相。手繪風格的美術設計，搭配動人的原創音樂。',
        dev:           'Jade Moon Interactive',
        pub:           'Indie Dreams Publishing',
        date:          '2026.03.10',
        platform:      'Windows / macOS',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: '&#9688;', name: 'Mac' }],
        originalPrice: 580,
        currentPrice:  580,
        discount:      0,
        badge:         { type: 'new', text: '新品' },
        images:        [
            'images/emeraldLabyrinth/emerald01.png',
            'images/emeraldLabyrinth/emerald02.png',
            'images/emeraldLabyrinth/emerald03.png',
            'images/emeraldLabyrinth/emerald04.png',
            'images/emeraldLabyrinth/emerald05.png',
            'images/emeraldLabyrinth/emerald06.png',
        ]
    },

    '帝國霸業 III': {
        bg:            'linear-gradient(135deg, #1b5e20, #33691e, #827717)',
        tags:          ['策略', '歷史', '即時戰略', '多人'],
        category:      'strategy',
        desc:          '從文明的黎明到現代世界，統領你的帝國征服歷史。全新的3D引擎，超過40個可遊玩文明，以及革新的外交系統。支援最多8人線上對戰，史上最強策略遊戲再臨。',
        dev:           'Crown Games',
        pub:           'Heritage Interactive',
        date:          '2024.09.30',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: 1290,
        currentPrice:  516,
        discount:      60,
        badge:         { type: 'sale', text: '-60%' },
        images:        [
            'images/ImperialHegemony/kingdom01.png',
            'images/ImperialHegemony/kingdom02.png',
            'images/ImperialHegemony/kingdom03.png',
            'images/ImperialHegemony/kingdom04.png',
            'images/ImperialHegemony/kingdom05.png',
            'images/ImperialHegemony/kingdom06.png',
        ]
    },

    '虛空行者': {
        bg:            'linear-gradient(135deg, #311b92, #4527a0, #7b1fa2)',
        tags:          ['ARPG', '科幻', 'Souls-like', '合作'],
        category:      'rpg',
        desc:          '在崩壞的虛空之中尋找救贖。硬核的動作戰鬥，配合深度的角色成長系統和裝備打造。支援最多3人線上合作，挑戰末日來臨後的異形怪物，探索宇宙的終極秘密。',
        dev:           'Void Entertainment',
        pub:           'Stellar Games',
        date:          '2026.01.25',
        platform:      'Windows / PS5 / Xbox Series X',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }, { icon: 'X', name: 'Xbox' }],
        originalPrice: 1790,
        currentPrice:  1790,
        discount:      0,
        images:         [
            'images/voidWalker/void01.png',
            'images/voidWalker/void02.png',
            'images/voidWalker/void03.png',
            'images/voidWalker/void04.png',
            'images/voidWalker/void05.png',
            'images/voidWalker/void06.png',
        ]
    },

    '都市天際線 II': {
        bg:            'linear-gradient(135deg, #0d47a1, #1565c0, #42a5f5)',
        tags:          ['模擬', '建造', '經營', '沙盒'],
        category:      'simulation',
        desc:          '打造你夢想中的完美城市。全新的交通模擬系統、動態天氣、四季變化，以及更精細的市民AI。從小鎮發展到國際大都會，每個決策都將影響城市的命運。',
        dev:           'Urban Dreams Studio',
        pub:           'Metro Publishing',
        date:          '2025.06.12',
        platform:      'Windows / macOS',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: '&#9688;', name: 'Mac' }],
        originalPrice: 1190,
        currentPrice:  833,
        discount:      30,
        badge:         { type: 'sale', text: '-30%' },
        images:        [
            'images/skyLine/skyline01.png',
            'images/skyLine/skyline02.png',
            'images/skyLine/skyline03.png',
            'images/skyLine/skyline04.png',
            'images/skyLine/skyline05.png',
            'images/skyLine/skyline06.png',
        ]
    },
    '使命召喚：末日邊緣': {
        bg:            'linear-gradient(135deg, #4a148c, #880e4f, #b71c1c)',
        tags:          ['FPS', '戰爭', '多人', '競技'],
        category:      'action',
        desc:          '在末日的戰爭中，加入全球最精英的特種部隊。全新的戰役模式，結合緊張刺激的多人對戰和合作任務。使用先進武器和裝備，改寫戰爭的未來。',
        dev:           'Warfront Studios',
        pub:           'Warfront Studios',
        date:          '2025.12.05',
        platform:      'Windows / PS5 / Xbox Series X',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }, { icon: 'X', name: 'Xbox' }],
        originalPrice: 1690,
        currentPrice:  1183,
        discount:      30,
        images:        [
            'images/callofduty/cod01.png',
            'images/callofduty/cod06.png',
            'images/callofduty/cod05.png',
            'images/callofduty/cod04.png',
            'images/callofduty/cod03.png',
            'images/callofduty/cod02.png',
        ]
    },
    '黑暗之魂：重生': {
        bg:            'linear-gradient(135deg, #212121, #424242, #616161)',
        tags:          ['動作', 'RPG', 'Souls-like', '單人'],
        category:      'action',
        desc:          '經典黑暗之魂系列的重生之作，帶來全新的劇情、角色和挑戰。精心設計的關卡和敵人，結合深度的角色成長系統，讓老玩家重溫經典，新玩家體驗傳奇。',
        dev:           'FromSoftware',
        pub:           'Bandai Namco Entertainment',
        date:          '2026.04.15',
        platform:      'Windows / PS5 / Xbox Series X',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }, { icon: 'X', name: 'Xbox' }],
        originalPrice: 1790,
        currentPrice:  1790,
        discount:      0,
        badge:         { type: 'new', text: '-25%' },
        images:        [
            'images/darksoul/darksoul01.png',
            'images/darksoul/darksoul02.png',
            'images/darksoul/darksoul03.png',
            'images/darksoul/darksoul04.png',
            'images/darksoul/darksoul05.png',
            'images/darksoul/darksoul06.png',
        ]
    },

    '星際幻域：黎明紀元': {
        bg:            'linear-gradient(135deg, #0a1628, #1a0a2e, #0d1f3c)',
        tags:          ['開放世界', 'RPG', '太空', '策略'],
        category:      'rpg',
        desc:          '踏入浩瀚無垠的宇宙，探索未知星系，打造你的銀河帝國。融合即時戰略與角色扮演，帶來前所未有的太空冒險體驗。',
        dev:           'Nebula Interactive',
        pub:           'Cosmos Games',
        date:          '2026.02.28',
        platform:      'Windows / PS5',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }],
        originalPrice: 1790,
        currentPrice:  1342,
        discount:      25,
    },

    '暗影獵手：永恆之戰': {
        bg:            'linear-gradient(135deg, #1a0505, #2d0a0a, #1a1005)',
        tags:          ['動作', '冒險', '暗黑', '單人'],
        category:      'action',
        desc:          '在黑暗降臨的世界中，你是最後的獵魔人。以極致的動作戰鬥系統對抗無盡的惡魔軍團，揭開古老預言背後的真相。',
        dev:           'Shadow Forge',
        pub:           'Dark Moon Publishing',
        date:          '2026.01.15',
        platform:      'Windows / PS5 / Xbox',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: 'P', name: 'PlayStation' }, { icon: 'X', name: 'Xbox' }],
        originalPrice: 1490,
        currentPrice:  1490,
        discount:      0,
    },

    '霓虹突擊：零號協議': {
        bg:            'linear-gradient(135deg, #050a1a, #0a1a2d, #051a0a)',
        tags:          ['射擊', '多人', '戰術', '科幻'],
        category:      'action',
        desc:          '在霓虹閃爍的未來都市中展開激烈的5v5戰術射擊對決。獨特的駭客能力系統，重新定義團隊合作射擊遊戲。',
        dev:           'Neon Works',
        pub:           'Neon Works',
        date:          '2025.09.01',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: 0,
        currentPrice:  0,
        discount:      0,
    },

    // ──────────── 即將推出（尚未發售） ────────────

    '深淵之眼': {
        bg:            'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        tags:          ['恐怖', '冒險', '克蘇魯'],
        category:      'adventure',
        desc:          '克蘇魯風格恐怖冒險遊戲，探索深海中不可名狀的恐懼。',
        dev:           'Abyss Studio',
        pub:           'Deep Sea Games',
        date:          '2026.05.15',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: null,
        currentPrice:  null,
        discount:      0,
        unreleased:    true,
        images: 'images/upcomming/abyssofeyes.png'
    },

    '量子迷途': {
        bg:            'linear-gradient(135deg, #2d1b69, #11998e, #38ef7d)',
        tags:          ['解謎', '平台', '科幻'],
        category:      'adventure',
        desc:          '跨越維度解謎平台跳躍遊戲，在量子世界中尋找出路。',
        dev:           'Quantum Pixel',
        pub:           'Quantum Pixel',
        date:          '2026.06.22',
        platform:      'Windows / macOS',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }, { icon: '&#9688;', name: 'Mac' }],
        originalPrice: null,
        currentPrice:  null,
        discount:      0,
        unreleased:    true,
        images: 'images/upcomming/quantom.png'
    },

    '鐵血軍團': {
        bg:            'linear-gradient(135deg, #4a0000, #8b0000, #dc143c)',
        tags:          ['射擊', '策略', '多人', '歷史'],
        category:      'action',
        desc:          '二戰背景大型多人策略射擊，指揮你的軍團改寫歷史。',
        dev:           'Ironclad Games',
        pub:           'War Forge Entertainment',
        date:          '2026.07.10',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: null,
        currentPrice:  null,
        discount:      0,
        unreleased:    true,
        images: 'images/upcomming/ironcross.png'
    },

    '永夜編年史': {
        bg:            'linear-gradient(135deg, #0c0c0c, #1a1a2e, #533483)',
        tags:          ['MMORPG', '奇幻', '暗黑'],
        category:      'rpg',
        desc:          '史詩級暗黑奇幻MMORPG，在永夜的世界中書寫你的編年史。',
        dev:           'Eternal Night Studio',
        pub:           'Chronicle Games',
        date:          '2026.08.01',
        platform:      'Windows',
        platforms:     [{ icon: '&#9634;', name: 'Windows' }],
        originalPrice: null,
        currentPrice:  null,
        discount:      0,
        unreleased:    true,
        images: 'images/upcomming/everynight.png'
    },
};

// ============================================================
//  精選輪播（首頁大 Banner）
//  - name: 對應 gameData 的 key
//  - slideBg: 輪播背景漸層（可與 gameData.bg 不同）
//  - badgeType / badgeText: 標籤樣式 (tag-new / tag-hot / tag-free)
//  - rating: 評價星數與文字
//  - artHTML: 右側裝飾動畫的 HTML（純裝飾，可為空字串）
// ============================================================
const featuredGames = [
    {
        name:      '星際幻域：黎明紀元',
        slideBg:   'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
        heroImage: 'images/nocomminggame/spaceside.jpg',
        badgeType: 'tag-new',
        badgeText: '新品上市',
        rating:    { stars: 5, text: '極度好評 (12,847)' },
    },
    {
        name:      '暗影獵手：永恆之戰',
        slideBg:   'linear-gradient(135deg, #1a0505 0%, #2d0a0a 50%, #1a1005 100%)',
        heroImage: 'images/nocomminggame/shdowhunter.jpg',
        badgeType: 'tag-hot',
        badgeText: '熱門',
        rating:    { stars: 4, text: '大多好評 (8,432)' },
    },
    {
        name:      '霓虹突擊：零號協議',
        slideBg:   'linear-gradient(135deg, #050a1a 0%, #0a1a2d 50%, #051a0a 100%)',
        heroImage: 'images/nocomminggame/neonshot.png',
        badgeType: 'tag-free',
        badgeText: '免費遊玩',
        rating:    { stars: 5, text: '壓倒性好評 (45,291)' },
    },
];

// ============================================================
//  商店遊戲卡片（熱門暢銷區塊）
//  只需填入 gameData 中的 key，順序 = 顯示順序
// ============================================================
const storeGames = [
    '龍魂傳說',
    '烈焰戰線',
    '翡翠迷境',
    '帝國霸業 III',
    '虛空行者',
    '都市天際線 II',
    '使命召喚：末日邊緣',
    '黑暗之魂：重生',
];

// ============================================================
//  即將推出（尚未發售的遊戲）
//  只需填入 gameData 中 unreleased: true 的 key
// ============================================================
const upcomingGames = [
    '深淵之眼',
    '量子迷途',
    '鐵血軍團',
    '永夜編年史',
];
