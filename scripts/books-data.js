/**
 * Complete book catalog for BookIn
 * Parsed from Full_initial_list_books.md
 * 107 books total across multiple categories
 */

export const BOOKS = [
  // Business & Marketing
  { id: '100m-leads', title: '$100M Leads', titleZh: '百萬潛在客戶', category: 'Business & Marketing' },
  { id: 'all-marketers-are-liars', title: 'All Marketers Are Liars', titleZh: '行銷人都是說故事高手', category: 'Business & Marketing' },
  { id: 'this-is-marketing', title: 'This Is Marketing', titleZh: '這才是行銷', category: 'Business & Marketing' },
  { id: 'unleash-power-storytelling', title: 'Unleash the Power of Storytelling', titleZh: '故事力', category: 'Business & Marketing' },
  { id: 'chatgpt-millionaire', title: 'The ChatGPT Millionaire', titleZh: 'ChatGPT 百萬富翁', category: 'Business & Marketing' },
  { id: 'smart-brevity', title: 'Smart Brevity', titleZh: '聰明簡潔的溝通', category: 'Business & Marketing' },

  // Finance & Investing
  { id: 'psychology-of-money', title: 'The Psychology of Money', titleZh: '致富心態', category: 'Finance & Investing' },
  { id: 'just-keep-buying', title: 'Just Keep Buying', titleZh: '持續買進', category: 'Finance & Investing' },
  { id: 'trading-in-zone', title: 'Trading in the Zone', titleZh: '賺錢，再自然不過！', category: 'Finance & Investing' },
  { id: 'wealth-ladder', title: 'The Wealth Ladder', titleZh: '財富階梯', category: 'Finance & Investing' },
  { id: 'die-with-zero', title: 'Die with Zero', titleZh: '別把你的錢留到死', category: 'Finance & Investing' },
  { id: 'intelligent-investor', title: 'The Intelligent Investor', titleZh: '智慧型股票投資人', category: 'Finance & Investing' },
  { id: 'rich-dad-retire-young', title: "Rich Dad's Retire Young Retire Rich", titleZh: '富爸爸財富執行力', category: 'Finance & Investing' },
  { id: 'your-money-or-life', title: 'Your Money or Your Life', titleZh: '富足人生：要錢還是要命', category: 'Finance & Investing' },
  { id: 'millionaire-fastlane', title: 'The Millionaire Fastlane', titleZh: '百萬富翁快車道', category: 'Finance & Investing' },
  { id: 'from-debt-to-cashflow', title: 'From 20 Million in Debt to Cash Flow Every Day', titleZh: '從負債2000萬到錢錢滾進每一天', category: 'Finance & Investing' },
  { id: 'from-debt-to-miracles', title: 'From 20 Million in Debt to Miracles Every Day', titleZh: '從負債2000萬到奇蹟罩我每一天', category: 'Finance & Investing' },
  { id: 'from-debt-to-manifesting', title: 'From 20 Million in Debt to Manifesting Daily', titleZh: '從負債2000萬到心想事成每一天', category: 'Finance & Investing' },

  // Personal Development & Self-Help
  { id: 'inner-excellence', title: 'Inner Excellence', titleZh: '內在卓越', category: 'Personal Development' },
  { id: 'no-self-no-problem', title: 'No Self, No Problem', titleZh: '無我，無煩惱', category: 'Personal Development' },
  { id: 'do-hard-things', title: 'Do Hard Things', titleZh: '真堅強', category: 'Personal Development' },
  { id: '5-types-wealth', title: 'The 5 Types of Wealth', titleZh: '人生的五種財富', category: 'Personal Development' },
  { id: 'set-boundaries', title: 'Set Boundaries, Find Peace', titleZh: '設限，才有好關係', category: 'Personal Development' },
  { id: 'manifest', title: 'Manifest', titleZh: '快速顯化你想要的人生', category: 'Personal Development' },
  { id: 'confidence-gap', title: 'The Confidence Gap', titleZh: '自信的陷阱', category: 'Personal Development' },
  { id: '5-second-rule', title: 'The 5 Second Rule', titleZh: '五秒法則', category: 'Personal Development' },
  { id: 'let-them-theory', title: 'The Let Them Theory', titleZh: '隨他們去理論', category: 'Personal Development' },
  { id: 'stop-overthinking', title: 'Stop Overthinking', titleZh: '八成是你想太多', category: 'Personal Development' },
  { id: 'good-vibes-good-life', title: 'Good Vibes, Good Life', titleZh: '沒有好條件，也能夢想成真', category: 'Personal Development' },
  { id: 'mountain-is-you', title: 'The Mountain Is You', titleZh: '你就是困住自己的那座山', category: 'Personal Development' },
  { id: 'comfort-zone', title: 'The Comfort Zone', titleZh: '別再跳脫舒適圈', category: 'Personal Development' },
  { id: 'breaking-habit', title: 'Breaking the Habit of Being Yourself', titleZh: '未來預演', category: 'Personal Development' },
  { id: 'dont-react', title: "Don't React to Everything", titleZh: '別對每件事都有反應', category: 'Personal Development' },
  { id: 'get-it-done', title: 'Get It Done', titleZh: '達標', category: 'Personal Development' },

  // Productivity & Focus
  { id: 'atomic-habits', title: 'Atomic Habits', titleZh: '原子習慣', category: 'Productivity' },
  { id: 'one-thing', title: 'The ONE Thing', titleZh: '成功，從聚焦一件事開始', category: 'Productivity' },
  { id: 'power-of-habit', title: 'The Power of Habit', titleZh: '為什麼我們這樣生活，那樣工作？', category: 'Productivity' },
  { id: 'effortless', title: 'Effortless', titleZh: '努力，但不費力', category: 'Productivity' },
  { id: 'focus-project', title: 'The Focus Project', titleZh: '最有專注力的一年', category: 'Productivity' },
  { id: 'peak', title: 'Peak', titleZh: '刻意練習', category: 'Productivity' },
  { id: 'procrastination-cure', title: 'The Procrastination Cure', titleZh: '一本書終結你的拖延症', category: 'Productivity' },
  { id: 'input', title: 'INPUT', titleZh: '最高學習法', category: 'Productivity' },
  { id: 'output', title: 'OUTPUT', titleZh: '最高學以致用法', category: 'Productivity' },

  // Psychology & Human Behavior
  { id: 'what-every-body-saying', title: 'What Every BODY Is Saying', titleZh: 'FBI 教你讀心術', category: 'Psychology' },
  { id: 'how-to-win-friends', title: 'How to Win Friends and Influence People', titleZh: '人性的弱點', category: 'Psychology' },
  { id: 'molecule-of-more', title: 'The Molecule of More', titleZh: '欲望分子多巴胺', category: 'Psychology' },
  { id: 'body-keeps-score', title: 'The Body Keeps the Score', titleZh: '心靈的傷，身體會記住', category: 'Psychology' },
  { id: 'thinking-in-bets', title: 'Thinking in Bets', titleZh: '高勝算決策', category: 'Psychology' },
  { id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', titleZh: '快思慢想', category: 'Psychology' },
  { id: 'influence', title: 'Influence', titleZh: '影響力', category: 'Psychology' },
  { id: 'charisma-myth', title: 'The Charisma Myth', titleZh: '魅力學', category: 'Psychology' },
  { id: 'dark-psychology', title: 'Dark Psychology', titleZh: '隨心所欲操控人心的暗黑心理學', category: 'Psychology' },
  { id: 'psychology-rich', title: 'Psychology of the Rich', titleZh: '有錢人的書櫃總有一本心理學書', category: 'Psychology' },
  { id: 'murphys-law', title: "Murphy's Law", titleZh: '墨菲定律', category: 'Psychology' },
  { id: 'cruel-psychology', title: 'Cruel Psychology', titleZh: '殘酷：不能說的人性真相', category: 'Psychology' },

  // Philosophy & Mindfulness
  { id: 'stoic-challenge', title: 'The Stoic Challenge', titleZh: '斯多噶挑戰', category: 'Philosophy' },
  { id: 'no-death-no-fear', title: 'No Death, No Fear', titleZh: '你可以不怕死', category: 'Philosophy' },
  { id: 'wabi-sabi', title: 'Wabi-Sabi', titleZh: '侘寂', category: 'Philosophy' },
  { id: 'slow-down', title: 'The Things You Can See Only When You Slow Down', titleZh: '當你放慢腳步，才看得到的風景', category: 'Philosophy' },
  { id: 'power-of-now', title: 'The Power of Now', titleZh: '當下的力量', category: 'Philosophy' },
  { id: 'daily-stoic', title: 'The Daily Stoic', titleZh: '每日斯多葛', category: 'Philosophy' },
  { id: 'four-agreements', title: 'The Four Agreements', titleZh: '讓夢想覺醒的四項約定', category: 'Philosophy' },
  { id: 'surrender-experiment', title: 'The Surrender Experiment', titleZh: '臣服實驗', category: 'Philosophy' },
  { id: 'letting-go', title: "Letting Go of What You Can't Control", titleZh: '人生沒什麼不可放下', category: 'Philosophy' },
  { id: 'i-may-be-wrong', title: 'I May Be Wrong', titleZh: '我可能錯了', category: 'Philosophy' },
  { id: 'pig-wants-eaten', title: 'The Pig That Wants to Be Eaten', titleZh: '自願被吃的豬', category: 'Philosophy' },

  // Career & Work
  { id: 'so-good-cant-ignore', title: "So Good They Can't Ignore You", titleZh: '深度職場力', category: 'Career' },
  { id: 'rules-of-work', title: 'The Rules of Work', titleZh: '工作的法則', category: 'Career' },
  { id: 'diary-of-ceo', title: 'The Diary of a CEO', titleZh: '執行長日記', category: 'Career' },
  { id: 'designing-your-life', title: 'Designing Your Life', titleZh: '做自己的生命設計師', category: 'Career' },
  { id: 'what-i-wish-knew', title: 'What I Wish I Knew When I Was 20', titleZh: '真希望我20歲就懂的事', category: 'Career' },
  { id: 'hidden-potential', title: 'Hidden Potential', titleZh: '隱性潛能', category: 'Career' },

  // Relationships & Communication
  { id: 'men-mars-women-venus', title: 'Men Are from Mars, Women Are from Venus', titleZh: '男人來自火星，女人來自金星', category: 'Relationships' },
  { id: 'love-prescription', title: 'The Love Prescription', titleZh: '恆溫關係', category: 'Relationships' },
  { id: 'art-of-seduction', title: 'The Art of Seduction', titleZh: '誘惑的藝術', category: 'Relationships' },
  { id: 'intimacy-desire', title: 'Intimacy & Desire', titleZh: '親密與渴望', category: 'Relationships' },
  { id: 'small-talk-mastery', title: 'Small Talk Mastery', titleZh: '最高閒聊法', category: 'Relationships' },

  // Success & Achievement
  { id: 'outliers', title: 'Outliers', titleZh: '異數', category: 'Success' },
  { id: 'give-and-take', title: 'Give and Take', titleZh: '給予', category: 'Success' },
  { id: 'mindset', title: 'Mindset', titleZh: '心態致勝', category: 'Success' },
  { id: 'infinite-game', title: 'The Infinite Game', titleZh: '無限賽局', category: 'Success' },
  { id: 'think-again', title: 'Think Again', titleZh: '逆思維', category: 'Success' },
  { id: 'same-as-ever', title: 'Same as Ever', titleZh: '一如既往', category: 'Success' },

  // Health & Wellness
  { id: 'glucose-revolution', title: 'Glucose Revolution', titleZh: '90%的病，控糖就會好', category: 'Health' },
  { id: 'outlive', title: 'Outlive', titleZh: '超越百歲：長壽的科學與藝術', category: 'Health' },
  { id: 'ikigai', title: 'Ikigai', titleZh: '日本生活美學的長壽祕訣', category: 'Health' },

  // Biographies & Life Stories
  { id: 'snowball', title: 'The Snowball', titleZh: '雪球：巴菲特傳', category: 'Biography' },
  { id: 'almanack-naval', title: 'The Almanack of Naval Ravikant', titleZh: '納瓦爾寶典', category: 'Biography' },
  { id: 'be-water', title: 'Be Water, My Friend', titleZh: '似水無形', category: 'Biography' },
  { id: 'letters-rockefeller', title: 'Letters from Rockefeller to His Son', titleZh: '洛克菲勒寫給兒子的38封信', category: 'Biography' },

  // Leadership & Strategy
  { id: 'principles', title: 'Principles', titleZh: '原則：生活和工作', category: 'Leadership' },
  { id: '48-laws-power', title: 'The 48 Laws of Power', titleZh: '權力的48條法則', category: 'Leadership' },
  { id: 'daily-laws', title: 'The Daily Laws', titleZh: '洞悉人性與現實的366權力法則', category: 'Leadership' },
  { id: '12-rules-life', title: '12 Rules for Life', titleZh: '生存的12條法則', category: 'Leadership' },
  { id: 'rules-of-life', title: 'The Rules of Life', titleZh: '生活就是要快樂', category: 'Leadership' },
  { id: 'rules-to-break', title: 'The Rules to Break', titleZh: '打破規則', category: 'Leadership' },

  // Thinking & Problem Solving
  { id: 'think-like-freak', title: 'Think Like a Freak', titleZh: '蘋果橘子思考術', category: 'Thinking' },
  { id: 'tipping-point', title: 'The Tipping Point', titleZh: '引爆趨勢', category: 'Thinking' },
  { id: '80-20-principle', title: 'The 80/20 Principle', titleZh: '80/20 法則', category: 'Thinking' },
  { id: 'first-principles', title: 'First Principles Thinking', titleZh: '底層邏輯', category: 'Thinking' },

  // Personal Growth & Lifestyle
  { id: 'quiet', title: 'Quiet', titleZh: '安靜，就是力量', category: 'Lifestyle' },
  { id: 'anxious-generation', title: 'The Anxious Generation', titleZh: '失控的焦慮世代', category: 'Lifestyle' },
  { id: 'strength-to-strength', title: 'From Strength to Strength', titleZh: '重啟人生', category: 'Lifestyle' },
  { id: 'morning-routine', title: 'My Morning Routine', titleZh: '起床後的黃金一小時', category: 'Lifestyle' },
  { id: 'ideal-life-handbook', title: 'The Ideal Life Handbook', titleZh: '理想生活指南圖鑑', category: 'Lifestyle' },
  { id: 'emotional-intelligence-3', title: 'Emotional Intelligence Course 3', titleZh: '你願意，人生就會值得：蔡康永的情商課3', category: 'Lifestyle' },
  { id: 'humor-habit', title: 'The Humor Habit', titleZh: '幽默的習慣', category: 'Lifestyle' },
];

// Generate product description for Stripe
export function getProductDescription(book, type) {
  const isLifetime = type === 'lifetime';
  const typeLabel = isLifetime ? 'Lifetime Access' : 'Quarterly Subscription';

  return `${book.title} (${book.titleZh}) - ${typeLabel}

📚 Category: ${book.category}
${isLifetime ? '💎 One-time payment for lifetime access' : '🔄 Billed every 3 months, cancel anytime'}

Master the key concepts from this transformative book through:
• Complete book summary in Cantonese & English
• Interactive training questions
• Spaced repetition learning
• Progress tracking

${isLifetime ? 'Pay once, learn forever.' : 'Affordable quarterly access to all content.'}`;
}
