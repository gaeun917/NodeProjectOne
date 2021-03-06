// * this app is designed for a seller who has a small number of products on a limited time offer

// 1. by clicking a heart icon on the right corner of each item, clients show their interest on the item
//    and the heart icon is changed to a check mark
// 2. the item count next to the icon will be decrease : count --
// 3. clicking the check mark means ordering the item. An alert window will ask to confirm the order.
//     if you say yes, it will be disappear on the list and the item will be placed in the shopping cart.
// 4. products on the list can be saved for 10 mins and after that they will be gone.


 //1. module
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var app = express();


// 2. constructor
var counter = 0;
function Product(name, image, price, count) {
                this.index = counter++;
                this.name = name;
                this.image = image;
                this.price = price;
                this.count = count;
}


 // 3. variable : call constructor and put Product object inside products array
var products = [
                new Product('JavaScript', 'clock.png', 28, 20),
                new Product('jQuery', 'diamond.png', 28, 15),
                new Product('Node.js', 'graph.png', 32, 2),
                new Product('Socket.io', 'joypad.png', 17, 34),
                new Product('Connect', 'man.png', 18, 14),
                new Product('Express', 'map.png', 31, 23),
                new Product('EJS', 'wooman.png', 12, 12)
];



// 4. web server & listen to the port
var server = http.createServer(app);
server.listen(52273, function () {
    console.log('Server Running at http://127.0.0.1:52273');
});
// 5. server set up
app.use(express.static(__dirname + '/public'));




// 6. Router
app.get('/', function (request, response) {
    // 6.1 read HTMLPage.html with utf8
    var htmlPage = fs.readFileSync('HTMLPage.html', 'utf8');
    // 6.2 render(on, with) viewpage with this data
    var dataToBrowser = ejs.render(htmlPage, {  products: products});
    response.send(dataToBrowser);
});



// 7. Socket.io
var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {


    /** 1 function: onReturn, 3 evnets: cart, buy, return
     * product constructor, product array, cart array
     * */



    // 7.1 onReturn
    function onReturn(index) {
        //7.1.1 increase products
        products[index].count++;
        //7.1.3 delete cart
        delete cart[index];
        //7.1.2 get rid of timer
        clearTimeout(cart[index].timerID);

        //7.1.4 count socket event
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count });
    };





    // 7.2 cart event
    var cart = {};
    socket.on('cart', function (index) {

        // 7.2.1 decrease products
        products[index].count--;
        //7.2.2 put product in cart
        cart[index] = {};
        cart[index].index = index;
        //7.2.3 start timer
        cart[index].timerID = setTimeout(function () {
            onReturn(index);
        }, 1000 * 60 * 10);

        // 7.4 count socket event
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count
                                  });
    });




    // 7.3 buy event
    socket.on('buy', function (index) {
        // 7.3.1 get rid of timer
        clearTimeout(cart[index].timerID);
        // 7.3.2 delete cart
        delete cart[index];

        // 7.3.3 count event .emit
        io.sockets.emit('count', {  index: index,
                                    count: products[index].count
                                 });
    });



    // 7.4 return event
    socket.on('return', function (index) {
        onReturn(index);
    });
});