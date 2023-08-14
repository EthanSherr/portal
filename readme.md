## installation


## dev setup
Using the camera in a webapp requires https, and https is annoying to implement in development especially whent rying to access 10.0.0.184 within private network for example.
I set this up in development by adding setting my chrome://flags specially.  I enabled "insecure origins treated as secure" and added "http://10.0.0.184:3000".  Also I switch all the protocols from https to http, although I may make that an environment variable if I try to deploy this thing IRL.  (I'd then just have a real signed cert/key, I tried using the pem npm module but realized that ofc browsers hate to see a self signed certificate, and I had a lot of issues with untrested self signed certs, plus then invalid common name, ...and I think whitelisting http://10.0.0.184:3000 as secure option is just a little easier.)