// scripts/populate-slang.js - Populate all slang terms at once
const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';

const allSlangTerms = [
    // Tier 1: Maximum Brainrot (3.0+ weight)
    { term: 'skibidi', weight: 4.5, category: 'meme', variants: ['skibidi toilet', 'skibidi rizzler', 'skibidi aura'] },
    { term: 'ohio', weight: 3.5, category: 'meme', variants: ['only in ohio', 'ohio sigma', 'ohio aura farm'] },
    { term: 'rizz', weight: 4.0, category: 'trending', variants: ['rizzler', 'rizzington bear', 'rizzrael', 'rizzmastodon'] },
    { term: 'gyatt', weight: 4.0, category: 'trending', variants: ['gyat', 'GYATTTT', 'gyattatron'] },

    // Aura system extended
    { term: 'aura', weight: 4.0, category: 'trending', variants: ['aura points', '+999 aura', 'ultra aura'] },
    { term: 'aura farming', weight: 4.5, category: 'trending', variants: ['aura harvest', 'aura industrial complex'] },
    { term: 'generational aura', weight: 5.0, category: 'elite', variants: ['ancestral aura', 'ancient aura script'] },
    { term: 'aura debt', weight: 4.5, category: 'elite', variants: ['aura bankruptcy', 'aura foreclosure'] },
    { term: 'aura collapse', weight: 4.2, category: 'elite', variants: ['aura implosion'] },

    // Pen variants expanded
    { term: 'penjamin', weight: 3.5, category: 'meme', variants: ['benjamin but pen', 'penjamin aura'] },
    { term: 'pennifer', weight: 3.5, category: 'meme', variants: ['jennifer but pen', 'pennifer lo-penz'] },
    { term: 'penjamin franklin', weight: 3.8, category: 'meme', variants: ['pen frank'] },
    { term: 'penjamin netanyah-pen', weight: 4.0, category: 'chaos', variants: ['pen-yahu'] },

    // Gooning expansion
    { term: 'goon', weight: 3.0, category: 'chaos', variants: ['gooning', 'gooned', 'goonarchist'] },
    { term: 'gooning', weight: 3.5, category: 'chaos', variants: ['goon cave', 'goonmaxxing', 'goon ascension'] },
    { term: 'gooniverse', weight: 3.8, category: 'chaos', variants: ['multigoonverse'] },

    // Misc chaotic peak
    { term: 'peaky blinder', weight: 3.5, category: 'meme', variants: ['real peaky blinder hours'] },
    { term: 'skibidi sigma rizzler', weight: 5.0, category: 'elite', variants: ['sigma skibidi aura king'] },

    // Tier 2: High Brainrot (2.0-2.9 weight)
    { term: 'fr fr', weight: 2.5, category: 'chaos', variants: ['fr', 'frfr', 'on god fr'] },
    { term: 'no cap', weight: 2.0, category: 'chaos', variants: ['nocap', '🚫🧢'] },
    { term: 'bussin', weight: 2.8, category: 'chaos', variants: ['bussin bussin', 'bussin 9000'] },
    { term: 'sigma', weight: 2.5, category: 'meme', variants: ['sigma male', 'sigma aura', 'sigma maxxing'] },
    { term: 'deadass', weight: 2.5, category: 'chaos', variants: ['dead ahh', 'deadass aura'] },
    { term: 'ahh', weight: 2.0, category: 'chaos', variants: ['ahhhh', 'ahh compilation', 'npc ahh'] },
    { term: 'shi', weight: 2.0, category: 'chaos', variants: ['shii', 'shiii', 'shi on god'] },
    { term: 'fade', weight: 2.5, category: 'chaos', variants: ['run the fade', 'aura fade'] },
    { term: 'run it', weight: 2.0, category: 'chaos', variants: ['we runnin it', 'run it aura'] },
    { term: 'goober', weight: 2.0, category: 'wholesome', variants: ['silly goober', 'goober maxxed'] },
    { term: 'aura check', weight: 2.8, category: 'trending', variants: ['aura scan', 'npc aura check'] },
    { term: 'ong', weight: 2.5, category: 'chaos', variants: ['on god', 'on g'] },
    { term: 'sheesh', weight: 2.0, category: 'reaction', variants: ['sheeesh', 'sheeeesh'] },

    // Tier 3: Standard Brainrot (1.0-1.9 weight)
    { term: 'npc', weight: 1.5, category: 'meme', variants: ['npc behavior', 'npc script', 'npc update patch notes'] },
    { term: 'cope', weight: 1.0, category: 'chaos', variants: ['copium', 'cope harder'] },
    { term: 'seethe', weight: 1.0, category: 'chaos', variants: ['seething', 'seethe & mald'] },
    { term: 'mald', weight: 1.5, category: 'chaos', variants: ['malding', 'maldmaxxing'] },
    { term: 'touch grass', weight: 1.5, category: 'meme', variants: ['grass touched', 'grass deficiency'] },
    { term: 'juice', weight: 1.5, category: 'chaos', variants: ['juiced', 'npc juice'] },
    { term: 'brainrot', weight: 1.8, category: 'meta', variants: ['ultra brainrot', 'rotpilled'] },
    { term: 'based', weight: 1.5, category: 'reaction', variants: ['based and redpilled'] },
    { term: 'cringe', weight: 1.0, category: 'reaction', variants: ['cringy', 'cringey'] },
    { term: 'sus', weight: 1.5, category: 'meme', variants: ['sussy', 'suspicious'] },
    { term: 'bruh', weight: 1.0, category: 'reaction', variants: ['bruhhh', 'bruhhhh'] },

    // Additional creative combinations
    { term: 'fanum tax', weight: 2.5, category: 'meme', variants: ['fanum taxed', 'aura fanum tax'] },
    { term: 'let him cook', weight: 2.0, category: 'meme', variants: ['let them cook', 'he cooking aura'] },
    { term: 'its giving', weight: 2.0, category: 'trending', variants: ['its giving...', 'its giving npc energy'] },
    { term: 'slay', weight: 1.5, category: 'reaction', variants: ['slaying', 'slayed the aura check'] },
    { term: 'periodt', weight: 2.0, category: 'reaction', variants: ['period', 'purr'] },
    { term: 'bet', weight: 1.5, category: 'reaction', variants: ['bett', 'bettt'] },
    { term: 'vibe check', weight: 2.0, category: 'meme', variants: ['vibing', 'aura vibe analysis'] },
    { term: 'hits different', weight: 1.5, category: 'reaction', variants: ['hits diff', 'aura hits different'] },
    { term: 'lowkey', weight: 1.0, category: 'chaos', variants: ['low key'] },
    { term: 'highkey', weight: 1.0, category: 'chaos', variants: ['high key'] },
    { term: 'w rizz', weight: 2.5, category: 'trending', variants: ['w rizz energy'] },
    { term: 'l rizz', weight: 2.5, category: 'trending', variants: ['l rizz detection', 'negative rizz aura'] },
    { term: 'rizz god', weight: 3.5, category: 'elite', variants: ['rizz deity', 'rizz final boss'] },
    { term: 'ohio final boss', weight: 3.8, category: 'elite', variants: ['ohio raid boss', 'ohio dark souls'] },
    { term: 'goofy ahh', weight: 2.2, category: 'meme', variants: ['goofy ahh npc', 'goofy ahh ohio'] }
];

