const pt = require('puppeteer');
const mysql = require('mysql2');
const sprintf = require('sprintf-js').sprintf;

const browser = await pt.launch({ headless: false });
const page = await browser.newPage();
await page.setViewport({ width: 1980, height: 1080 });

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

async function extractData(page, container, i,ALL_CID) {
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

try {
    await page.goto('https://www.google.com/search?q=best movers and packers alabama&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq');
    await page.waitForTimeout(5000);

    const ALL_Contener = await page.$x('//div[@jscontroller="AtSb"]');
    let i = 0;
    for (const container of ALL_Contener) {
        console.log("i value is = ",i)
        await page.waitForTimeout(3000)
        try {
            let ALL_CID = await page.$x("//div[@class ='cXedhc']/a");
            const All_DATA = await extractData(page, container, i,ALL_CID);
            // await page.waitForTimeout(3000);
            // await insertDataToGoogleData(All_DATA, page);
            await page.waitForTimeout(3000);

            i++;
        } catch (error) {
            console.error("Error processing data: ", error);
        }
    }
} catch (error) {
    console.error("Error in retrieving data: ", error);
}



