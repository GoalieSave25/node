var gameIO = require( "gameio" );
var game = new gameIO.game();
var mapsize = 2000;
var totalObjects = 0;
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
var material = new game.p2.Material();
game.world.addContactMaterial(new game.p2.ContactMaterial( material, material, {
  restitution : 0.8
}));
var staticRect = function( x, y, width, height ) {
    var body = new game.body( 0 );
    body.addShape( new game.rectangle( width, height ) );
    body.position = [ x, y ];
    body.shapes[ 0 ].material = material;
    game.world.addBody( body );
    return body;
}
for( var i = -6*mapsize/2000; i <= 6*mapsize/2000; i++ ) {
	new staticRect( mapsize+500/3+40, i * 1000 / 3, 180/3+80, 1000/3+20 );
	new staticRect( -mapsize-500/3-40, i * 1000 / 3, 180/3+80, 1000/3+20 );
	new staticRect( i * 1000 / 3, mapsize+500/3+40, 1000/3+20, 180/3+80 );
	new staticRect( i * 1000 / 3, -mapsize-500/3-40, 1000/3+20, 180/3+80 );
	totalObjects += 4;
}
function randomPos() {
    var domain = mapsize;
	return 2 * ( Math.random() - 0.5 ) * domain;
}
function randomPlayerPos() {
    var domain = mapsize - 100;
    return 2 * ( Math.random() - 0.5 ) * domain;
}
function addTree( x, y ) {
    var body = new game.body();
    body.addShape( new game.circle( 100 ), [ x, y ] );
    game.world.addBody( body );
}
game.addType(
    "tree",
    function( obj, extra ) {
        obj.body = new game.p2.Body({
            mass: 0
        });
        obj.body.position = [ randomPos(), randomPos() ];
        while( Math.abs( obj.body.position[0] ) < 400 ) {
            obj.body.position = [ randomPos(), randomPos() ];
        }
        var circle = new game.circle( 100 );
        obj.body.addShape( circle );
        obj.needsUpdate = false;
        obj.variation = Math.floor( Math.random() * 4 );
    },
    function( obj, packet ) {
    },
    function( obj, packet ) {
        packet.variation = obj.variation;
    },
    function( obj, packet ) {
        packet.variation = obj.variation;
    }
);
for( var i = 0; i < 33*mapsize*mapsize/2000/2000; i++ ) {
    game.create( "tree" );
    totalObjects++;
}
game.addType(
    "bush",
    function( obj, extra ) {
        obj.body = new game.p2.Body({
            mass: 0
        });
        obj.body.position = [ randomPos(), randomPos() ];
        while( Math.abs( obj.body.position[0] ) < 300 ) {
            obj.body.position = [ randomPos(), randomPos() ];
        }
        obj.needsUpdate = false;
    },
    function( obj, packet ) {
    },
    function( obj, packet ) {
    },
    function( obj, packet ) {
    }
);
for( var i = 0; i < 7*mapsize*mapsize/2000/2000; i++ ) {
    game.create( "bush" );
    totalObjects++;
}
game.addType(
    // Type
    "player",
    // Create
    function( obj, extra ) {
        obj.body = new game.body( 1 );
        //obj.body.material = material;
        obj.body.position = [ randomPlayerPos(), randomPlayerPos() ];
        obj.body.damping = 0.99999;
        var circle = new game.circle( 60 );
        obj.body.addShape( circle );
        obj.playerInput = new game.playerInput();
        obj.needsUpdate = true;
        obj.vehicle = null;
        obj.clicking = false;
        obj.reload = 0;
        obj.closestVehicle = null;
        obj.color = getRandomColor();
    },
    // Tick Update
    function( obj ) {
        /*if( obj.clicking && obj.reload <= 0 ) {
            var b = game.create( "bullet", obj );
            for( var a = 0; a < game.clients.length; a++ ) {
                game.clients[ a ].currentPackets.push( game.add( b ) );
            }
            obj.reload = 3;
        }*/
        obj.reload = Math.max( obj.reload - 1, 0 );
        obj.body.angularVelocity = 0;
        obj.body.angularForce = 0;
        if( obj.vehicle == null ) {
            var speed = 1;
            obj.playerInput.shift ? speed = 1.4 : 0;
            obj.playerInput.up && !obj.playerInput.down ? obj.body.velocity[1] = -600 * speed * game.dt : 0;
            obj.playerInput.down && !obj.playerInput.up ? obj.body.velocity[1] = 600 * speed * game.dt : 0;
            obj.playerInput.left && !obj.playerInput.right ? obj.body.velocity[0] = -600 * speed * game.dt : 0;
            obj.playerInput.right && !obj.playerInput.left ? obj.body.velocity[0] = 600 * speed * game.dt : 0;
        } else {
            var object = obj;
            var movespeed = 0.85;
            var speed = 3;
      var vehicle = object.vehicle;
      var frontWheel = vehicle.frontWheel;
      var backWheel = vehicle.backWheel;
      vehicle.body.angularForce = 0;
      vehicle.body.angularVelocity = 0;
      vehicle.body.damping = 0.9;
      var eng = ( object.playerInput.up || object.playerInput.down ) && !( object.playerInput.up && object.playerInput.down );
      var turnSpeed = object.vehicle.turnSpeed;
      if( object.vehicle.allowDrift && object.playerInput.shift ) {
        turnSpeed *= 1.5;
      }
      if( object.playerInput.left ) {
        if( eng ) {
          vehicle.body.angle -= 0.025 * speed * game.dt * turnSpeed;
          if( object.playerInput.down ) {
            vehicle.body.angle += 0.05 * speed * game.dt * turnSpeed;
          }
        } else if( Math.abs( vehicle.body.velocity[ 0 ] * vehicle.body.velocity[ 0 ] + vehicle.body.velocity[ 1 ] * vehicle.body.velocity[ 1 ] ) > 500 ) {
          vehicle.body.angle -= 0.008 * speed * game.dt * turnSpeed;
        }
      }
      if( object.playerInput.right ) {
        if( eng ) {
          vehicle.body.angle += 0.025 * speed * game.dt * turnSpeed;
          if( object.playerInput.down ) {
            vehicle.body.angle -= 0.05 * speed * game.dt * turnSpeed;
          }
        } else if( Math.abs( vehicle.body.velocity[ 0 ] * vehicle.body.velocity[ 0 ] + vehicle.body.velocity[ 1 ] * vehicle.body.velocity[ 1 ] ) > 500 ) {
          vehicle.body.angle += 0.008 * speed * game.dt * turnSpeed;
        }
      }
      backWheel.engineForce = ( object.playerInput.down ? 1 : 0 ) * object.vehicle.force * 150 * movespeed;
      backWheel.engineForce -= ( object.playerInput.up ? 1 : 0 ) * object.vehicle.force * 150 * movespeed;
        }
        if( obj.playerInput.space ) {
            obj.playerInput.space = false;
            if( obj.vehicle == null && obj.closestVehicle != null && obj.closestVehicle.player == null ) {
                obj.closestVehicle.player = obj;
                obj.vehicle = obj.closestVehicle;
                obj.closestVehicle = null;
                game.world.disableBodyCollision( obj.body, obj.vehicle.body );
            } else if( obj.vehicle != null ) {
                game.world.enableBodyCollision( obj.body, obj.vehicle.body );
                obj.vehicle.player = null;
                obj.vehicle = null;
                obj.closestVehicle = null;
            }
        }
        if( obj.vehicle != null ) {
            obj.body.position[ 0 ] = obj.vehicle.body.position[ 0 ] + Math.cos( obj.vehicle.body.angle + Math.PI / 2 ) * 30;
            obj.body.position[ 1 ] = obj.vehicle.body.position[ 1 ] + Math.sin( obj.vehicle.body.angle + Math.PI / 2 ) * 30;
            obj.body.angle = obj.vehicle.body.angle - Math.PI / 2;
        }
    },
    // Packet Update
    function( obj, packet ) {
        /*if( obj.vehicle != null ) {
            obj.body.position[ 0 ] = obj.vehicle.body.position[ 0 ] + Math.cos( obj.vehicle.body.angle + Math.PI / 2 ) * 30;
            obj.body.position[ 1 ] = obj.vehicle.body.position[ 1 ] + Math.sin( obj.vehicle.body.angle + Math.PI / 2 ) * 30;
            obj.body.angle = obj.vehicle.body.angle - Math.PI / 2;
            packet.object.x = Math.round( obj.body.position[0] ),
            packet.object.y = Math.round( obj.body.position[1] ),
            packet.object.angle = Math.round( obj.body.angle * 100 ) / 100
        }*/
        packet.inVehicle = "";
        if( obj.vehicle != null ) {
            packet.inVehicle = obj.vehicle.type;
        }
    },
    // Add
    function( obj, packet ) {
        
    },
    // Remove
    function( obj, packet ) {
        if( obj.vehicle != null ) {
            obj.vehicle.player = null;
        }
    }
);
game.addType(
    "truck",
    function( obj, extra ) {
        var chassisBody = new game.p2.Body({
          mass: 90*40
      });
      chassisBody.position = [ randomPos(), randomPos() ];
      chassisBody.angle = Math.random() * 2 * Math.PI;
      var boxShape = new game.p2.Box({ width: 230, height: 500 });
      chassisBody.addShape(boxShape);
      var vehicle = new game.p2.TopDownVehicle(chassisBody);
      var frontWheel = vehicle.addWheel({
          localPosition: [0, 0.5]
      });
      frontWheel.setSideFriction(4);
      var backWheel = vehicle.addWheel({
          localPosition: [0, -0.5]
      });
      backWheel.setSideFriction(3);
      vehicle.chassisBody.damping = 0.8;
      vehicle.chassisBody.angularDamping = 0.9;
      vehicle.addToWorld( game.world );
      obj.backWheel = backWheel;
      obj.frontWheel = frontWheel;
      obj.body = chassisBody;
      obj.player = null;
      obj.needsUpdate = true;
      obj.force = 700*120*40/100;
      obj.turnSpeed = 0.7;
      obj.allowDrift = false;
    },
    function( obj, packet ) {
        if( obj.player == null ) {
            obj.backWheel.engineForce = 0;
        }
    },
    function( obj, packet ) {
        
    },
    function( obj, packet ) {
        
    }
);
game.addType(
    "tank",
    function( obj, extra ) {
        var chassisBody = new game.p2.Body({
          mass: 90*100
      });
      chassisBody.position = [ randomPos(), randomPos() ];
      chassisBody.angle = Math.random() * 2 * Math.PI;
      var boxShape = new game.p2.Box({ width: 170, height: 320 });
      chassisBody.addShape(boxShape);
      var vehicle = new game.p2.TopDownVehicle(chassisBody);
      var frontWheel = vehicle.addWheel({
          localPosition: [0, 0.5]
      });
      frontWheel.setSideFriction(4);
      var backWheel = vehicle.addWheel({
          localPosition: [0, -0.5]
      });
      backWheel.setSideFriction(3);
      vehicle.chassisBody.damping = 0.8;
      vehicle.chassisBody.angularDamping = 0.9;
      vehicle.addToWorld( game.world );
      obj.backWheel = backWheel;
      obj.frontWheel = frontWheel;
      obj.body = chassisBody;
      obj.player = null;
      obj.needsUpdate = true;
      obj.force = 700*120;
      obj.turnSpeed = 0.6;
      obj.allowDrift = false;
    },
    function( obj, packet ) {
        if( obj.player == null ) {
            obj.backWheel.engineForce = 0;
        }
    },
    function( obj, packet ) {
        
    },
    function( obj, packet ) {
        
    }
);
game.addType(
    "car",
    function( obj, extra ) {
        var chassisBody = new game.p2.Body({
          mass: 90
      });
      chassisBody.position = [ randomPos(1000), randomPos(1000) ];
      chassisBody.angle = Math.random() * 2 * Math.PI;
      var boxShape = new game.p2.Box({ width: 170, height: 320 });
      chassisBody.addShape(boxShape);
      var vehicle = new game.p2.TopDownVehicle(chassisBody);
      var frontWheel = vehicle.addWheel({
          localPosition: [0, 0.5]
      });
      frontWheel.setSideFriction(4);
      var backWheel = vehicle.addWheel({
          localPosition: [0, -0.5]
      });
      backWheel.setSideFriction(3);
      vehicle.chassisBody.damping = 0.8;
      vehicle.chassisBody.angularDamping = 0.9;
      vehicle.addToWorld( game.world );
      obj.backWheel = backWheel;
      obj.frontWheel = frontWheel;
      obj.body = chassisBody;
      obj.player = null;
      obj.needsUpdate = true;
      obj.force = 1000;
      obj.turnSpeed = 0.9;
      obj.allowDrift = true;
    },
    function( obj, packet ) {
        if( obj.player == null ) {
            obj.backWheel.engineForce = 0;
        }
    },
    function( obj, packet ) {
        
    },
    function( obj, packet ) {
        
    }
);
game.addType(
    "bike",
    function( obj, extra ) {
        var chassisBody = new game.p2.Body({
          mass: 80
      });
      chassisBody.position = [ randomPos(1000), randomPos(1000) ];
      chassisBody.angle = Math.random() * 2 * Math.PI;
      var boxShape = new game.p2.Box({ width: 100, height: 230 });
      chassisBody.addShape(boxShape);
      var vehicle = new game.p2.TopDownVehicle(chassisBody);
      var frontWheel = vehicle.addWheel({
          localPosition: [0, 0.5]
      });
      frontWheel.setSideFriction(4);
      var backWheel = vehicle.addWheel({
          localPosition: [0, -0.5]
      });
      backWheel.setSideFriction(3);
      vehicle.chassisBody.damping = 0.8;
      vehicle.chassisBody.angularDamping = 0.9;
      vehicle.addToWorld( game.world );
      obj.backWheel = backWheel;
      obj.frontWheel = frontWheel;
      obj.body = chassisBody;
      obj.player = null;
      obj.needsUpdate = true;
      obj.force = 1000;
      obj.turnSpeed = 0.9;
      obj.allowDrift = true;
    },
    function( obj, packet ) {
        if( obj.player == null ) {
            obj.backWheel.engineForce = 0;
        }
    },
    function( obj, packet ) {
        
    },
    function( obj, packet ) {
        
    }
);
game.wsopen = function( ws ) {
    if( ws.self !== undefined ) {
        ws.currentPackets.push( { type : "setID", id: ws.self.id } );
        return;
    }
    ws.self = game.create( "player" );
    game.broadcast( game.add( ws.self ) );
    ws.currentPackets.push( { type : "setID", id: ws.self.id } );
}
game.addPacketType(
    "updateControls",
    function( packet, ws ) {
        if( ws.self !== undefined ) {
            ws.self.playerInput[ packet.object.key ] = packet.object.state;
        }
    }
);
game.addPacketType(
    "getObject",
    function( packet, ws ) {
        if( ws.currentPackets === undefined )
            return;
        for( var i = 0; i < game.objects.length; i++ ) {
            if( game.objects[ i ].id == packet.object.id ) {
                ws.currentPackets.push( game.add( game.objects[ i ] ) );
            }
        }
    }
);
game.addPacketType(
    "getID",
    function( packet, ws ) {
        if( ws.self !== undefined )
            ws.currentPackets.push( { type : "setID", id : ws.self.id } );
    }
);
game.addPacketType(
    "setRotation",
    function( packet, ws ) {
        if( ws.self !== undefined ) {
            ws.self.body.angle = packet.object.angle;
        }
    } );
