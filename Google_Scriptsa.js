//adding Puppeteer library
const pt = require('puppeteer');
const mysql = require('mysql2');
const sprintf = require('sprintf-js').sprintf;

const con = mysql.createConnection({
    host: '3.140.99.156',
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
        await page.goto('https://www.google.com/search?q=best movers and packers alabama&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq');
        await page.waitForTimeout(5000);

        const ALL_Contener = await page.$x('//div[@jscontroller="AtSb"]');
        let i = 0;
        for (const container of ALL_Contener) {
            await page.waitForTimeout(3000)
            try {
                let ALL_CID = await page.$x("//div[@class ='cXedhc']/a");
                const All_DATA = await extractData(page, container, i,ALL_CID);
                await page.waitForTimeout(3000);
                await insertDataToGoogleData(All_DATA, page);
                await page.waitForTimeout(3000);

                i++;
            } catch (error) {
                console.error("Error processing data: ", error);
            }
        }
    } catch (error) {
        console.error("Error in retrieving data: ", error);
    //} finally {
    //     await page.waitForTimeout(15000);
    //     await browser.close();
    //     con.end();
    // }
    }
    return;

}

async function extractData(page, container, i,ALL_CID) {
    try{
        await page.waitForTimeout(3000);
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
        try{
            let Overview_Button = await page.waitForXPath("//span[normalize-space()='Overview']");
            Overview_Button.click();
        }
        catch{

        }
        // Extract and assign data to All_DATA properties
        let element = ALL_CID[i]
        const attributeValue = await element.evaluate(element => element.getAttribute("data-cid"));
        try{
            let Place_Name = await page.waitForXPath("//div[@class='SPZz6b']//h2");
            const elementText = await page.evaluate(el => el.textContent, Place_Name);
            All_DATA.CID = attributeValue;
            All_DATA.Place_Name = elementText;
        }
        catch{

        }    
        // console.log("Pace Name = ",elementText)
        // console.log(`Cid Number Is =  ${attributeValue}`);
        // console.log("The dicstionary",All_DATA.Place_Name)
        // let Place_Data = await page.$x("//div[@class = 'i4J0ge']")

        try {

            let place_field = await page.$x("//div[@class='Z1hOCe']")
            for (let place_detail of place_field){
                const Place_text = await page.evaluate(el => el.textContent, place_detail);
                const Get_element = Place_text.split(":");
                // console.log(Get_element[0],"::",Get_element[1])
                if (Get_element[0].includes("Add")){
                    All_DATA.Address = "Address:"+Get_element[1];
                    const Get_Location =  Get_element[1].split(",")[1];
                    const Get_Code = Get_element[1].split(",")[2].split(" ")[1];
                    All_DATA.location = Get_Location+", "+ Get_Code;
                }

                if (Get_element[0].includes("Phone")) {
                    All_DATA.Phone = Get_element[1];
                }

                // All_DATA.(Get_element[0]) = Get_element[1];
            }
        }
        catch{

        }    

        /// ================== Get Image ====================== ///

        try {
            let Image_Element =  await page.waitForXPath("//div[@class='vwrQge jls5X']");
            const style_ = await Image_Element.evaluate(element => element.getAttribute("style"));
            var Image_Url = style_.match(/url\(([^)]+)\)/)[1].split("=")[0]+"=s1360-w1360-h1020";
            console.log("this is url",Image_Url);
            All_DATA.images = Image_Url;
        }
        catch {
            console.log("Not Found")
        }

        /// ================== Description ==================== ///
        try {
            let Des_Element = await page.waitForXPath("//span[@class='Yy0acb']");
            const Des_text = await page.evaluate(el => el.textContent, Des_Element);
            All_DATA.description = Des_text;
        }
        catch {
            console.log(" Not Found Descript ....")
            
        }

        /// ==================== Category ===================== ///
        
        try{
            let Category_element = await page.waitForXPath("//span[@class='YhemCb']");
            const Category_test = await page.evaluate(el => el.textContent, Category_element);
            All_DATA.Category = Category_test;
        }

        catch {

        }

        return All_DATA;
    }
    catch{
        console.log("Click error")
    }    
}

async function insertDataToGoogleData(data, page) {
    try {
        let Review_Button = await page.waitForXPath("//span[normalize-space()='Reviews']");
        Review_Button.click();
        await page.waitForTimeout(3000);  

        try {
            let R_Point = await page.waitForXPath("//span[@class='fzTgPe Aq14fc']");
            const Rating_Point = await page.evaluate(el => el.textContent, R_Point);
            data.Review_Points = Rating_Point;
        } catch {
            console.log('Not Found');
        }

        try {
            let R_count = await page.waitForXPath("//li[@class='SbQ21c zQhTRb']//div//span[@class='z5jxId']");
            const Rating_count = await page.evaluate(el => el.textContent, R_count);
            data.Review_Count = Rating_count;
        } catch {
            console.log('Not Found');
        }

        try {
            let Timing = await page.waitForXPath('//table[@class="WgFkxc"]');
            const htmlContent = await page.evaluate(element => element.innerHTML, Timing);
            data.TimeTable = htmlContent;
        } catch {
            console.log('Time Not Found');
        }

        console.log(data);

        const insertQuery = 'INSERT INTO Google_Data (Name,CID,Address,Rating,Phone,ReviewsCount,weekdaysTable,Category,description,location,image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [data.Place_Name, data.CID, data.Address, data.Review_Points, data.Phone, data.Review_Count, data.TimeTable, data.Category, data.description, data.location, data.images];

        con.query(insertQuery, values, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return;
            }
            console.log('Data inserted successfully');
        });

        // Insert reviews into Review_List table
        try {
            const Review_List = await page.$x("//div[@jscontroller='fIQYlf']");
            for (let Review_ of Review_List) {
                await page.waitForTimeout(2000)
                let R_Name = await Review_.waitForXPath("//div[@class='TSUbDb']//a");
                let R_comment = await Review_.waitForXPath("//div[@class='BgXiYe']");
                const R_Name_t = await page.evaluate(el => el.textContent, R_Name);
                const R_comment_t = await page.evaluate(el => el.textContent, R_comment);

                const insertReviewQuery = 'INSERT INTO Review_List (Name,CID,Review) VALUES (?, ?, ?)';
                const reviewValues = [R_Name_t, data.CID, R_comment_t];

                con.query(insertReviewQuery, reviewValues, (err, results) => {
                    if (err) {
                        console.error('Error inserting review:', err);
                        return;
                    }
                    console.log('Review inserted successfully');
                });

                await page.waitForTimeout(3000);
            }
        }
        catch {

        }
    }    
    catch {
        console.log(".....")

    }        
}

// Call the function to initiate the data retrieval and processing
fetchGoogleData();
// await browser.close();
// con.end();s