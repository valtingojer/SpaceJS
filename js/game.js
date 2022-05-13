const GameManager = (
    () => {
        let _isPaused = true;
        let _isOver = false;
        let _lastPausedState = true;

        let _points = 0;

        return {
            Pause: (paused) => { 
                _isPaused = paused; 
                if(_isPaused != _lastPausedState) EventManager.OnPauseChange();
                _lastPausedState = _isPaused;
            },

            IsPaused: () => {
                if(_isOver) return true;
                return _isPaused;
            },

            IsOver: () =>  _isOver,
            
            EnableDisableHand: () => {
                let enable = ()=>{
                    _(".hand").classList.remove("opacity-00-transition");
                };
                EventManager.RegisterOnPauseChange(enable, true);

                let disable = ()=>{
                    _(".hand").classList.add("opacity-00-transition");
                };
                EventManager.RegisterOnPauseChange(disable, false);

                _update(() => {
                    if(GameManager.IsOver()){
                        _(".hand").classList.add("display-none");
                    }
                });
            },
            
            ScreenLimits: () => {
                let screen = _("body");
                let screenW = screen.offsetWidth;
                let screenH = screen.offsetHeight;
                let screenTop = screen.offsetTop;
                let screenLeft = screen.offsetLeft;
                let screenRight = screenLeft + screenW;
                let screenBottom = screenTop + screenH;

                window["Screen"] = {
                    Top: screenTop,
                    Left: screenLeft,
                    Right: screenRight,
                    Bottom: screenBottom
                }
            },
            IsOffScreen(element, tolerance) {
                tolerance = tolerance || 0;
                let screenLimits = window["Screen"];

                let elementTop = element.offsetTop;
                let elementLeft = element.offsetLeft;
                let elementRight = elementLeft + element.offsetWidth;
                let elementBottom = elementTop + element.offsetHeight;

                let isOffScreen = (
                    elementTop < screenLimits.Top - tolerance ||
                    elementLeft < screenLimits.Left - tolerance ||
                    elementRight > screenLimits.Right + tolerance ||
                    elementBottom > screenLimits.Bottom + tolerance
                );

                return isOffScreen;
            },

            MoveToTop: (element, amountPx) => {
                let top = element.offsetTop;
                let newTop = top - amountPx;
                element.style.top = newTop + "px";
            },
            MoveToLeft: (element, amountPx) => {
                let left = element.offsetLeft;
                let newLeft = left - amountPx;
                element.style.left = newLeft + "px";
            },
            MoveToRight: (element, amountPx) => {
                let left = element.offsetLeft;
                let newLeft = left + amountPx;
                element.style.left = newLeft + "px";
            },
            MoveToBottom: (element, amountPx) => {
                let top = element.offsetTop;
                let newTop = top + amountPx;
                element.style.top = newTop + "px";
            },


            GetPoints: () => _points,
            AddPoints: (points) => {
                _points += points;
                EventManager.OnPointsChange();
            },
            GameOver: () => {
                _(".game-over").classList.remove("display-none");
                _isOver = true;
            },
        };
    }
)();

const LevelManager = (() => {
    let _stars = _(".stars");

    let _createStars = (()=>{    
        let star = _(".stars .star")
        let startsN = 150;
        for(let i = 0, j = 0; i < startsN; i++, j++) {
            if(j == 10)
                j = 0;
            let starClone = star.cloneNode(true);
            randomW = h.randomInt(0, 100);
            randomH = h.randomInt(-5, 0) - i;

            starClone.classList.add("speed-" + j);


            starClone.style.left = randomW + "vw";
            starClone.style.top = randomH + "vh";
            _stars.appendChild(starClone);
        }
        star.remove();
    })();

    return {
        EnableStars: ()=>{
            _stars.classList.remove("display-none");
        },
        ChangePointsText: () => {
            let points = GameManager.GetPoints();
            _(".points").innerHTML = points;
            //console.log(points)
        }

    }
})();