game.addPacketType(
    "mouse",
    function( packet, ws ) {
        if( ws.self !== undefined ) {
            ws.self.clicking = packet.clicking;
        }
    } );
for( var i = 0; i < 2; i++ ) {
    game.create( "car" );
    game.create( "tank" );
    game.create( "bike" );
    game.create( "truck" );
}
game.addCollision( "player", "truck",
    function( player, vehicle ) {
        player.closestVehicle = vehicle;
    }
);
game.addEndcontact( "player", "truck",
    function( player, vehicle ) {
        player.closestVehicle = null;
    }
);
game.addCollision( "player", "car",
    function( player, vehicle ) {
        player.closestVehicle = vehicle;
    }
);
game.addEndcontact( "player", "car",
    function( player, vehicle ) {
        player.closestVehicle = null;
    }
);
game.addCollision( "player", "tank",
    function( player, vehicle ) {
        player.closestVehicle = vehicle;
    }
);
game.addEndcontact( "player", "tank",
    function( player, vehicle ) {
        player.closestVehicle = null;
    }
);
game.addCollision( "player", "bike",
    function( player, vehicle ) {
        player.closestVehicle = vehicle;
    }
);
game.addEndcontact( "player", "bike",
    function( player, vehicle ) {
        player.closestVehicle = null;
    }
);
game.start();