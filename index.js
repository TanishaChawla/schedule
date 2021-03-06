/**
 * Created by systems on 09-09-2016.
 */
var express = require('express');
var app=express();
var path=require('path');
var bodyparser=require('body-parser');
var cors=require('cors');

app.use(bodyparser());
app.set('port',process.env.PORT || 4500);
var ejs=require('ejs');
app.set('views',path.join(__dirname,'views'));
app.set('view engine',ejs);
app.use(cors());
var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var schema= new Schema({
    name: String,
    startDate: String,
    startTime: Array,
    endTime: Array,
    venue: Array
});
var schedule=mongoose.model('schedule',schema);
var url = process.env.MONGO_URI||'mongodb://localhost/scheduledb';

mongoose.connect(url);



app.get('/',function(req,res){
    res.render('home.ejs');
});
app.get('/submit',function(req,res){
    res.render('submit.ejs');
});
app.post('/schedule/add',function(req,res){
    var s= new schedule({
        name: req.body.name,
        startDate: req.body.startDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        venue: req.body.venue
    });
    s.save(function(err,userobj){
        if(err){
            console.log(err);
        }
        else if(userobj){
            console.log(userobj);
            res.redirect(303,'/thankyou');
        }
        else{
            console.log("could not save");
        }
    })
});
app.get('/delete',function(req,res){
    res.render('delete.ejs');
});
app.post('/schedule/delete',function(req,res){
    schedule.remove({name: req.body.name,startDate:req.body.startDate},function(err){
        if(err){
            console.log("could not delete this entry");
        }
        else
        {
            console.log(req.body.name+" deleted successfully");
            res.redirect(303,'/thankyou');
        }

    })
});

app.get('/update',function(req,res){
    res.render('update.ejs');
});
app.post('/schedule/update',function(req,res){
    schedule.findOneAndUpdate({name: req.body.name},{name: req.body.name,
        startDate: req.body.startDate,
        startTime:req.body.startTime,
        endTime:req.body.endTime,
        venue: req.body.venue},function(err){
        if(err){
            console.log("could not update");
        }
        else
        {
            console.log("successfully saved");
            res.redirect(303,'/thankyou');
        }
    })
});

app.get('/thankyou',function(req,res){
    res.render('thankyou.ejs');
});
app.get('/api',function(req,res) {
    schedule.find(function (err, schedules) {
        if (err) {
            res.send(500, 'Error: Database error');
        }
        res.json(schedules.map(function (a) {
            return {
                name: a.name,
                startDate: a.startDate,
                startTime: a.startTime,
                endTime: a.endTime,
                venue: a.venue
            }
        }));
    });
});
app.use(function(err,res,next){
    res.status(404);
    res.send('404 Page not Found');
});
app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500);
    res.send('500');
});
app.listen(app.get('port'),function(){
    console.log('started on '+app.get('port'));
});