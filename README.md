# Wasle-Backend

This is a simple backend developed using Express and NodeJs that interacts with a MySQL database.
It implements the basic functionalities of a peer-to-peer platform that connects NGOs to families in need using an incentive-based and need-based mechanism.
Some functionalities are as follows:
1. Signup as any user type
2. Request aid from an NGO and have this aid approved or rejected
3. Take attendance for students enrolled in the program and upload the attendance sheet to the database
4. Manage an active wallet with a balance that auto-increments every month if a minimum attendance quota is met by the student.
5. Redeem a token for a given service

## Notes
This backend is in no way production ready is simply used for prototyping and proof of concept.

## Next Steps
1. The app should be hosted on a cloud provider
2. The backend should have a proper signup/login system integrated
3. The local time-triggered function should be replaced with an always-active, time-triggered cloud function
4. A full frontend should be developed
