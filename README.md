# วิธีการ Setup Project

- 1. npm install เพื่อทำการติดตั้ง node_modules package
- 2. สร้าง file ชื่อว่า .env
- 3. ทำกการ copy ข้อมูลดังนี้

## Example

````shell
PORT= port ที่ต้องการให้ server run
DB_HOST= ip host database
DB_USER= username database
DB_PASSWORD= password database
DB_NAME= name database
FOLDER_FILESUPLOAD = ชื่อ folder ที่ทำการ upload ข้อมูลลงไป
COOKIE_DOMAIN= ชื่อโดเมน
COOKIE_API= URL สำหรับส่งข้อมูลมาเก็บ Popup
EMAIL_API= dev กรณีที่อยู่ใน dev ถ้าอยู่ใน ที่ดิน http://172.16.42.126/SMTPMailPIPR/api/SMTPMailPIPR/SendMail
````

### เช่น 

````shell
PORT=8001
DB_HOST=119.81.197.130
DB_USER=users
DB_PASSWORD=P@ssw0rd
DB_NAME=PDPA_ROPA
FOLDER_FILESUPLOAD=files_upload_dev
COOKIE_DOMAIN=http://119.81.197.130:8001
COOKIE_API=http://119.81.197.130:8001/api/send_cookieTypes
EMAIL_API=dev

````
