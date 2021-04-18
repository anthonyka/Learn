# Wasle-Backend

This is a simple backend developed using Express and NodeJs that interacts with a MySQL database.
It implements the basic functionalities of a peer-to-peer platform that connects NGOs to families in need using an incentive-based and need-based mechanism.
Some functionalities are as follows:
1. Signup as any user type
2. Request aid from an NGO and have this aid approved or rejected
3. Take attendance for students enrolled in the program and upload the attendance sheet to the database
4. Manage an active wallet with a balance that auto-increments every month if a minimum attendance quota is met by the student.
5. Redeem a token for a given service

## Functions
Functions used in the code.

### APIs

| URL  | HTTP | Inputs | Outputs |
| :---: | :---: | :---: | :---: |
| /ngo_create | POST | body: name,email,pass,phone,numberOfBeneficiaries,loc1,loc2,loc3,service1,service2,service3 | success or error |
| /user_account/:id | GET | header: user_id | json with user info |
| /NGO | GET |  | json with list of NGOs |
| /NGO-family-list | GET |  | json list of families with pending requests |
| /ngo-manage-request | POST | body: ngo_token, family_id, status | success if status updated, else error |
| /school_create | POST | body: name,email,pass,phone,location | success or error |
| /student_create | POST | body: family_token, fname, lname, age, occupation, degree, language, school_name | success or error |
| /wallet-balance/:id | GET | header: student_id | json balance of student |
| /redeem_coin | POST | body: family_token, student_id, ngo_id | success or error |
| /teacher_create | POST | body: family_token, fname, lname, email, pass, phone, school_name | success or error |
| /teacher_student_attendance | POST | body: teacher_token, student_id, attendance, attendance_sheet | success with attendance sheet display or error  |
| /add_student_to_class | POST | body: teacher_token, student_id | success or error |
| /teacher_student_list/:id | GET | header: id | json with list of students in a teacher's class |

### Internal Functions

| Name  | Purpose |
| :---: | :---: |
| uploadAttendanceSheet | upload the attendance sheet to an Azure blob storage |
| AddFSrelation | add a student to a family |
| AddLocation | add a location for a user |
| AddSSrelation |add student to a school |
| AddSTrelation |add teacher to a school |
| AddService |add a service of a user |
| AddTSrelation |add student to a teacher |
| addCoins |adds a coin to a student's balance if attendance condition is met |
| decreaseBalance |decrease balance of a student |
| resetAid |resets the aid status of a family |
| resetAttendance |resets attendance records for all students |
| job |a scheduled function that calls addCoins at the beginning of every month |




## Notes
This backend is in no way production ready is simply used for prototyping and proof of concept.

## Next Steps
1. The app should be hosted on a cloud provider
2. The backend should have a proper signup/login system integrated
3. The local time-triggered function should be replaced with an always-active, time-triggered cloud function
4. A full frontend should be developed