const EventManager = (()=>{
    let _onPausedTrue = [];
    let _onPausedFalse = [];
    let _onPointsChanged = [];

    return {
        RegisterOnPauseChange: (func, state) => {
            if(state) _onPausedTrue.push(func);
            else _onPausedFalse.push(func);
        },
        OnPauseChange: () => {
            if(GameManager.IsPaused()) {
                _onPausedTrue.forEach(func => func());
            } else {
                _onPausedFalse.forEach(func => func());
            }
        },

        SingleCollision: (element1Position, element2Position, reference1, reference2) => {
            let isLeftBetweenBorders = element1Position.left > element2Position.left && element1Position.left < element2Position.right;
            let isRightBetweenBorders = element1Position.right > element2Position.left && element1Position.right < element2Position.right;
            let isTopBetweenBorders = element1Position.top > element2Position.top && element1Position.top < element2Position.bottom;
            let isBottomBetweenBorders = element1Position.bottom > element2Position.top && element1Position.bottom < element2Position.bottom;

            let isHorizontal = isLeftBetweenBorders || isRightBetweenBorders;
            let isVertical = isTopBetweenBorders || isBottomBetweenBorders;

            if(isHorizontal && isVertical) {
                return [
                    element1Position,
                    element2Position,
                    reference1,
                    reference2
                ];
            }else{
                return false;
            }
        },

        OnCollisionEnter(element1Positions, element2Positions, references1, references2, trackerFunction, callback){
            if(h.isNullOrUndefined(element1Positions)) return;
            if(h.isNullOrUndefined(element2Positions)) return;
            if(h.isNullOrUndefined(callback)) return;
            if(!h.isFunction(callback)) return;

            for(let i = 0; i < element1Positions.length; i++) {
                for(let j = 0; j < element2Positions.length; j++) {
                    let element1Position = element1Positions[i];
                    let element2Position = element2Positions[j];

                    let reference1 = references1[i];
                    let reference2 = references2[j];

                    let collided = EventManager.SingleCollision(element1Position, element2Position, reference1, reference2);

                    if(collided) {
                        return callback({
                            reference1: reference1,
                            reference2: reference2,
                            trackerFunction: trackerFunction,
                        });
                        
                    }
                }
            }
        },

        

        RegisterOnPointsChange: (func) => {
            _onPointsChanged.push(func);
        },
        OnPointsChange: () => {
            _onPointsChanged.forEach(func => func());
        }
    }
})();

