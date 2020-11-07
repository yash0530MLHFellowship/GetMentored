# GetMentored

## Getting Started
```
git clone https://github.com/GetMentored/GetMentored.git
```
```
npm install // install dependencies
```
```
nodemon // start server
```
```
go to localhost:3000
```

## Push updates to heroku
```
git push heroku master
```

## Structure explanation
config:  
    contains constants and auth helpers  


models:  
    database models (MongoDB)  


public:  
    frontend scripts, images, assets, styles  


routes:  
    handlers for various routes, grouped according to base route  


views:  
    various routes to be rendered according to routes, grouped approx according to base route  


app.js:  
    main file to run the website app  

