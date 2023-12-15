from selenium import webdriver
import time
from socket import timeout
from selenium import webdriver
import time
import time
import csv
#from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import mysql.connector

def add_data_Into_database(items):
    
    mydb = mysql.connector.connect(
    host="localhost",
    user="yourusername",
    password="yourpassword",
    database="mydatabase"
    )

    mycursor = mydb.cursor()

    sql = "INSERT INTO customers (Name, Phone, Address, Rating, ReviewsCount, description, CID) VALUES (%s, %s,%s,%s,%s,%s,%s)"
    val = (items['Name'], items['Phone'],items['Address'],items['Rating'],items['Count_Review'],items['Description'],items['CID_Number'])
    mycursor.execute(sql, val)

    mydb.commit()

    return

def Driver_setting(key_word):

    driver.get(f"https://www.google.com/search?q={key_word}&gs_lcp=Cgxnd&tbs=lf:1,lf_ui:2&tbm=lcl&rflfq") 
    print(driver.current_url)  ### Karnal School Data #####
    time.sleep(10)

    items ={
        
        "CID_Number":'Null',
        'Name':"Null",
        'Description':"Null",
        'Phone':"Null",
        'Address':"Null",
        'Areas_served':"Null",
        'Rating':'Null',
        'Count_Review':'Null',
        'Image_url':"Null",
    }
    # driver.save_screenshot("abs.jpg")
    try:
        area_field =  driver.find_element(By.XPATH,"//div[@class='vwVdIc']")
        attribute_value = area_field.get_attribute('data-cid')
    except:
        pass 

    All_Controller = driver.find_elements(By.XPATH,"//div[@jscontroller='AtSb']")
    Cid_number =  driver.find_elements(By.XPATH,'//*[@class="VkpGBb"]/div/a')
    i = 0
    for controller in All_Controller:
        try:
            attribute_value = Cid_number[i].get_attribute('data-cid')
            # print("this is = ",attribute_value)
            items['CID_Number'] = attribute_value
        except:
            pass 
        controller.click()
        time.sleep(3)
        time.sleep(2)
        try:
            Place_name = driver.find_element(By.XPATH,"//div[@class='SPZz6b']").text
            # print("Name = ",Place_name)
            items["Name"] = Place_name
            items_names = driver.find_elements(By.XPATH,"//div[@class = 'Z1hOCe']")
            try:
                area_field =  driver.find_element(By.XPATH,'//*[@id="akp_tsuid_29"]/div/div[1]/div/g-sticky-content-container/div/block-component/div/div[1]/div/div/div/div[1]/div/div/div[5]/g-flippy-carousel/div/div/ol/li[1]/span/div/div/div/div[2]/c-wiz/div/div').text
                area_field = area_field.split(":")[1]
                items['Areas_served'] = area_field
            except:
                pass

            for item_name in items_names:
                name_item = item_name.text
                if 'hone' in name_item:
                    name_itema =  name_item.split(":")[1]
                    items['Phone']= name_itema
                if 'ddress' in name_item:
                    name_itema =  name_item.split(":")[1]
                    items['Address']= name_itema
                else:
                    items['Address'] = 'Null'    

            # Image_find = driver.find_element(By.XPATH,'//div[@role="img"]').get_attribute("style")
            # Image_url = str(Image_find).split("url(")[1].split(")")[0].replace('"','')
            # print(Image_url)
            # School_all_item["Image_url"] = Image_url
            time.sleep(1)
        except:
            pass 

        time.sleep(2)
        try:
            descript_part = driver.find_element(By.XPATH,"//*[@jscontroller = 'EqEl2e']").get_attribute("data-long-text")
            items['Description'] = descript_part
        except:
            items['Description'] = 'Null'

        button = driver.find_element(By.XPATH,"//span[normalize-space()='Reviews']").click()
        time.sleep(2)
        try:
            # Rating_part = driver.find_element(By.XPATH,"//*[@class='tp9Rdc']")
            Rating = driver.find_element(By.XPATH,'//*[@id="akp_tsuid_29"]/div/div[1]/div/g-sticky-content-container/div/block-component/div/div[1]/div/div/div/div[1]/div/div/div[5]/g-flippy-carousel/div/div/ol/li[2]/span/div/div/div/div[1]/div/div[2]/div/div/div[1]/div[2]/div/span')
            items['Rating'] = Rating.text
        except:
            items['Rating'] = 'Null'
            
        time.sleep(1)  
        try:
            review_count = driver.find_element(By.XPATH,'//*[@id="akp_tsuid_29"]/div/div[1]/div/g-sticky-content-container/div/block-component/div/div[1]/div/div/div/div[1]/div/div/div[5]/g-flippy-carousel/div/div/ol/li[2]/span/div/div/div/div[1]/div/div[2]/div/div/div[1]/div[2]/div/div/span/span').text
            items['Count_Review'] = review_count
            # for i_reviews in reviews:
            #     print("this is revies = ",i_reviews)
        except:
            items['Count_Review'] = "Null"

        i+=1

        add_data_Into_database(items)           

if __name__ == "__main__":
    print("Yes")

    chrome_options = Options()
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--start-maximized")
    # chrome_options.add_argument('--headless')

    service = Service(executable_path="chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    keywords = "Dumpster Rentals in trussville, al"
    Driver_setting(keywords)