const PlayerManager = (()=>{
    let _spaceshipSprite = _(".spaceship");
    let _spaceship = _(".spaceship-container");
    let _limitLR = 50;
    let _prevPosition = 0;
    let _power = 1;
    let _lastShoot = 0;
    let _shootDelay = 1200;
    let _shootContainer = _(".shoots-container");
    let _displacement = -45
    let _life = 10;

    let _bullet = document.createElement("div");
    _bullet.classList.add("bullet");

    let _laser = document.createElement("div");
    _laser.classList.add("laser");

    return {
        GetShip: () => _spaceship,
        GetShipSprite: () => _spaceshipSprite,
        GetLife: () => _life,
        GetPower: () => _power,
        EnableDisableSpaceship: ()=>{
            EventManager.RegisterOnPauseChange(()=>{
                _spaceshipSprite.classList.add("opacity-03-transition");
            }, true);

            EventManager.RegisterOnPauseChange(()=>{
                _spaceshipSprite.classList.remove("opacity-03-transition");
            }, false);
        },
        MovePlayer: ()=>{
            if(GameManager.IsPaused()){
                _spaceshipSprite.classList.remove("lean-left");
                _spaceshipSprite.classList.remove("lean-right");
                let _prevPosition = _spaceship.style.left;
                return;
            }
             
            let x = window.pageX;

            if(x < window.Screen.Left + _limitLR || x > window.Screen.Right - _limitLR) return;
            _spaceship.style.left = x + "px";

            let isGoingLeft = x < _prevPosition;
            let isGoingRight = x > _prevPosition;

            if(isGoingLeft){
                _spaceshipSprite.classList.add("lean-left");
                _spaceshipSprite.classList.remove("lean-right");
            }else if(isGoingRight) {
                _spaceshipSprite.classList.add("lean-right");
                _spaceshipSprite.classList.remove("lean-left");
            }

            _prevPosition = x;
        },
        Shoot: (cannon, shootType)=>{
            
            if(GameManager.IsPaused()) return;

            let shoot = null;
            let speed = 24;
            if(shootType == "bullet"){
                shoot = _bullet.cloneNode(true);
                speed = h.randomInt(20, 28);
            }else if(shootType == "laser"){
                shoot = _laser.cloneNode(true);
                speed = h.randomInt(28, 38);
            }

            shoot.style.left = (parseInt(_spaceship.offsetLeft)+parseInt(cannon.style.marginLeft)+_displacement) + "px";
            shoot.style.top = (parseInt(_spaceship.offsetTop)+parseInt(cannon.style.marginTop)+_displacement) + "px";
            _shootContainer.appendChild(shoot);

            var move = ()=>{
                GameManager.MoveToTop(shoot, speed);
                if(GameManager.IsOffScreen(shoot, 100)){
                    shoot.remove();
                    _afterUpdateClear(move);
                }

                let myPosition = PlayerManager.BulletPosition(shoot);
                let enemies = _(".enemy");

                let enemiesPositions = EnemyManager.EnemiesPosition(enemies);

                EventManager.OnCollisionEnter([myPosition], enemiesPositions, [shoot], enemies, move, (data)=>{
                    data.reference1.remove();
                    data.reference2.remove();
                    _afterUpdateClear(data.trackerFunction);
                    GameManager.AddPoints(100);
                });

                let boss = BossManager.GetBoss();
                if(boss){
                    EventManager.OnCollisionEnter([myPosition], [BossManager.BossPosition(boss)], [shoot], [boss], move, (data)=>{
                        data.reference1.remove();
                        BossManager.TakeDamage();
                        _afterUpdateClear(data.trackerFunction);
                        GameManager.AddPoints(100);
                    });
                }
            };

            _afterUpdate(move);
        },
        ShootFromCannon: (cannonElements, shootType) => {
            if(GameManager.IsPaused()) return;

            if(typeof cannonElements.length === 'number'){
                for(let i = 0; i < cannonElements.length; i++){
                    let cannon = cannonElements[i];
                    PlayerManager.Shoot(cannon, shootType); 
                }
            }else{
                PlayerManager.Shoot(cannonElements, shootType);
            }
        },
        ShootFromCannons: () => {
            if(GameManager.IsPaused()) return;
            let now = Date.now();
            if(now - _lastShoot < _shootDelay) return;
            _lastShoot = now;
            

            let cannons = [
                _(".spaceship-cannon.power-1"),
                _(".spaceship-cannon.power-2"),
                _(".spaceship-cannon.power-3"),
                _(".spaceship-cannon.power-4"),
            ];
            
            for(let i = 0; i < cannons.length; i++){
                if(_power <= i) break;
                let cannon = cannons[i];
                let shootType = i >= 2 ? "laser" : "bullet";
                PlayerManager.ShootFromCannon(cannon, shootType);
            }
        },
        PowerUp: () => {
            _power++;
        },
        TakeDamage: () => {
            if(_life <= 0) return;

            let lifeBar = _(`.life-bar.amount-${_life}`);
            lifeBar.classList.add("damage");

            _life--;
            if(_life <= 0){
                GameManager.GameOver();
            }
        },
        BulletPosition: (bullet) => {
            let position = {
                left: parseInt(bullet.style.left),
                right: parseInt(bullet.style.left) + parseInt(bullet.style.width),
                top: parseInt(bullet.style.top),
                bottom: parseInt(bullet.style.top) + parseInt(bullet.style.height)
            };
            return position;
        },
        ShipPosition: () => {
            let left = parseInt(_spaceship.style.left);
            let top = parseInt(_spaceship.offsetTop);
            let right = parseInt(left) + parseInt(_spaceshipSprite.clientWidth);
            let bottom = parseInt(top) + parseInt(_spaceshipSprite.clientHeight);

            left = isNaN(left) ? 0 : left;
            top = isNaN(top) ? 0 : top;
            right = isNaN(right) ? 0 : right;
            bottom = isNaN(bottom) ? 0 : bottom;

            let bounds = {
                left: left + _displacement,
                top: top + _displacement,
                right: right + _displacement,
                bottom: bottom + _displacement,
            };

            return bounds;
        }

    }
})();