async function populateSlang() {
    console.log('🚀 Starting bulk slang import...');
    console.log(`📝 Importing ${allSlangTerms.length} elite brainrot terms...\n`);

    try {
        const response = await fetch(`${API_URL}/api/slang/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ terms: allSlangTerms })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Import successful!');
            console.log(`  Total terms: ${data.summary.total}`);
            console.log(`  ✓ Added: ${data.summary.added}`);
            console.log(`  ✗ Failed: ${data.summary.failed}`);

            // Show some of the elite terms that were added
            console.log('\n🔥 Elite terms now active:');
            const eliteTerms = allSlangTerms.filter(t => t.weight >= 4.0);
            eliteTerms.forEach(t => {
                console.log(`  • ${t.term} (${t.weight}w) - ${t.category}`);
            });

            if (data.results) {
                const failed = data.results.filter(r => r.status === 'failed');
                if (failed.length > 0) {
                    console.log('\n⚠️  Failed terms:');
                    failed.forEach(f => console.log(`  - ${f.term}: ${f.error}`));
                }
            }
        } else {
            console.error('❌ Import failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error during import:', error.message);
    }
}

// Test some elite combinations
async function testEliteCombos() {
    console.log('\n🧪 Testing elite brainrot combinations...\n');

    const eliteTests = [
        "skibidi sigma rizzler with generational aura fr fr",
        "ohio aura farm got me in aura debt, penjamin franklin would understand",
        "gooniverse collapse causing aura bankruptcy, bussin 9000 npc ahh behavior",
        "rizzmastodon hitting different with that ancestral aura, deadass no cap",
        "penjamin netanyah-pen running the aura industrial complex, its giving ohio final boss energy"
    ];

    for (const text of eliteTests) {
        try {
            const response = await fetch(`${API_URL}/api/slang/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            if (data.success) {
                console.log(`📊 "${text.substring(0, 50)}..."`);
                console.log(`   Score: ${data.score}/20 | Terms: ${data.analysis?.detectedTerms?.length || 0} | Density: ${data.analysis?.density?.toFixed(1)}%`);
            }
        } catch (error) {
            console.error('Test failed:', error.message);
        }
    }
}

// Run the import and then test
async function main() {
    await populateSlang();
    await testEliteCombos();

    console.log('\n💀 Your brainrot dictionary is now operating at maximum chaos capacity!');
    console.log('🧠 The aura industrial complex is fully operational!');
}

main();