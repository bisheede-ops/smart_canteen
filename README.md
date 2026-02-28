# smart_canteen
college miniproject


#stripe_sandbox
type ipconfig in terminal and copy the ipv4 address of the wireless lan adapter wifi
    change the ipv4n address in the PaymentScreen to the above copied address
if you need to use the stripe sandbox you need to rum the server file in backend/stripe-backend
    go to backend/stripe_backend
        run the server file by typing this
            node server.js
        type the copied ip:3000 in the phone to check and make sure its showing stipe backend running

in the testing you may use 4242 4242 4242 4242 as card number ,11/36 as mm/yy and 123 as cvc and five digits as zipcode if asked
if its not working for you its probobly because you didnt setup an .env file 
    cont me and i will give my .env file or you can setup one by creating a .env file and adding 
        STRIPE_SECRET_KEY=sk_test_key
            which you can get from the stripe dashboard
            also wrap the stack in layout with
                <StripeProvider publishableKey="pk_test_key">

                </StripeProvider>

    