const EnemyManager = (()=>{
    let _enemies = _(".enemies");
    let _enemy = document.createElement("div");
    _enemy.classList.add("enemy");

    let _enemyInterval = 2000;

    let _displacement = 0;

    return {
        CreateEnemy: ()=>{
            let enemy = _enemy.cloneNode(true);

            let randomW = h.randomInt(10, 90);

            enemy.style.left = randomW + "vw";
            enemy.style.top = 0;

            _enemies.appendChild(enemy);

            // let _debug = {
            //     left: document.createElement("div"),
            //     right: document.createElement("div"),
            //     top: document.createElement("div"),
            //     bottom: document.createElement("div")
            // }
        
            // _debug.left.classList.add("debug");
            // _debug.right.classList.add("debug");
            // _debug.top.classList.add("debug");
            // _debug.bottom.classList.add("debug");
        
            // _("body").appendChild(_debug.left);
            // _("body").appendChild(_debug.right);
            // _("body").appendChild(_debug.top);
            // _("body").appendChild(_debug.bottom);

            let move = ()=>{
                GameManager.MoveToBottom(enemy, 1);
                if(GameManager.IsOffScreen(enemy, 100)){
                    enemy.remove();
                    _afterUpdateClear(move);
                }
                let myPosition = EnemyManager.EnemyPosition(enemy);

                // _debug.left.style.left = myPosition.left + "px";
                // _debug.left.style.top = myPosition.top + "px";
                // _debug.right.style.left = myPosition.right + "px";
                // _debug.right.style.top = myPosition.top + "px";
                // _debug.top.style.top = myPosition.bottom + "px";
                // _debug.top.style.left = myPosition.left + "px";
                // _debug.bottom.style.top = myPosition.bottom + "px";
                // _debug.bottom.style.left = myPosition.right + "px";

                
                let playerPosition = PlayerManager.ShipPosition();
                EventManager.OnCollisionEnter([myPosition], [playerPosition], [enemy], [PlayerManager.GetShip()], move, (data)=>{  
                    PlayerManager.TakeDamage();
                    GameManager.AddPoints(100);
                    data.reference1.remove();
                    _afterUpdateClear(data.trackerFunction);
                });
            };

            _afterUpdate(move);
            
        },
        EnemySpawner: () => {
            setInterval(()=>{
                if(GameManager.IsPaused()) return;
                if(GameManager.GetPoints() >= 1000) return;
                EnemyManager.CreateEnemy();
            }, _enemyInterval);
        },
        EnemiesPosition: (enemies) => {
            let positions = [];
            for(let i = 0; i < enemies.length; i++){
                let enemy = enemies[i];
                let position = EnemyManager.EnemyPosition(enemy);
                positions.push(position);
            }
            return positions;
        },
        EnemyPosition: (enemy)=>{
            let left = parseInt(enemy.style.left);
            let top = parseInt(enemy.style.top);
            let right = parseInt(left);
            let bottom = parseInt(top) + parseInt(enemy.clientHeight);

            left = isNaN(left) ? 0 : left;
            top = isNaN(top) ? 0 : top;
            right = isNaN(right) ? 0 : right;
            bottom = isNaN(bottom) ? 0 : bottom;

            
            right = window.innerWidth * right / 100;
            right += parseInt(enemy.clientWidth)
            left = window.innerWidth * left / 100;

            let bounds = {
                left: left + _displacement,
                top: top + _displacement,
                right: right + _displacement,
                bottom: bottom + _displacement,
            };

            return bounds;
        },
        ClearEnemies: () => {
            let points = GameManager.GetPoints();

            if(points >= 1000){    
                let enemies = document.getElementsByClassName("enemies");
                console.log(enemies.length);
                for(let i = 0; i < enemies.length; i++){
                    enemies[i].remove();
                }
                _afterUpdateClear(EnemyManager.ClearEnemies);
                BossManager.CreateBoss();
            }
        },

    }
})();

