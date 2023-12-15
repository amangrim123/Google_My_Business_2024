const pt = require('puppeteer');
const mysql = require('mysql2');
const sprintf = require('sprintf-js').sprintf;

const con = mysql.createConnection({
    host: '18.189.108.83',
    user: 'wp_raj1',
    password: 'rajPassword95$',
    database: 'Google_my_business'
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

async function fetchGoogleData() {
    const browser = await pt.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1980, height: 1080 });

    try {
        await page.goto('https://www.google.com/search?q=best movers and packers california&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq');
        await page.waitForTimeout(5000);

        const ALL_Contener = await page.$x('//div[@jscontroller="AtSb"]');
        let i = 0;
        for (const container of ALL_Contener) {
            try {
                const All_DATA = await extractData(page, container, i);

                // Insert data into Google_Data table
                await insertDataToGoogleData(All_DATA);

                // Interact with review data and insert into Review_List table
                // ...

                i++;
            } catch (error) {
                console.error("Error processing data: ", error);
            }
        }
    } catch (error) {
        console.error("Error in retrieving data: ", error);
    } finally {
        await page.waitForTimeout(15000);
        await browser.close();
        con.end();
    }
}

async function extractData(page, container, i) {
    const All_DATA = {
        'CID': "",
        'Place_Name': "",
        'Address': "",
        'Phone': "",
        'Review_Points': '',
        'Review_Count': '',
        'TimeTable': '',
        'Category': '',
        'description': '',
        'images': '',
        'location': '',
        'done': ''
    };

    container.click();
    await page.waitForTimeout(3000);

    // Extract and assign data to All_DATA properties
    // ...

    return All_DATA;
}

async function insertDataToGoogleData(data) {
    const insertQuery = 'INSERT INTO Google_Data (Name, CID, Address, Rating, Phone, ReviewsCount, weekdaysTable, Category, description, location, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        data.Place_Name, data.CID, data.Address, data.Review_Points, data.Phone, data.Review_Count, data.TimeTable, data.Category, data.description, data.location, data.images
    ];

    con.query(insertQuery, values, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return;
        }
        console.log('Data inserted successfully');
    });
}

// Call the function to initiate the data retrieval and processing
fetchGoogleData();