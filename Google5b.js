//adding Puppeteer library
const pt = require('puppeteer');
const mysql = require('mysql2');
const sprintf = require('sprintf-js').sprintf;

//adding headless flag to false
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

pt.launch({headless:false}).then(async browser => {
   //browser new page
   const page = await browser.newPage();
   //set viewpoint of browser page
   await page.setViewport({ width: 1980, height: 1080 })
   //launch URL
//    await page.goto('https://www.google.com/search?q='+process.argv[2]+'&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq');
   await page.goto('https://www.google.com/search?q=best movers and packers california&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq');

   await page.waitForTimeout(5000)

   await page.waitForXPath('//div[@jscontroller="AtSb"]');

   let ALL_Contener = await page.$x('//div[@jscontroller="AtSb"]');
   let ALL_CID = await page.$x("//div[@class ='cXedhc']/a");
//    ALL_Contener[4].click();
    let i = 0;
    for (const container of ALL_Contener){
        try {

            let All_DATA = {
                'CID':"",
                'Place_Name':"",
                'Address':"",
                'Phone':"",
                'Review_Points':'',
                'Review_Count':'',
                'TimeTable':'',
                'Category':'',
                'description':'',
                'images':'',
                'location':'',
                'done':''

            }

            let attributeName = 'data-cid';
            container.click();
            await page.waitForTimeout(3000)
            let element = ALL_CID[i]
            const attributeValue = await element.evaluate(element => element.getAttribute("data-cid"));
            let Place_Name = await page.waitForXPath("//div[@class='SPZz6b']//h2");
            const elementText = await page.evaluate(el => el.textContent, Place_Name);
            // console.log("Pace Name = ",elementText)
            // console.log(`Cid Number Is =  ${attributeValue}`);
            All_DATA.CID = attributeValue;
            All_DATA.Place_Name = elementText;
            // console.log("The dicstionary",All_DATA.Place_Name)
            // let Place_Data = await page.$x("//div[@class = 'i4J0ge']")
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

            /// ================== Reviews Arrea ================== ///

            let Review_Button = await page.waitForXPath("//span[normalize-space()='Reviews']");
            Review_Button.click();
            await page.waitForTimeout(3000);
            let Review_List = await page.$x("//div[@jscontroller='fIQYlf']");

            try {
                let R_Point = await page.waitForXPath("//span[@class='fzTgPe Aq14fc']");
                const Rating_Point = await page.evaluate(el => el.textContent, R_Point);
                // console.log(Rating_Point)
                All_DATA.Review_Points = Rating_Point
            } catch{
                console.log('Not Found');
            }
            try {
                let R_count = await page.waitForXPath("//li[@class='SbQ21c zQhTRb']//div//span[@class='z5jxId']");
                const Rating_count = await page.evaluate(el => el.textContent, R_count);
                console.log(Rating_count)
                All_DATA.Review_Count = Rating_count
            } catch{
                console.log('Not Found');
            }

            try {
                let Timing = await page.waitForXPath('//table[@class="WgFkxc"]');
                const htmlContent = await page.evaluate(element => element.innerHTML, Timing);
                // const Timing_T = await page.evaluate(el => el.textContent, Timing);
                console.log(htmlContent)
                // const Time_element = Timing_T.split(":");
                All_DATA.TimeTable = htmlContent
            } catch{
                console.log('Time Not Found');
            }

            console.log(All_DATA)

            const insertQuery = 'INSERT INTO Google_Data (Name,CID,Address,Rating,Phone,ReviewsCount,weekdaysTable,Category,description,location,image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [All_DATA.Place_Name,All_DATA.CID,All_DATA.Address,All_DATA.Review_Points,All_DATA.Phone,All_DATA.Review_Count,All_DATA.TimeTable,All_DATA.Category,All_DATA.description,All_DATA.location,All_DATA.images];

            con.query(insertQuery, values, (err, results) => {
                
            if (err) {
                console.error('Error inserting data:', err);
                return;
            }
            console.log('Data inserted successfully');
            // Close the connection after the query
            // con.end();
            });
            await page.waitForTimeout(3000)
            for (let Review_ of Review_List){
                let R_Name = await Review_.waitForXPath("//div[@class='TSUbDb']//a")
                let R_comment = await Review_.waitForXPath("//div[@class='BgXiYe']")
                const R_Name_t = await page.evaluate(el => el.textContent,R_Name)
                const R_comment_t = await page.evaluate(el => el.textContent,R_comment)
                // console.log("R_name = ",R_Name_t)
                // console.log("R_Comment = ",R_comment_t)
                const insertQuery = 'INSERT INTO Review_List (Name,CID,Review) VALUES (?, ?, ?)';
                const values = [R_Name_t,All_DATA.CID,R_comment_t];

                con.query(insertQuery, values, (err, results) => {
                    
                if (err) {
                    console.error('Error inserting data:', err);
                    return;
                }
                console.log('Data inserted successfully');
                // Close the connection after the query
                // con.end();
                });
                await page.waitForTimeout(3000)
            }
            i++;
        }
        catch{
            
        }    
    }

   await page.waitForTimeout(15000)
   await browser.close()
})