const BossManager = (()=>{
    let _displacement = 0;
    let _shootDelay = 1000;

    let _bullet = document.createElement("div");
    _bullet.classList.add("bullet-boss");

    return {
        GetBoss: ()=> _(".boss"),
        CreateBoss: ()=>{
            let boss = _(".boss");
            boss.classList.remove("display-none");

            let x = ((((window.innerWidth / 2) - 150) / window.innerWidth) * 100).toFixed(2) + "vw";
            let y = -200 + "px";

            boss.style.left = x;
            boss.style.top = y;

            _("#game").appendChild(boss);

            let move = ()=>{
                if(GameManager.IsPaused()) return;

                GameManager.MoveToBottom(boss, 0.5);
                if(parseInt(boss.style.top) >= 150){
                    GameManager.GameOver();
                }
            };

            _afterUpdate(move);

            setInterval(BossManager.Shoot(), _shootDelay);
        },
        BossPosition: (boss)=>{
            if(h.isNullOrUndefined(boss)) return;
            if(h.isNullOrUndefined(boss.style)) return;

            let left = parseInt(boss.style.left);
            let top = parseInt(boss.style.top);
            let right = parseInt(left);
            let bottom = parseInt(top) + parseInt(boss.clientHeight);

            left = isNaN(left) ? 0 : left;
            top = isNaN(top) ? 0 : top;
            right = isNaN(right) ? 0 : right;
            bottom = isNaN(bottom) ? 0 : bottom;

            right = window.innerWidth * right / 100;
            right += parseInt(boss.clientWidth)
            left = window.innerWidth * left / 100;

            let bounds = {
                left: left + _displacement,
                top: top + _displacement,
                right: right + _displacement,
                bottom: bottom + _displacement,
            };

            return bounds;
        },
        Shoot: () => {
            if(GameManager.IsPaused()) return;
            let speed = 20;

            let cannons = _(".boss .spaceship-cannon");

            for(let i = 0; i < cannons.length; i++){
                setTimeout(()=>{
                    let cannon = cannons[i];
                    let shoot = _bullet.cloneNode(true);
                    shoot.style.left = 0;
                    shoot.style.top = 0;

                    cannon.appendChild(shoot);

                    let move = ()=>{
                        if(GameManager.IsPaused()) return;
                        if(GameManager.IsOffScreen(shoot, 100)){
                            shoot.remove();
                            _afterUpdateClear(move);
                        }
                        GameManager.MoveToBottom(shoot, 2);

                        let myPosition = BossManager.BulletPosition(shoot);
                        let playerPosition = PlayerManager.ShipPosition();

                        EventManager.OnCollisionEnter([myPosition], [playerPosition], [shoot], [PlayerManager.GetShip()], move, (data)=>{
                            data.reference1.remove();
                            PlayerManager.TakeDamage();
                            _afterUpdateClear(data.trackerFunction);
                        });
                    };
        
                    _afterUpdate(move);



                }, i * 300);
            }


            
        },
        BulletPosition: (bullet) => {
            let left = parseInt(bullet.parentNode.style.marginLeft) + (parseInt(bullet.parentElement.parentElement.style.left) * window.innerWidth / 100); 
            let top = parseInt(bullet.style.top) + parseInt(bullet.parentNode.style.marginTop) + parseInt(bullet.parentElement.parentElement.style.top);
            let position = {
                left: left,
                right: left + bullet.offsetWidth,
                top: top,
                bottom: top + bullet.offsetHeight,
            };
            return position;
        },
        TakeDamage: ()=>{
            let boss = _(".boss");
            boss.classList.add("blink");
            boss.classList.add("faster");

            setTimeout(()=>{
                boss.classList.remove("blink");
                boss.classList.remove("faster");
            }, 1000);

        },
    }
})();

