//Les boutons "Pause" et "Réinitialisation"

document.getElementById("start_game").addEventListener("click", function () {

    document.getElementById('tetris').style.border = 'solid .2em #fff';
    document.getElementById('start_game').style.display = "none";

    document.getElementById('demo-img').style.display = "none";
    document.getElementById('restart_game').style.display = "block";

    // Bouton "Recommencer" 
    document.getElementById("restart_game").addEventListener("click", function () {
         window.location.reload();
     });
    document.getElementById("restart_game").addEventListener("click", function () {
        player.pos.y = 0;
        merge(arena, player);
        dropInterval = 500;
        document.getElementById('levels').innerText = "Level 1";
    });

    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');

    // ombre des pieces
    context.shadowColor = 'black';
    context.shadowOffsetX = 0.5;
    context.shadowOffsetY = 0.5;

    // echelle
    context.scale(20, 20);

    
    // Les Fonctions 

    //enlever les lignes completes
    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }

            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;

            player.score += rowCount * 10;
            rowCount *= 2;
        }
    };

    // collision
    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];

        // verification s'il y a colision
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                // verifie la position du joueur
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {

                    return true;
                }
            }
        }
        // pas de colision
        return false;
    };

    // création d'une matrice avec les tailles de la pièce
    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    };
    // dessin de la piece
    function draw() {
        context.fillStyle = '#e3e3e3';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(arena, {
            x: 0,
            y: 0
        });
        drawMatrix(player.matrix, player.pos);
    }

    // création des différentes pièces du jeu
    function createPiece(type) {
        if (type === 'I') {
            return [
            // BARRE
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
        } else if (type === 'L') {
            return [
            // LE "L"
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
        } else if (type === 'J') {
            return [
            // LE "L" INVERSE
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
        } else if (type === 'O') {
            return [
            // LE CARRE
            [4, 4],
            [4, 4],
        ];
        } else if (type === 'Z') {
            return [
            // LA FORME DU "Z"
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
        } else if (type === 'S') {
            return [
            //LA FORME DU "S"
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
        } else if (type === 'T') {
            return [
            // LA FORME DU "T"
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
        }
    };

    // Permet d'afficher la pièce avec son déplacement
    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                // On vérifie que la valeur n'est pas égale à 0
                if (value !== 0) {
                    // On dessine la pièce
                    context.fillStyle = colors[value];
                    // On dessine une forme à partir des valeurs x et y , puis on définit la largeur et la hauteur= 1
                    context.fillRect(x +
                        offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    };

    const arena = createMatrix(12, 20);
    // On appelle la fonction de dessin des pièces
    const player = {
        pos: {
            x: 0,
            y: 0
        },
        matrix: null,
        score: 0,
    };

    // calcule la position du joueur
    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            // On récupère les positions
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    };

    // Rotation des pièces
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);

        // modification du comportement de la pièce en fonction des obstacles
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    //rotation
    //on intervertie les colonnes pour simuler la rotation
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
            }
        }
        //verification de la direction et rotation 
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    //on empeche la pièce de sortir de l'"arène" (zone de jeu)
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    };

    // affichage des pièces aléatoirement
    function playerReset() {
        const pieces = 'TJLOSZI';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) -
            (player.matrix[0].length / 2 | 0);

        // on reset si tout est rempli
        if (collide(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
            dropInterval = 500;
            document.getElementById('levels').innerText = "Level 1";
        }
    }
    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    }

    let dropCounter = 0;
    let dropInterval = 500;// temps entre chaque mouvement vers le bas de la piece en ms

    // pause du jeu
    document.getElementById("pause_game").addEventListener("click", function () {
        dropInterval = 2000000;
        document.getElementById('pause_game').style.display = "none";
        document.getElementById('continue_game').style.display = "block";
    });

    // dépause du jeu
    document.getElementById("continue_game").addEventListener("click", function () {
        dropInterval = 200;
        document.getElementById('pause_game').style.display = "block";
        document.getElementById('continue_game').style.display = "none";
    });

    let lastTime = 0;

    function update(time = 0) {
        //update du timer
        const deltaTime = time - lastTime;
        lastTime = time;
        // on incrémente la donnée du timer
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            // On déplace la pièce
            // On rétablit à 0
            
            playerDrop();
        };

        draw();
        requestAnimationFrame(update);
    };
//liste des différentes couleurs des pièces
    let colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

    function updateScore() {
        document.getElementById('score').innerText = player.score;

        // vérification du score pour réguler la difficulté
        const scoring = document.getElementById('score');
        const textScore = scoring.textContent;
        const numberScore = Number(textScore);

        // Level 2
        if (numberScore >= 100) {
            dropInterval = 400;
            document.getElementById('levels').innerText = "Level 2";
        }
        // Level 3
        if (numberScore >= 200) {
            dropInterval = 300;
            document.getElementById('levels').innerText = "Level 3";
        }
        // On vérifie que le score est supérieur à 300 pour augmenter ensuite la vitesse du jeu
        if (numberScore >= 300) {
            dropInterval = 200;
            document.getElementById('levels').innerText = "Level 4";
        }
        // On vérifie que le score est supérieur à 400 pour augmenter ensuite la vitesse du jeu
        if (numberScore >= 400) {
            dropInterval = 100;
            document.getElementById('levels').innerText = "Level 5";
        }

    }

    //les touches

document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
      playerMove(-1);
  } else if (event.keyCode === 39) {
      playerMove(1);
  } else if (event.keyCode === 40) {
      playerDrop();
  }

  // La touche "X" permet de faire une rotation à gauche
  else if (event.keyCode === 88) {
      playerRotate(-1);
  }
  // La touche "W" permet de faire une rotation à droite
  else if (event.keyCode === 87) {
      playerRotate(1);
  }
});


    // Bouton de déplacement vers la gauche
    document.getElementById("arrow-left").addEventListener("click", function () {
        playerMove(-1);
    });

    // Bouton de déplacement vers la droite
    document.getElementById("arrow-right").addEventListener("click", function () {
        playerMove(1);
    });

    // Bouton de rotation des pièces
    document.getElementById("rotate_piece").addEventListener("click", function () {
        playerRotate(1);
    });

    // Bouton de déplacement vers le bas
    document.getElementById("arrow-down").addEventListener("click", function () {
        playerDrop();
    });

    playerReset();
    updateScore();
    update();

});


