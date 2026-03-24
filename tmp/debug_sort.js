const http = require('http');

const testSort = (opt) => {
    return new Promise((resolve, reject) => {
        const url = `http://localhost:5000/api/products?sort=${opt}`;
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.success) {
                        const prices = json.data.map(p => p.price);
                        console.log(`\n--- Sort: ${opt} ---`);
                        console.log('Prices:', prices.slice(0, 5));
                        
                        if (opt === 'price_asc') {
                            const isSorted = prices.every((v, i) => i === 0 || v >= prices[i - 1]);
                            console.log('Is Correct?', isSorted);
                        } else if (opt === 'price_desc') {
                            const isSorted = prices.every((v, i) => i === 0 || v <= prices[i - 1]);
                            console.log('Is Correct?', isSorted);
                        }
                    } else {
                        console.log(`Error for ${opt}:`, json.message);
                    }
                    resolve();
                } catch (e) {
                    console.log(`Parse error for ${opt}`);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.log(`Request error for ${opt}:`, err.message);
            resolve();
        });
    });
};

const run = async () => {
    await testSort('default');
    await testSort('price_asc');
    await testSort('price_desc');
    await testSort('newest');
};

run();