const CollectableManager = (()=>{
    let _powerUps = _(".powerups");
    let _powerUp = document.createElement("div");
    let _powerUpInterval = 3000;
    _powerUp.classList.add("powerup");
    _powerUp.classList.add("blink");

    let _displacement = 0;

    return {
        CreatePowerUp: ()=>{
            let powerUp = _powerUp.cloneNode(true);

            let randomW = h.randomInt(10, 90);

            powerUp.style.left = randomW + "vw";
            powerUp.style.top = 0;
            _powerUps.appendChild(powerUp);

            let move = ()=>{
                GameManager.MoveToBottom(powerUp, 3);
                if(GameManager.IsOffScreen(powerUp, 100)){
                    powerUp.remove();
                    _afterUpdateClear(move);
                }
                let myPosition = CollectableManager.PowerUpPosition(powerUp);

                let playerPosition = PlayerManager.ShipPosition();
                EventManager.OnCollisionEnter([myPosition], [playerPosition], [powerUp], [PlayerManager.GetShip()], move, (data)=>{  
                    PlayerManager.PowerUp();
                    data.reference1.remove();
                    _afterUpdateClear(data.trackerFunction);
                });
            };

            _afterUpdate(move);
        },
        PowerUpSpawner: () => {
            setInterval(()=>{
                if(GameManager.IsPaused()) return;
                if(GameManager.GetPoints() >= 1000) return;
                if(PlayerManager.GetPower() >= 5) return;
                CollectableManager.CreatePowerUp();
            }, _powerUpInterval);
        },
        PowerUpPosition: (powerUpElement) => {
            let left = parseInt(powerUpElement.style.left);
            let top = parseInt(powerUpElement.style.top);
            let right = parseInt(left);
            let bottom = parseInt(top) + parseInt(powerUpElement.clientHeight);

            left = isNaN(left) ? 0 : left;
            top = isNaN(top) ? 0 : top;
            right = isNaN(right) ? 0 : right;
            bottom = isNaN(bottom) ? 0 : bottom;

            right = window.innerWidth * right / 100;
            right += parseInt(powerUpElement.clientWidth)
            left = window.innerWidth * left / 100;

            let bounds = {
                left: left + _displacement,
                top: top + _displacement,
                right: right + _displacement,
                bottom: bottom + _displacement,
            };

            return bounds;
        },
    }
})();

const StartGame = () => {
    LevelManager.EnableStars();
    GameManager.EnableDisableHand();
    PlayerManager.EnableDisableSpaceship();
    CollectableManager.PowerUpSpawner();
    EnemyManager.EnemySpawner();
    EventManager.RegisterOnPointsChange(LevelManager.ChangePointsText);
}


const Main = () => {
    window.pageX = typeof window.pageX == "undefined" ? window.innerWidth / 2 : window.pageX;
    window.pageY = typeof window.pageY == "undefined" ? 0 : window.pageY;
    StartGame();
}

_start(Main);
_update(()=>{
    GameManager.Pause(!window.isMouseDown)
    GameManager.ScreenLimits();
    PlayerManager.MovePlayer();
    PlayerManager.ShootFromCannons();
    PlayerManager.ShipPosition();
    
})
_afterUpdate(EnemyManager.ClearEnemies);
