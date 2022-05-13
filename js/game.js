






const GameManager = (
    () => {
        let _isPaused = true;
        let _lastPausedState = true;

        return {
            Pause: (paused) => { 
                _isPaused = paused; 
                if(_isPaused != _lastPausedState) EventManager.OnPauseChange();
                _lastPausedState = _isPaused;
            },
            IsPaused: () => _isPaused,
            
            EnableDisableHand: () => {
                EventManager.RegisterOnPauseChange(()=>{
                    _(".hand").classList.remove("opacity-00-transition");
                }, true);

                EventManager.RegisterOnPauseChange(()=>{
                    _(".hand").classList.add("opacity-00-transition");
                }, false);
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
    }
})();

const EventManager = (()=>{
    let _onPausedTrue = [];
    let _onPausedFalse = [];

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

        OnCollisionEnter(element1Position, element2Position, callback){
            if(h.isNullOrUndefined(element1Position)) return;
            if(h.isNullOrUndefined(element2Position)) return;
            if(h.isNullOrUndefined(callback)) return;
            if(!h.isFunction(callback)) return;

            // console.log(element1Position, element2Position);

            let isLeftBetweenBorders = element1Position.left > element2Position.left && element1Position.left < element2Position.right;
            let isRightBetweenBorders = element1Position.right > element2Position.left && element1Position.right < element2Position.right;
            let isTopBetweenBorders = element1Position.top > element2Position.top && element1Position.top < element2Position.bottom;
            let isBottomBetweenBorders = element1Position.bottom > element2Position.top && element1Position.bottom < element2Position.bottom;

            let isHorizontal = isLeftBetweenBorders || isRightBetweenBorders;
            let isVertical = isTopBetweenBorders || isBottomBetweenBorders;

            // console.log(isHorizontal, isVertical);

            if(isHorizontal && isVertical) {
                callback();
            }
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
    let _shootDelay = 1000;
    let _shootContainer = _(".shoots-container");
    let _displacement = -45

    let _bullet = document.createElement("div");
    _bullet.classList.add("bullet");

    let _laser = document.createElement("div");
    _laser.classList.add("laser");

    // _debug = {
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

    return {
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
                // _(".spaceship-cannon.power-5"),
                // _(".spaceship-cannon.power-6")
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

            // _debug.left.style.left = bounds.left + "px";
            // _debug.left.style.top = bounds.top + "px";

            // _debug.right.style.left = bounds.right + "px";
            // _debug.right.style.top = bounds.top + "px";

            // _debug.top.style.top = bounds.bottom + "px";
            // _debug.top.style.left = bounds.left + "px";

            // _debug.bottom.style.top = bounds.bottom + "px";
            // _debug.bottom.style.left = bounds.right + "px";

            return bounds;
        }

    }
})();

const EnemyManager = (()=>{})();

const BossManager = (()=>{})();

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
            powerUp.style.top = 0 + "vh";
            _powerUps.appendChild(powerUp);


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
                GameManager.MoveToBottom(powerUp, 3);
                if(GameManager.IsOffScreen(powerUp, 100)){
                    powerUp.remove();
                    _afterUpdateClear(move);
                }
                let myPosition = CollectableManager.PowerUpPosition(powerUp);

                // _debug.left.style.left = myPosition.left + "px";
                // _debug.left.style.top = myPosition.top + "px";
                // _debug.right.style.left = myPosition.right + "px";
                // _debug.right.style.top = myPosition.top + "px";
                // _debug.top.style.top = myPosition.bottom + "px";
                // _debug.top.style.left = myPosition.left + "px";
                // _debug.bottom.style.top = myPosition.bottom + "px";
                // _debug.bottom.style.left = myPosition.right + "px";

                
                let playerPosition = PlayerManager.ShipPosition();
                EventManager.OnCollisionEnter(myPosition, playerPosition, ()=>{  
                    PlayerManager.PowerUp();
                    powerUp.remove();
                    _afterUpdateClear(move);
                });
            };

            _afterUpdate(move);
        },
        PowerUpSpawner: () => {
            setInterval(()=>{
                if(GameManager.IsPaused()) return;
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
