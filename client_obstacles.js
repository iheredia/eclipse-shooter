(function () {
  var canvas = document.querySelector('#main-canvas');
  var ctx = canvas.getContext('2d');

  var activeObstacles;
  var step;
  function setInitialConditions() {
    step = 'initial'
    activeObstacles = [
      {
        position: { x: canvas.width * 5, y: - 100 },
        speed: { x: -5 },
        size: 30,
        rotation: 0,
        alive: true,
      },
      {
        position: { x: canvas.width * 5, y: 100 },
        speed: { x: -5 },
        size: 30,
        rotation: 0,
        alive: true,
      },
      {
        position: { x: canvas.width * 8, y: 0 },
        speed: { x: -5 },
        size: 30,
        rotation: 0,
        alive: true,
      }
    ];
    var registerCollisionEvent = new CustomEvent('game:register-collision-objects', { detail: { obstacles: activeObstacles } });
    window.dispatchEvent(registerCollisionEvent);
  }

  function setupEasyObstacles() {
    for (var i=0; i<200; i++) {
      var size = 20 + Math.random() * 20;
      activeObstacles.push({
        position: {
          x: canvas.width + Math.random() * canvas.width * 10,
          y: (Math.random() - 0.5) * canvas.height,
        },
        speed: { x: - 5 - 100/size },
        size: size,
        rotation: 0,
        alive: true,
      })
    }
    var registerCollisionEvent = new CustomEvent('game:register-collision-objects', { detail: { obstacles: activeObstacles } });
    window.dispatchEvent(registerCollisionEvent);
  }

  function setupMediumObstacles() {
    console.log('Medium obstacles');
  }

  function setupDifficultObstacles() {
    console.log('Difficult obstacles');
  }

  var nextStepFor = {
    initial: 'easy',
    easy: 'medium',
    medium: 'difficult',
    difficult: null
  }
  var setupStep = {
    'easy': setupEasyObstacles,
    'medium': setupMediumObstacles,
    'difficult': setupDifficultObstacles,
  };

  var updateStateTimeout;
  function updateState() {
    var allObstaclesWentBy = true;
    for (var i=0; i<activeObstacles.length; i++) {
      var obstacle = activeObstacles[i];
      obstacle.position.x += obstacle.speed.x;
      obstacle.rotation += 0.01;
      allObstaclesWentBy = allObstaclesWentBy && obstacle.position.x < -canvas.width;
    }
    if (allObstaclesWentBy) {
      step = nextStepFor[step];
      if (step) {
        setupStep[step]();
      }
    }
    if (step) {
      updateStateTimeout = setTimeout(updateState, 10);
    } else {
      // TODO: trigger boss
      var eclipseEvent = new CustomEvent('game:start-eclipse');
      window.dispatchEvent(eclipseEvent);
    }
  }

  function drawRoutine() {
    if (activeObstacles && activeObstacles.length) {
      ctx.fillStyle = '#509EB8';
      for (var i=0; i<activeObstacles.length; i++) {
        var obstacle = activeObstacles[i];
        ctx.translate(obstacle.position.x, obstacle.position.y);
        ctx.rotate(Math.PI/4 + obstacle.rotation);
        ctx.fillRect(-obstacle.size/2, -obstacle.size/2, obstacle.size, obstacle.size);
        ctx.rotate(-Math.PI/4);
        ctx.fillRect(-obstacle.size/2, -obstacle.size/2, obstacle.size, obstacle.size);
        ctx.rotate(-obstacle.rotation);
        ctx.translate(-obstacle.position.x, -obstacle.position.y);
      }
    }
  }
  var registerDrawRoutineEvent = new CustomEvent('game:draw-routine:add', { detail: { routine: drawRoutine } });
  window.dispatchEvent(registerDrawRoutineEvent);

  window.addEventListener('game:start', function () {
    setInitialConditions();
    clearTimeout(updateStateTimeout);
    updateState();
  });

  window.addEventListener('game:end', function () {
    clearTimeout(updateStateTimeout);
  });
})();
