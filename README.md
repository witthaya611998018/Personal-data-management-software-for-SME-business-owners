
โปรแกรมบริหารจัดการข้อมูลส่วนบุคคลสำหรับผู้ประกอบการ SMEs (โปรเจคจบ มหาวิทยาลัย)
โปรเเกรมสำหรับจัดการข้อมูลส่วนบุคคล ที่ออกแบบมาเพื่อช่วยให้ธุรกิจขนาดเล็กและขนาดกลาง (SMEs) สามารถปฏิบัติตาม **พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)** ได้ง่ายขึ้น โดยไม่จำเป็นต้องมีทีมกฎหมาย
## 📌 ฟีเจอร์หลัก

- **ระบบจัดการคุกกี้ (Cookie Consent Management)**  
  สร้างแบนเนอร์ขอความยินยอมคุกกี้ และสคริปต์สำหรับฝังลงเว็บไซต์

- **ระบบขอความยินยอมทางอีเมล (Email Consent)**  
  ส่งคำขอความยินยอมไปยังผู้ใช้ทางอีเมล พร้อมระบบติดตามผล (ให้ความยินยอม / ปฏิเสธ / ยังไม่ตอบกลับ)

- **เอกสารความยินยอมอิเล็กทรอนิกส์ (Paper Consent)**  
  แบบฟอร์มดิจิทัลสำหรับใช้เก็บความยินยอมจากผู้ใช้ในสถานที่จริง

- **แดชบอร์ดจัดการ Consent**  
  หน้าจอรวมการจัดการคำยินยอมทั้งหมด และเชื่อมโยงกับเจ้าของข้อมูล


- **ระบบจัดทำนโยบายความเป็นส่วนตัว (Privacy Policy Generator)**  
  สร้างและจัดการเอกสารนโยบายความเป็นส่วนตัว พร้อมการติดตามเวอร์ชัน

- **ระบบจัดการเอกสารตาม PDPA**  
  บริหารจัดการเอกสารสำคัญ เช่น นโยบายความเป็นส่วนตัว เอกสารความยินยอม

- **ระบบรับเรื่องร้องเรียน**  
  เปิดช่องทางให้เจ้าของข้อมูลสามารถยื่นคำร้องเรียนตาม PDPA

- **ระบบกำหนดมาตรการรักษาความปลอดภัย**  
  กำหนดมาตรการทางเทคนิคและองค์กรเพื่อป้องกันข้อมูลส่วนบุคคล

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/witthaya611998018/Personal-data-management-software-for-SME-business-owners.git
cd Personal-data-management-software-for-SME-business-owners
```
### 2. ติดตั้ง dependencies
```bash
npm install
```
# วิธีการ Setup Project
- 1. npm install เพื่อทำการติดตั้ง node_modules package
- 2. สร้าง file ชื่อว่า .env
- 3. ทำกการ copy ข้อมูลดังนี้

### 3. ตั้งค่าฐานข้อมูล  
นำเข้าไฟล์ `/data_bases/PDPA_DataBases.sql` ไปยัง MySQL

### 4. สร้างไฟล์ `.env` และกำหนดค่า
```
PORT=8001
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=pdpa_db
```
### 5. เริ่มต้นเซิร์ฟเวอร์
```bash
node  app.js
```

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
EMAIL_API= dev กรณีที่อยู่ใน dev ถ้าอยู่ใน ที่ดิน http://127.0.0.1/SMTPMailPIPR/api/SMTPMailPIPR/SendMail
````

### เช่น 

````shell
PORT=8001
DB_HOST=127.0.0.1
DB_USER=users
DB_PASSWORD=password
DB_NAME=DATA
FOLDER_FILESUPLOAD=files_upload_dev
COOKIE_DOMAIN=http://127.0.0.1:8001
COOKIE_API=http://127.0.0.1:8000/api/send_cookieTypes
EMAIL_API=dev

````
