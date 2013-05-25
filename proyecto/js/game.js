$(document).ready(function(){


function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}

// Usage:

preload([
    'images/hormiga-1.png',
    'images/hormiga-10.png',
    'images/hormiga-11.png',
    'images/hormiga-9.png',
    'images/hormiga1.png',
    'images/hormiga10.png',
    'images/hormiga11.png',
    'images/hormiga9.png',
    'images/ciruela.png',
    'images/frutilla.png',
    'images/limon.png',
    'images/pasto.jpg'
]);

    var canvas_width = 320;  
    var canvas_height = 480;  
    var FPS = 30;
    var duracion_juego_segs = 20;
    var ciclos_restantes = duracion_juego_segs * FPS;
    var delay_entre_frutas = 1 * FPS;
    var ciclos_para_nueva_fruta = 0;
    var frutas = [];  
    c = $('#c').get(0);         
    ctx = c.getContext('2d');  
    c.width = canvas_width;  
    c.height = canvas_height;  
   
    var image_limon = new Image();
    image_limon.src = "images/limon.png";
    var image_frutilla = new Image();
    image_frutilla.src = "images/frutilla.png";
    var image_ciruela = new Image();
    image_ciruela.src = "images/ciruela.png";
   
   function DegToRad(d) {
    // Converts degrees to radians
    return d * 0.0174532925199432957;
}
   
    var player_rotation = 1;
    var pos_anterior = player_rotation;
    var player = {
        color: "#0000AA",
        step: 5,
        x: (canvas_width/2)-16,
        y: (canvas_height/2)-16,
        width: 32,
        height: 32,
        draw: function(){  
            image = new Image();  
            image.src = "images/hormiga"+player_rotation+".png";  
            ctx.drawImage(image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);  
        },
        bite: function() {
            Sound.play("bite");
        }
    };

    var status_gral = {
        segundos: duracion_juego_segs,
        puntos: 0,
        draw: function() {
            ctx.fillStyle = "#000000"; // Set color to black
            ctx.fillText("Puntos: "+this.puntos, 10, 20);
            ctx.fillText("Tiempo: "+this.segundos+" segs", 240, 20);
        }
    }

    var timer = setInterval(function() {
        
        clear();
        check_collisions();
        update();
        draw();
        ciclos_restantes--;
        
        if (ciclos_restantes < 0) {
            clearInterval(timer);
            ctx.fillStyle = "#000000"; // Set color to black
            ctx.font = 'italic 40px Calibri';
            ctx.fillText(status_gral.puntos+" puntos!!!", 50, 150);
        }
        
        
    }, 1000/FPS);

    
    var lado_fruta = 16;
    function Fruta(tipo) {
        
        var color = "#000000";
        var puntos = 10;
        switch (tipo){
            case 1:
                image = image_frutilla;
                puntos = 20;
                break;
            case 2:
                image = image_ciruela;
                puntos = 50;
                break;
            case 3:
                image = image_limon;
                puntos = 100;
                break;
        }
        
        var fruta = {
            ciclos_visible: 4*FPS,
            activa: true,
            image: image,
            puntos: puntos,
            x: Math.floor((Math.random()*(canvas_width-lado_fruta))+1), 
            y: Math.floor((Math.random()*(canvas_height-lado_fruta-32))+33), 
            width: lado_fruta,
            height: lado_fruta,
            draw: function() {
                //ctx.fillStyle = this.color;
                //ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height); 
            },
            update: function(){
                this.ciclos_visible--;
                this.activa = this.ciclos_visible!==0 && this.activa;
            }
            
        };
        
        return fruta;
    }

    function update(){
    
        pos_anterior = player_rotation;
        player_rotation = 0;   
        if (keydown.left) {
            if (player.x>0){
                player.x -= player.step;
            }
            player_rotation += -10;
        }

        if (keydown.right) {
            if ((player.x+player.width)<canvas_width) {
                player.x += player.step;
            }
            player_rotation += 10;
        }
        
        if (keydown.up) {
            
            if (player.y>32){
                player.y-=player.step;
            }
            player_rotation += 1;
        }
        
        if (keydown.down) {
            if ((player.y+player.height)<canvas_height) {
                player.y += player.step;
            }
            player_rotation += -1;
        }

        if (player_rotation === 0) {
            player_rotation = pos_anterior;
        }

        status_gral.segundos =  Math.floor(ciclos_restantes /FPS);
    
        frutas.forEach(function(f) {
            f.update();
        });

        frutas = frutas.filter(function(f) {
            return f.activa;
        });
        
        
        if (ciclos_para_nueva_fruta === 0) {
            frutas.push(Fruta(Math.floor((Math.random()*3)+1)));    
            ciclos_para_nueva_fruta = delay_entre_frutas;
        }
        ciclos_para_nueva_fruta--;    
    
    }

    function draw(){
                
        frutas.forEach(function(f) {
            f.draw();
        });
        player.draw();
        status_gral.draw();
        
    }

    function clear() {
        ctx.clearRect(0, 0, canvas_width, canvas_height);
    }
    
    function check_collisions() {
    
        frutas.forEach(function(f) {
            if (collides(f,player)){
                
                status_gral.puntos += f.puntos;
                f.activa = false;
                player.bite();
            }
        });
    
    }

});  


function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}